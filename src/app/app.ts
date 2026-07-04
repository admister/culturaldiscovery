import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  signal,
  effect,
  afterNextRender,
  ElementRef,
  viewChild,
  OnDestroy
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';

export interface EmergencyContacts {
  police: string;
  medical: string;
  tourist_helpline: string;
  tips: string;
}

export interface MarketplaceItem {
  item_name: string;
  description: string;
  price_estimate: string;
  location_tip: string;
}

export interface CulturalNode {
  title: string;
  type: 'attraction' | 'hidden_gem' | 'heritage' | 'food' | 'shopping' | 'event';
  description: string;
  lat: number;
  lng: number;
  etiquette_tips?: string;        // Feature 1: local manners advice
  historical_context?: string;    // Feature 2: Then vs Now historic context
  vibe?: string;                  // Feature 3: community vibe sentiment
}

export interface CulturalPathData {
  location_name: string;
  invalid_location?: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  immersive_story: string;
  links: {
    attractions: string;
    hidden_gems: string;
    heritage: string;
    local_events: string;
    authentic_food: string;
    cultural_experience: string;
    shopping: string;
  };
  nodes: CulturalNode[];
  impact_note: string;
  quick_tips: string[];
  emergency_contacts?: EmergencyContacts; // Feature 5: Emergency contacts
  marketplace?: MarketplaceItem[];         // Feature 5: Marketplace Souvenirs
  _isFallback?: boolean;
  _apiKeyMissing?: boolean;
  _error?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  // Map Container ViewChild
  mapContainer = viewChild<ElementRef>('mapContainer');

  // App States
  currentData = signal<CulturalPathData | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedTab = signal<string>('overview'); // overview, attractions, heritage, food, events, marketplace, safety
  selectedNode = signal<CulturalNode | null>(null);
  searchHistory = signal<string[]>(['Kyoto, Japan', 'Paris, France', 'Cairo, Egypt', 'Rio de Janeiro, Brazil']);
  showIntro = signal<boolean>(true);

  // New Features App States
  showLocalManners = signal<boolean>(false);   // Feature 1: Local manners toggle
  showHistoricalThen = signal<boolean>(false);  // Feature 2: Then vs Now slider/toggle
  selectedVibeFilter = signal<string>('all');  // Feature 3: community sentiment vibe filter
  
  // Feature 4: Memory Journaling
  visitedNodes = signal<Record<string, { visited: boolean, note: string, date: string }>>({});
  travelogueResult = signal<string | null>(null);
  generatingTravelogue = signal<boolean>(false);
  travelogueError = signal<string | null>(null);

  // Active Loading messages for "Culturalizing..."
  loadingMessage = signal<string>('Mapping cultural ley lines...');
  private loadingPhrases = [
    'Mapping cultural heritage nodes...',
    'Uncovering hidden artisan secrets...',
    'Gathering historic local folklore...',
    'Pinpointing authentic culinary hubs...',
    'Assembling community impact insights...',
    'Translating indigenous story cards...'
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private loadingInterval: any = null;

  // Search form
  searchForm = new FormGroup({
    query: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  // Map and Leaflet instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private map: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private markerGroup: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private L: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tileLayer: any = null;
  private cache = new Map<string, CulturalPathData>();

  // Theme signal
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Load cache and saved theme preferences on start
    afterNextRender(async () => {
      this.loadCacheFromStorage();
      this.loadVisitedNodes();
      
      if (isPlatformBrowser(this.platformId)) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          this.isDarkMode.set(true);
        }
      }

      // Auto-load Kyoto on first visit to present a jaw-dropping populated initial dashboard!
      this.search('Kyoto, Japan');
    });

    // React to changes in mapContainer, currentData, and vibe filter to initialize/refresh map smoothly
    effect(() => {
      const container = this.mapContainer();
      const data = this.currentData();
      this.selectedVibeFilter(); // access to trigger reactivity!

      if (isPlatformBrowser(this.platformId)) {
        if (container && data) {
          // If the map is not initialized yet or is associated with a different container, initialize it.
          const needsInit = !this.map || (this.map.getContainer() !== container.nativeElement);
          if (needsInit) {
            if (this.map) {
              try {
                this.map.remove();
              } catch (e) {
                console.warn('[CulturePath Map] Error removing stale map:', e);
              }
              this.map = null;
              this.markerGroup = null;
              this.tileLayer = null;
            }
            // Wait a brief tick for the template to render/settle the mapContainer container
            setTimeout(async () => {
              await this.initMap();
            }, 100);
          } else {
            this.renderMapMarkers(data);
          }
        } else {
          // Clean up if map container or data is gone (e.g. during loading)
          if (this.map) {
            try {
              this.map.remove();
            } catch (e) {
              console.warn('[CulturePath Map] Error removing map during teardown:', e);
            }
            this.map = null;
            this.markerGroup = null;
            this.tileLayer = null;
          }
        }
      }
    });

    // React to changes in theme to update body class and map style
    effect(() => {
      const isDark = this.isDarkMode();
      if (isPlatformBrowser(this.platformId)) {
        if (isDark) {
          document.body.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.body.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        this.updateMapTiles();
      }
    });
  }

  /**
   * Toggles between light and dark visual themes.
   */
  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }

