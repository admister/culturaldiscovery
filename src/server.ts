import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
  isMainModule,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { GoogleGenAI, Type } from "@google/genai";
import { FALLBACK_PATHS } from './server-fallback.js';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Parse JSON request bodies
app.use(express.json());

/**
 * CulturePath AI Endpoint: Generates cultural itineraries, sensory story narratives,
 * and geographic coordinates for story node mapping.
 */
app.post('/api/culture', async (req, res) => {
  try {
    const { location } = req.body;
    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({ error: 'Location query is required.' });
    }

    // Security: Validate maximum query length to prevent abuse or prompt injection attacks
    if (location.length > 80) {
      return res.status(400).json({ error: 'Location query is too long. Maximum allowed length is 80 characters.' });
    }

    // Security: Sanitize the query to keep only safe characters (alphanumeric, spaces, commas, hyphens, periods)
    const sanitizedLocation = location.replace(/[^a-zA-Z0-9\s,.-]/g, '').trim();
    if (!sanitizedLocation) {
      return res.status(400).json({ error: 'Location query contains invalid or unsafe characters.' });
    }

    const norm = sanitizedLocation.toLowerCase();

    // Check pre-defined fallback keys
    let matchedKey = '';
    if (norm.includes('kyoto') || norm.includes('japan')) {
      matchedKey = 'kyoto';
    } else if (norm.includes('paris') || norm.includes('france')) {
      matchedKey = 'paris';
    } else if (norm.includes('cairo') || norm.includes('egypt')) {
      matchedKey = 'cairo';
    } else if (norm.includes('rio') || norm.includes('brazil') || norm.includes('janeiro')) {
      matchedKey = 'rio';
    }

    const apiKey = process.env['GEMINI_API_KEY'] || '';
    const hasRealKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10;

    if (!hasRealKey) {
      console.log(`[CulturePath Backend] No real GEMINI_API_KEY detected. Serving fallback response for location: "${location}"`);
      const fallbackData = FALLBACK_PATHS[matchedKey || 'kyoto'];
      return res.json({
        ...fallbackData,
        _isFallback: true,
        _apiKeyMissing: true,
        _matchedFallback: !!matchedKey
      });
    }

    // Call Gemini API
    console.log(`[CulturePath Backend] Calling Gemini API for location: "${location}"`);
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide travel and cultural insights for the location: "${location}".`,
      config: {
        systemInstruction: `You are the "CulturePath" Cultural Concierge. Your mission is to provide authentic, immersive travel data for a location provided by the user.
If the location provided by the user represents an unrecognized, fictitious, gibberish, or invalid geographic place on Earth, you MUST set the 'invalid_location' field to true in the returned JSON structure.
You MUST provide coordinates (lat, lng) for the central location (usually the city center) and a rich list of 8 to 10 cultural nodes across different categories (one of: 'attraction', 'hidden_gem', 'heritage', 'food', 'shopping', 'event') for Leaflet mapping.
Crucially, you MUST include at least 3 'attraction' nodes (famous landmarks) and at least 3 'hidden_gem' nodes (off-the-beaten-path secrets) in the 'nodes' array, and they must have accurate, authentic coordinates and descriptions.
Ensure that the output strictly adheres to the requested JSON schema. Do not include markdown codeblocks or extra text; return ONLY the valid JSON object.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location_name: { type: Type.STRING },
            invalid_location: { type: Type.BOOLEAN, description: "Set to true ONLY if the requested location represents an unrecognized, fictitious, empty, gibberish, or invalid geographic place on Earth." },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER, description: "Latitude of the central location" },
                lng: { type: Type.NUMBER, description: "Longitude of the central location" }
              },
              required: ["lat", "lng"]
            },
            immersive_story: { type: Type.STRING, description: "A 3-4 sentence narrative covering the essence of the place, folklore, and sensory details." },
            links: {
              type: Type.OBJECT,
              properties: {
                attractions: { type: Type.STRING, description: "Detailed description of top site" },
                hidden_gems: { type: Type.STRING, description: "Off-the-beaten-path recommendation" },
                heritage: { type: Type.STRING, description: "Historical context" },
                local_events: { type: Type.STRING, description: "Current/typical local gathering" },
                authentic_food: { type: Type.STRING, description: "Specific local dish and why it matters" },
                cultural_experience: { type: Type.STRING, description: "How to engage respectfully" },
                shopping: { type: Type.STRING, description: "Local artisan product to buy" }
              },
              required: ["attractions", "hidden_gems", "heritage", "local_events", "authentic_food", "cultural_experience", "shopping"]
            },
            nodes: {
              type: Type.ARRAY,
              description: "Specific geographic points of interest in this location corresponding to the cultural categories, for Leaflet mapping.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Name of the landmark or venue" },
                  type: { type: Type.STRING, description: "One of: 'attraction', 'hidden_gem', 'heritage', 'food', 'shopping', 'event'" },
                  description: { type: Type.STRING, description: "Short 1-2 sentence sensory or historical description" },
                  lat: { type: Type.NUMBER, description: "Latitude" },
                  lng: { type: Type.NUMBER, description: "Longitude" }
                },
                required: ["title", "type", "description", "lat", "lng"]
              }
            },
            impact_note: { type: Type.STRING, description: "A 1-sentence explanation of why visiting this location supports the local community." },
            quick_tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 quick tips for visiting"
            }
          },
          required: ["location_name", "coordinates", "immersive_story", "links", "nodes", "impact_note", "quick_tips"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty text response');
    }

    const data = JSON.parse(text);
    return res.json(data);

  } catch (err) {
    console.error('[CulturePath Backend] Error generating cultural insights:', err);
    
    // Graceful fallback to rich curated mock datasets
    const { location } = req.body;
    const norm = (location || '').toLowerCase().trim();
    let matchedKey = '';
    if (norm.includes('kyoto') || norm.includes('japan')) matchedKey = 'kyoto';
    else if (norm.includes('paris') || norm.includes('france')) matchedKey = 'paris';
    else if (norm.includes('cairo') || norm.includes('egypt')) matchedKey = 'cairo';
    else if (norm.includes('rio') || norm.includes('brazil')) matchedKey = 'rio';

    const fallbackData = FALLBACK_PATHS[matchedKey || 'kyoto'];
    const errMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.json({
      ...fallbackData,
      _isFallback: true,
      _error: errMessage || 'Failed to contact Gemini API. Serving fallback/cached content.',
      _matchedFallback: !!matchedKey
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 3000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

