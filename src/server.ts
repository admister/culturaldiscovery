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
Each node in 'nodes' MUST include:
- 'etiquette_tips': specific advice on local manners or social taboos for this specific node.
- 'historical_context': brief historical context describing what this exact spot looked like 100 or 500 years ago in the past.
- 'vibe': a category-defining sentiment or atmosphere, e.g. 'Quiet & Reflective', 'Bustling & Energetic', 'Artisan & Creative', 'Sacred & Spiritual', or 'Spirited & Lively'.
You MUST also provide location-specific 'emergency_contacts' (local police, medical, tourist helpline, and safety tips) and a 'marketplace' containing 3 or 4 local traditional souvenirs, craft recommendations, or local heritage walks/guides.
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
                  lng: { type: Type.NUMBER, description: "Longitude" },
                  etiquette_tips: { type: Type.STRING, description: "Context-specific etiquette or Local Manners advice for visitors here." },
                  historical_context: { type: Type.STRING, description: "Description of what this location looked like 100 or 500 years ago (Then vs Now)." },
                  vibe: { type: Type.STRING, description: "Dominant cultural sentiment, e.g. 'Quiet & Reflective', 'Bustling & Energetic', 'Artisan & Creative', or 'Sacred & Spiritual'." }
                },
                required: ["title", "type", "description", "lat", "lng", "etiquette_tips", "historical_context", "vibe"]
              }
            },
            impact_note: { type: Type.STRING, description: "A 1-sentence explanation of why visiting this location supports the local community." },
            quick_tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 quick tips for visiting"
            },
            emergency_contacts: {
              type: Type.OBJECT,
              properties: {
                police: { type: Type.STRING, description: "Local police phone number" },
                medical: { type: Type.STRING, description: "Local medical or hospital helpline number" },
                tourist_helpline: { type: Type.STRING, description: "Tourist helpline or safety office number" },
                tips: { type: Type.STRING, description: "A quick, specific local safety advice, e.g. pickpockets alerts or local scam warnings." }
              },
              required: ["police", "medical", "tourist_helpline", "tips"]
            },
            marketplace: {
              type: Type.ARRAY,
              description: "Traditional crafts, local artisan items, traditional walks, or sovereign suggestions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  item_name: { type: Type.STRING, description: "Name of craft, shop, bazaar, or heritage tour" },
                  description: { type: Type.STRING, description: "Deep description highlighting its cultural history and artisanal background" },
                  price_estimate: { type: Type.STRING, description: "Typical price range estimate in local currency/USD" },
                  location_tip: { type: Type.STRING, description: "Where is the best authentic source to purchase or book this" }
                },
                required: ["item_name", "description", "price_estimate", "location_tip"]
              }
            }
          },
          required: ["location_name", "coordinates", "immersive_story", "links", "nodes", "impact_note", "quick_tips", "emergency_contacts", "marketplace"]
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
 * Endpoint for Memory Journaling / Digital Keepsake:
 * Generates an evocative 5-paragraph Cultural Travelogue using visited landmarks and user notes.
 */
app.post('/api/travelogue', async (req, res) => {
  try {
    const { location, visits } = req.body;
    if (!visits || !Array.isArray(visits) || visits.length === 0) {
      return res.status(400).json({ error: 'Visits list is required to generate a travelogue.' });
    }

    const apiKey = process.env['GEMINI_API_KEY'] || '';
    const hasRealKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10;

    if (!hasRealKey) {
      console.log(`[CulturePath Backend] No real GEMINI_API_KEY. Producing offline pre-crafted travelogue narrative for "${location || 'destination'}"`);
      const visitedTitles = visits.map(v => v.title).join(', ');
      const userReflections = visits.map(v => v.note ? `"${v.note}"` : '').filter(Boolean).join('; ');
      
      const offlineTravelogue = `## My Journey of Discovery in ${location || 'CulturePath'}
      
Today was an unforgettable exploration across some of the most profound cultural veins of the region. My steps led me through **${visitedTitles}**, weaving a deep, narrative-driven experience. Each stop felt like turning the pages of an ancient parchment, connecting the legends of the past to the living breath of the present.

At these sacred sites, the air was heavy with stories. The visual and spiritual contrasts were immense—from historic architecture weathered by centuries to the bustling energy of local guardians. I found myself reflecting on the resilience of these cultural practices, noting how local artisans and caretakers carry their lineages forward with immense pride.

One of the most moving aspects was feeling the distinct vibe of each location. Some places offered quiet sanctuaries for silent introspection, while others were vibrant hubs of creativity and commerce. Engaging with these spaces respectfully, keeping mindful of local etiquette, opened doors to subtle details I would have otherwise missed.

Integrating my personal reflections: ${userReflections || 'taking quiet moments to absorb the surrounding sounds and details'} made this journey uniquely mine. It is more than just travel; it is a personal keepsake of connections, bridging my own story with the enduring history of this beautiful corner of the world.

As the sun sets over this magnificent region, I realize that the true value of exploration lies in these silent connections. These memories remain etched as a digital keepsake of a day well-spent in the pursuit of cultural wisdom and respectful preservation.`;

      return res.json({ travelogue: offlineTravelogue });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const visitsSummary = visits.map(v => `- Landmark/Site: "${v.title}". Personal keepsake note: "${v.note || 'No custom note added.'}"`).join('\n');
    const prompt = `Create a beautiful, highly engaging, and narrative-driven 5-paragraph "Cultural Travelogue" summary based on these sites the user visited today in "${location || 'the area'}":
\n${visitsSummary}\n
Your writing must focus on the cultural connections, atmosphere, historical contrasts, and their personal reflections. Format the response beautifully using Markdown with clear spacing.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an award-winning travel writer and cultural historian. You weave beautiful, evocative, and deep narratives that capture the soul of a place, its heritage, and the traveler's personal connection to it. Do not use generic cliches. Write exactly 5 paragraphs in markdown.",
      }
    });

    return res.json({ travelogue: response.text });
  } catch (err) {
    console.error('[CulturePath Backend] Error generating travelogue:', err);
    return res.status(500).json({ error: 'Failed to synthesize travelogue. ' + (err instanceof Error ? err.message : '') });
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