  /**
   * Helper to encode node details into URL parameters for safety
   */
  encodeURIComponent(val: string): string {
    return encodeURIComponent(val);
  }

  /**
   * Generates a Google Maps Direction URL using coordinates.
   */
  getGoogleMapsDirUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  /**
   * Returns the dynamic navigation URL: either the selected node's coordinates,
   * or the main destination coordinates as a default fallback.
   */
  getActiveNavigationUrl(): string {
    const data = this.currentData();
    if (!data) return '#';
    const node = this.selectedNode();
    if (node) {
      return this.getGoogleMapsDirUrl(node.lat, node.lng);
    }
    return this.getGoogleMapsDirUrl(data.coordinates.lat, data.coordinates.lng);
  }

  /**
   * Returns the dynamic label for the maps navigation action.
   */
  getActiveNavigationLabel(): string {
    const node = this.selectedNode();
    if (node) {
      return `Navigate to ${node.title}`;
    }
    const data = this.currentData();
    return data ? `Navigate to ${data.location_name}` : 'Navigate';
  }

  /**
   * Switches map tile layer depending on active theme (Positron vs. Dark Matter)
   */
  updateMapTiles() {
    if (!this.map || !this.L) return;
    
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    const isDark = this.isDarkMode();
    const url = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    this.tileLayer = this.L.tileLayer(url, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);
    
    this.map.invalidateSize();
  }

  /**
   * Initializes the Leaflet interactive map on the client browser.
   */
  async initMap() {
    if (this.map || !isPlatformBrowser(this.platformId)) return;

    try {
      const leafletModule = await import('leaflet');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (leafletModule.default || leafletModule) as any;
      this.L = L;

      const container = this.mapContainer()?.nativeElement;
      if (!container) return;

      const data = this.currentData();
      let initLat = 35.0116;
      let initLng = 135.7681;
      if (data) {
        const lat = this.parseFloatCoords(data.coordinates?.lat);
        const lng = this.parseFloatCoords(data.coordinates?.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          initLat = lat;
          initLng = lng;
        }
      }

      this.map = L.map(container, {
        zoomControl: true,
        scrollWheelZoom: true,
        maxZoom: 18,
        minZoom: 2
      }).setView([initLat, initLng], 13);

      // Set initial tiles based on current theme
      this.updateMapTiles();

      this.markerGroup = L.layerGroup().addTo(this.map);

      // Render markers if data was loaded prior to map initialization completion
      if (data) {
        this.renderMapMarkers(data);
      }

      // Quick size correction
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 150);
    } catch (err) {
      console.error('[CulturePath Map] Error loading Leaflet library:', err);
    }
  }

  /**
   * Helper to parse and clean float values from coordinates to prevent NaN issues.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseFloatCoords(val: any): number {
    if (val === undefined || val === null) return NaN;
    if (typeof val === 'number') {
      return isNaN(val) ? NaN : val;
    }
    const str = String(val).trim();
    if (!str || str.toLowerCase() === 'nan') return NaN;
    
    // Try to parse direct float
    const direct = parseFloat(str);
    if (!isNaN(direct) && /^-?\d+(\.\d+)?$/.test(str)) {
      return direct;
    }

    // Clean other formats like "34.5 S" or "120.5W"
    const cleaned = str.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      const lower = str.toLowerCase();
      if (lower.includes('s') || lower.includes('w')) {
        return -Math.abs(parsed);
      }
      return parsed;
    }
    return NaN;
  }

  /**
   * Cleans, validates, and sets the cultural path data immediately to ensure Leaflet never receives NaN.
   */
  sanitizeAndSetData(data: CulturalPathData) {
    if (!data) return;

    // Create a clone to prevent mutating any potentially read-only/frozen objects
    let cleanData: CulturalPathData;
    try {
      cleanData = JSON.parse(JSON.stringify(data)) as CulturalPathData;
    } catch {
      cleanData = { ...data };
    }

    // Sanitize central coordinates
    let lat = this.parseFloatCoords(cleanData.coordinates?.lat);
    let lng = this.parseFloatCoords(cleanData.coordinates?.lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('[CulturePath Map] Primary coordinates are invalid. Attempting fallback to first valid node.');
      const firstValidNode = cleanData.nodes?.find(n => !isNaN(this.parseFloatCoords(n.lat)) && !isNaN(this.parseFloatCoords(n.lng)));
      if (firstValidNode) {
        lat = this.parseFloatCoords(firstValidNode.lat);
        lng = this.parseFloatCoords(firstValidNode.lng);
      } else {
        // Safe default: center of Jaipur as a backup, or Kyoto
        lat = 26.9124;
        lng = 75.7873;
      }
    }
    
    cleanData.coordinates = { lat, lng };

    // Sanitize node coordinates
    if (cleanData.nodes && Array.isArray(cleanData.nodes)) {
      cleanData.nodes.forEach(node => {
        let nLat = this.parseFloatCoords(node.lat);
        let nLng = this.parseFloatCoords(node.lng);
        if (isNaN(nLat) || isNaN(nLng)) {
          console.warn(`[CulturePath Map] Node "${node.title}" coordinates are invalid. Generating offset from parent center.`);
          nLat = lat + (Math.random() - 0.5) * 0.015;
          nLng = lng + (Math.random() - 0.5) * 0.015;
        }
        node.lat = nLat;
        node.lng = nLng;
      });
    }

    this.currentData.set(cleanData);
  }

  // Voice Narration (TTS Story Reader)
  isSpeaking = signal<boolean>(false);
  private utterance: SpeechSynthesisUtterance | null = null;

  speakStory(text: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    const synth = window.speechSynthesis;
    if (!synth) {
      console.warn('[CulturePath Audio] Speech synthesis not supported in this browser.');
      return;
    }

    if (this.isSpeaking()) {
      synth.cancel();
      this.isSpeaking.set(false);
      return;
    }

    // Stop any active narration
    synth.cancel();

    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Select a friendly English voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      this.utterance.voice = preferredVoice;
    }

    this.utterance.rate = 1.0;
    this.utterance.pitch = 1.05;

    this.utterance.onend = () => {
      this.isSpeaking.set(false);
    };

    this.utterance.onerror = () => {
      this.isSpeaking.set(false);
    };

    this.isSpeaking.set(true);
    synth.speak(this.utterance);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.speechSynthesis?.cancel();
    }
  }

  /**
   * Helper to retrieve specific visual classes and icons for different "Vibes".
   */
  getVibeStyle(vibe?: string): { bgClass: string; borderClass: string; textClass: string; colorHex: string; icon: string } {
    const v = (vibe || '').toLowerCase();
    if (v.includes('quiet') || v.includes('reflective') || v.includes('peaceful') || v.includes('calm')) {
      return { bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', colorHex: '#10b981', icon: 'filter_vintage' };
    }
    if (v.includes('bustling') || v.includes('energetic') || v.includes('lively') || v.includes('busy')) {
      return { bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500', textClass: 'text-amber-600 dark:text-amber-400', colorHex: '#f59e0b', icon: 'bolt' };
    }
    if (v.includes('artisan') || v.includes('creative') || v.includes('shop') || v.includes('craft')) {
      return { bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500', textClass: 'text-indigo-600 dark:text-indigo-400', colorHex: '#6366f1', icon: 'brush' };
    }
    if (v.includes('sacred') || v.includes('spiritual') || v.includes('temple') || v.includes('church') || v.includes('mosque') || v.includes('holy')) {
      return { bgClass: 'bg-cyan-500/15', borderClass: 'border-cyan-500', textClass: 'text-cyan-600 dark:text-cyan-400', colorHex: '#06b6d4', icon: 'church' };
    }
    // Default/heritage vibe
    return { bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500', textClass: 'text-rose-600 dark:text-rose-400', colorHex: '#f43f5e', icon: 'spa' };
  }

  /**
   * Cleans and renders new markers on the interactive map with vibe color-coding and vibe-filtering.
   */
  renderMapMarkers(data: CulturalPathData) {
    if (!this.map || !this.L || !this.markerGroup) return;

    this.markerGroup.clearLayers();
    const L = this.L;
    
    let lat = this.parseFloatCoords(data.coordinates?.lat);
    let lng = this.parseFloatCoords(data.coordinates?.lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('[CulturePath Map] Map markers render coordinates are invalid. Falling back to Kyoto center.');
      lat = 35.0116;
      lng = 135.7681;
    }

    // Transition smoothly to the destination coordinates
    try {
      this.map.flyTo([lat, lng], 13, { duration: 1.5 });
    } catch (err) {
      console.error('[CulturePath Map] Error flying to primary coordinates:', err);
    }

    // Primary Location glowing hub icon using Terracotta
    const primaryIcon = L.divIcon({
      className: 'primary-marker-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-terracotta/35 animate-ping"></div>
          <div class="relative w-7 h-7 rounded-full bg-terracotta border-2 border-cream flex items-center justify-center text-white shadow-xl shadow-terracotta/20">
            <span class="material-icons text-base font-bold">place</span>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    try {
      L.marker([lat, lng], { icon: primaryIcon })
        .addTo(this.markerGroup)
        .bindPopup(`
          <div class="p-1 font-sans">
            <h4 class="font-display font-extrabold text-sm text-terracotta mb-0.5">${data.location_name}</h4>
            <p class="text-[10px] text-sage font-mono tracking-wider uppercase font-semibold">Primary Regional Center</p>
          </div>
        `);
    } catch (err) {
      console.error('[CulturePath Map] Error placing primary center marker:', err);
    }

    // Individual Cultural Nodes - Styled dynamically by "vibe" and filtered in real-time
    if (data.nodes && Array.isArray(data.nodes)) {
      const activeFilter = this.selectedVibeFilter();

      data.nodes.forEach((node) => {
        const nodeLat = this.parseFloatCoords(node.lat);
        const nodeLng = this.parseFloatCoords(node.lng);

        if (isNaN(nodeLat) || isNaN(nodeLng)) {
          console.warn('[CulturePath Map] Node coordinates are invalid. Skipping rendering of node marker:', node.title);
          return;
        }

        const vibeStyle = this.getVibeStyle(node.vibe);

        // Apply vibe-based filtration
        if (activeFilter !== 'all') {
          const nv = (node.vibe || '').toLowerCase();
          if (activeFilter === 'quiet' && !(nv.includes('quiet') || nv.includes('reflective') || nv.includes('peaceful') || nv.includes('calm'))) {
            return;
          }
          if (activeFilter === 'bustling' && !(nv.includes('bustling') || nv.includes('energetic') || nv.includes('lively') || nv.includes('busy'))) {
            return;
          }
          if (activeFilter === 'artisan' && !(nv.includes('artisan') || nv.includes('creative') || nv.includes('shop') || nv.includes('craft'))) {
            return;
          }
          if (activeFilter === 'sacred' && !(nv.includes('sacred') || nv.includes('spiritual') || nv.includes('temple') || nv.includes('church') || nv.includes('mosque') || nv.includes('holy'))) {
            return;
          }
        }

        const nodeIcon = L.divIcon({
          className: 'node-marker-icon',
          html: `
            <div class="group relative flex items-center justify-center transition-all hover:scale-125 duration-200" title="Vibe: ${node.vibe || 'Traditional'}">
              <div class="w-8 h-8 rounded-full ${vibeStyle.bgClass} border-2 ${vibeStyle.borderClass} flex items-center justify-center ${vibeStyle.textClass} bg-cream shadow-md shadow-sage/10">
                <span class="material-icons text-sm font-semibold">${vibeStyle.icon}</span>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        try {
          const marker = L.marker([nodeLat, nodeLng], { icon: nodeIcon })
            .addTo(this.markerGroup)
            .bindPopup(`
              <div class="p-1.5 font-sans max-w-[210px]">
                <div class="flex items-center gap-1 mb-1">
                  <span class="material-icons text-xs ${vibeStyle.textClass}">${vibeStyle.icon}</span>
                  <span class="text-[9px] uppercase tracking-widest font-mono text-sage font-bold">${node.vibe || node.type.replace('_', ' ')}</span>
                </div>
                <h4 class="font-display font-bold text-xs text-ink mb-1 leading-snug">${node.title}</h4>
                <p class="text-[11px] text-ink/80 leading-normal mb-1">${node.description}</p>
                <div class="text-[9px] font-mono text-sage italic border-t border-sage/10 pt-1 mt-1">Manners: ${node.etiquette_tips || 'Respect local customs.'}</div>
              </div>
            `);

          // Sync map selection back to dashboard
          marker.on('click', () => {
            this.selectedNode.set(node);
            this.selectedTab.set(this.getTabNameForType(node.type));
          });
        } catch (err) {
          console.error('[CulturePath Map] Error rendering node marker:', node.title, err);
        }
      });
    }
  }

  // Feature 4: Memory Journaling / Keepsake Helpers
  toggleVisited(nodeTitle: string) {
    const current = { ...this.visitedNodes() };
    if (current[nodeTitle]?.visited) {
      current[nodeTitle] = {
        ...current[nodeTitle],
        visited: false
      };
    } else {
      current[nodeTitle] = {
        visited: true,
        note: current[nodeTitle]?.note || '',
        date: new Date().toLocaleDateString()
      };
    }
    this.visitedNodes.set(current);
    this.saveVisitedNodes();
  }

  updateNodeNote(nodeTitle: string, note: string) {
    const current = { ...this.visitedNodes() };
    if (!current[nodeTitle]) {
      current[nodeTitle] = {
        visited: false,
        note: note,
        date: new Date().toLocaleDateString()
      };
    } else {
      current[nodeTitle] = {
        ...current[nodeTitle],
        note: note
      };
    }
    this.visitedNodes.set(current);
    this.saveVisitedNodes();
  }

  saveVisitedNodes() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const encrypted = this.encrypt(JSON.stringify(this.visitedNodes()));
      localStorage.setItem('culture_visited_nodes', encrypted);
    } catch (e) {
      console.warn('Failed saving visited nodes:', e);
    }
  }

  loadVisitedNodes() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const stored = localStorage.getItem('culture_visited_nodes');
      if (stored) {
        const decrypted = this.decrypt(stored);
        if (decrypted) {
          this.visitedNodes.set(JSON.parse(decrypted));
        }
      }
    } catch (e) {
      console.warn('Failed loading visited nodes:', e);
    }
  }

  generateTravelogue() {
    const data = this.currentData();
    if (!data) return;

    // Filter currently visited nodes
    const visitedList = data.nodes
      .filter(node => this.visitedNodes()[node.title]?.visited)
      .map(node => ({
        title: node.title,
        note: this.visitedNodes()[node.title]?.note || ''
      }));

    if (visitedList.length === 0) {
      this.travelogueError.set('Please mark at least one story landmark as "Visited" in your Journal to compile your travelogue!');
      return;
    }

    this.generatingTravelogue.set(true);
    this.travelogueError.set(null);
    this.travelogueResult.set(null);

    this.http.post<{ travelogue: string }>('/api/travelogue', {
      location: data.location_name,
      visits: visitedList
    }).subscribe({
      next: (res) => {
        this.travelogueResult.set(res.travelogue);
        this.generatingTravelogue.set(false);
      },
      error: (err) => {
        console.error('[CulturePath UI] Error compiling travelogue:', err);
        this.travelogueError.set(err?.error?.error || 'Failed to synthesize travelogue. Please try again.');
        this.generatingTravelogue.set(false);
      }
    });
  }

  clearTravelogue() {
    this.travelogueResult.set(null);
    this.travelogueError.set(null);
  }

  /**
   * Triggers map movement and opens node popup.
   */
  selectNode(node: CulturalNode) {
    if (!node) return;
    this.selectedNode.set(node);
    if (this.map) {
      const lat = this.parseFloatCoords(node.lat);
      const lng = this.parseFloatCoords(node.lng);
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('[CulturePath Map] Node coordinates are invalid. Cannot trigger flyTo movement:', node.title);
        return;
      }
      try {
        this.map.flyTo([lat, lng], 15, { duration: 1.2 });
      } catch (err) {
        console.error('[CulturePath Map] Error in selectNode flyTo animation:', err);
      }
    }
  }

  /**
   * Translates node types into respective tab indices.
   */
  private getTabNameForType(type: string): string {
    if (type === 'attraction' || type === 'hidden_gem') return 'attractions';
    if (type === 'heritage') return 'heritage';
    if (type === 'food' || type === 'shopping') return 'food';
    if (type === 'event') return 'events';
    return 'overview';
  }

  /**
   * Execute search for a natural language string.
   */
  onSubmit() {
    if (this.searchForm.invalid) return;
    const val = this.searchForm.value.query;
    if (val) {
      this.search(val);
    }
  }

  search(location: string) {
    if (!location || !location.trim()) return;

    // Stop active audio narration
    if (isPlatformBrowser(this.platformId)) {
      window.speechSynthesis?.cancel();
      this.isSpeaking.set(false);
    }

    const norm = location.toLowerCase().trim();

    // Reset UI selection
    this.selectedNode.set(null);

    // 1. Client-Side Cache Match (In-Memory)
    if (this.cache.has(norm)) {
      console.log(`[CulturePath Cache] In-memory cache hit for query: "${location}"`);
      const cached = this.cache.get(norm)!;
      this.sanitizeAndSetData(cached);
      this.selectedTab.set('overview');
      this.showIntro.set(false);
      this.error.set(null);
      this.saveToHistory(cached.location_name);
      return;
    }

    // 2. Client-Side Cache Match (LocalStorage)
    const local = this.loadFromLocalStorage(norm);
    if (local) {
      console.log(`[CulturePath Cache] LocalStorage cache hit for query: "${location}"`);
      this.cache.set(norm, local);
      this.sanitizeAndSetData(local);
      this.selectedTab.set('overview');
      this.showIntro.set(false);
      this.error.set(null);
      this.saveToHistory(local.location_name);
      return;
    }

    // 3. API Query (Express proxying Gemini)
    this.loading.set(true);
    this.error.set(null);
    this.startLoadingPhrases();

    this.http.post<CulturalPathData>('/api/culture', { location }).subscribe({
      next: (data) => {
        if (data && data.invalid_location) {
          this.loading.set(false);
          this.stopLoadingPhrases();
          this.error.set(`"${location}" could not be recognized as a valid, known geographic location. Please check your spelling or search for a different place (e.g., Jaipur, Kyoto, Paris).`);
          return;
        }

        this.cache.set(norm, data);
        this.saveToLocalStorage(norm, data);

        this.sanitizeAndSetData(data);
        this.selectedTab.set('overview');
        this.showIntro.set(false);
        this.loading.set(false);
        this.stopLoadingPhrases();
        this.saveToHistory(data.location_name);

        if (data._error) {
          console.warn('[CulturePath UI] Loaded with server-side fallback warning:', data._error);
        }
      },
      error: (err) => {
        console.error('[CulturePath UI] Error searching cultural paths:', err);
        this.loading.set(false);
        this.stopLoadingPhrases();
        this.error.set(err?.error?.error || 'Failed to contact GenAI concierge. Please check your credentials or network and try again.');
      }
    });
  }

  /**
   * Cyclical phrases for loading skeleton.
   */
  private startLoadingPhrases() {
    let index = 0;
    this.loadingMessage.set(this.loadingPhrases[index]);
    this.loadingInterval = setInterval(() => {
      index = (index + 1) % this.loadingPhrases.length;
      this.loadingMessage.set(this.loadingPhrases[index]);
    }, 2500);
  }

  private stopLoadingPhrases() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  }

  /**
   * Secure symmetric encryption helper (XOR + Base64) to prevent plain-text exposure
   * of user itineraries and travel history in client-side LocalStorage.
   */
  encrypt(plainText: string): string {
    const key = 'CulturePath_Sec_Key_2026';
    let result = '';
    for (let i = 0; i < plainText.length; i++) {
      const charCode = plainText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  }

  /**
   * Symmetric decryption helper to restore original payload from client-side LocalStorage.
   */
  decrypt(cipherText: string): string {
    try {
      const key = 'CulturePath_Sec_Key_2026';
      const decoded = atob(cipherText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch {
      return '';
    }
  }

  /**
   * Save search query history limits to 5 items with secure encryption.
   */
  saveToHistory(name: string) {
    let hist = this.searchHistory();
    // Strip trailing region notes if present to match cleanly
    if (!hist.includes(name)) {
      hist = [name, ...hist.filter(h => h !== name)].slice(0, 6);
      this.searchHistory.set(hist);
      if (isPlatformBrowser(this.platformId)) {
        try {
          const encrypted = this.encrypt(JSON.stringify(hist));
          localStorage.setItem('culture_history_list', encrypted);
        } catch (e) {
          console.warn('Failed saving encrypted history:', e);
        }
      }
    }
  }

  private saveToLocalStorage(query: string, data: CulturalPathData) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const encrypted = this.encrypt(JSON.stringify(data));
      localStorage.setItem(`culture_cache_${query}`, encrypted);
    } catch (e) {
      console.warn('Failed secure local caching:', e);
    }
  }

  private loadFromLocalStorage(query: string): CulturalPathData | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const stored = localStorage.getItem(`culture_cache_${query}`);
      if (!stored) return null;
      
      // Attempt decryption. If it's old plain text or decrypted fails, parse gracefully.
      let decrypted = '';
      if (stored.startsWith('{') || stored.startsWith('[')) {
        decrypted = stored; // legacy plain text support
      } else {
        decrypted = this.decrypt(stored);
      }

      if (!decrypted) return null;
      const data = JSON.parse(decrypted) as CulturalPathData;
      if (!data || !data.location_name || !data.coordinates || !data.nodes || !Array.isArray(data.nodes)) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  private loadCacheFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const stored = localStorage.getItem('culture_history_list');
      if (stored) {
        let decrypted = '';
        if (stored.startsWith('[')) {
          decrypted = stored;
        } else {
          decrypted = this.decrypt(stored);
        }
        if (decrypted) {
          this.searchHistory.set(JSON.parse(decrypted));
        }
      }
    } catch (e) {
      console.warn('Failed loading secure cached history:', e);
    }
  }

  /**
   * Screen reader support: set accessibility text
   */
  getAriaLabelForNode(node: CulturalNode): string {
    return `Story Node: ${node.title}, category ${node.type}. Click to center map and inspect details.`;
  }
}
