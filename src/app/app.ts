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

export interface CulturalNode {
  title: string;
  type: 'attraction' | 'hidden_gem' | 'heritage' | 'food' | 'shopping' | 'event';
  description: string;
  lat: number;
  lng: number;
}

export interface CulturalPathData {
  location_name: string;
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
  selectedTab = signal<string>('overview'); // overview, attractions, heritage, food, events
  selectedNode = signal<CulturalNode | null>(null);
  searchHistory = signal<string[]>(['Kyoto, Japan', 'Paris, France', 'Cairo, Egypt', 'Rio de Janeiro, Brazil']);
  showIntro = signal<boolean>(true);

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
      
      if (isPlatformBrowser(this.platformId)) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          this.isDarkMode.set(true);
        }
      }

      // Auto-load Kyoto on first visit to present a jaw-dropping populated initial dashboard!
      this.search('Kyoto, Japan');
    });

    // React to changes in currentData to initialize/refresh map markers smoothly
    effect(() => {
      const data = this.currentData();
      if (data && isPlatformBrowser(this.platformId)) {
        if (!this.map) {
          // Wait a brief tick for the template to render the #mapContainer container
          setTimeout(async () => {
            await this.initMap();
          }, 100);
        } else {
          this.renderMapMarkers(data);
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
      const L = await import('leaflet');
      this.L = L;

      const container = this.mapContainer()?.nativeElement;
      if (!container) return;

      this.map = L.map(container, {
        zoomControl: true,
        scrollWheelZoom: true,
        maxZoom: 18,
        minZoom: 2
      }).setView([35.0116, 135.7681], 13); // Centered on Kyoto initially

      // Set initial tiles based on current theme
      this.updateMapTiles();

      this.markerGroup = L.layerGroup().addTo(this.map);

      // Render markers if data was loaded prior to map initialization completion
      const data = this.currentData();
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
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const direct = parseFloat(val);
      if (!isNaN(direct) && /^-?\d+(\.\d+)?$/.test(val.trim())) return direct;
      
      const cleaned = val.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        const lower = val.toLowerCase();
        if (lower.includes('s') || lower.includes('w')) {
          return -Math.abs(parsed);
        }
        return parsed;
      }
    }
    return NaN;
  }

  /**
   * Cleans, validates, and sets the cultural path data immediately to ensure Leaflet never receives NaN.
   */
  sanitizeAndSetData(data: CulturalPathData) {
    if (!data) return;

    // Sanitize central coordinates
    let lat = this.parseFloatCoords(data.coordinates?.lat);
    let lng = this.parseFloatCoords(data.coordinates?.lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn('[CulturePath Map] Primary coordinates are invalid. Attempting fallback to first valid node.');
      const firstValidNode = data.nodes?.find(n => !isNaN(this.parseFloatCoords(n.lat)) && !isNaN(this.parseFloatCoords(n.lng)));
      if (firstValidNode) {
        lat = this.parseFloatCoords(firstValidNode.lat);
        lng = this.parseFloatCoords(firstValidNode.lng);
      } else {
        // Safe default: center of Jaipur as a backup, or Kyoto
        lat = 26.9124;
        lng = 75.7873;
      }
    }
    
    data.coordinates = { lat, lng };

    // Sanitize node coordinates
    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach(node => {
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

    this.currentData.set(data);
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
   * Cleans and renders new markers on the interactive map.
   */
  renderMapMarkers(data: CulturalPathData) {
    if (!this.map || !this.L || !this.markerGroup) return;

    this.markerGroup.clearLayers();
    const L = this.L;
    
    const lat = data.coordinates.lat;
    const lng = data.coordinates.lng;

    // Transition smoothly to the destination coordinates
    this.map.flyTo([lat, lng], 13, { duration: 1.5 });

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

    L.marker([lat, lng], { icon: primaryIcon })
      .addTo(this.markerGroup)
      .bindPopup(`
        <div class="p-1 font-sans">
          <h4 class="font-display font-extrabold text-sm text-terracotta mb-0.5">${data.location_name}</h4>
          <p class="text-[10px] text-sage font-mono tracking-wider uppercase font-semibold">Primary Regional Center</p>
        </div>
      `);

    // Individual Cultural Nodes - Styled with Natural Tones: Sage & Terracotta
    const configs: Record<string, { color: string; bgClass: string; borderClass: string; icon: string }> = {
      attraction: { color: 'text-terracotta', bgClass: 'bg-terracotta/15', borderClass: 'border-terracotta', icon: 'photo_camera' },
      hidden_gem: { color: 'text-sage', bgClass: 'bg-sage/15', borderClass: 'border-sage', icon: 'auto_awesome' },
      heritage: { color: 'text-sage', bgClass: 'bg-sage/15', borderClass: 'border-sage', icon: 'history_edu' },
      food: { color: 'text-terracotta', bgClass: 'bg-terracotta/15', borderClass: 'border-terracotta', icon: 'restaurant' },
      shopping: { color: 'text-terracotta', bgClass: 'bg-terracotta/15', borderClass: 'border-terracotta', icon: 'shopping_bag' },
      event: { color: 'text-sage', bgClass: 'bg-sage/15', borderClass: 'border-sage', icon: 'festival' }
    };

    data.nodes.forEach((node) => {
      const nodeLat = node.lat;
      const nodeLng = node.lng;

      const cfg = configs[node.type] || configs['attraction'];
      const nodeIcon = L.divIcon({
        className: 'node-marker-icon',
        html: `
          <div class="group relative flex items-center justify-center transition-all hover:scale-125 duration-200">
            <div class="w-8 h-8 rounded-full ${cfg.bgClass} border-2 ${cfg.borderClass} flex items-center justify-center ${cfg.color} bg-cream shadow-md shadow-sage/10">
              <span class="material-icons text-sm font-semibold">${cfg.icon}</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([nodeLat, nodeLng], { icon: nodeIcon })
        .addTo(this.markerGroup)
        .bindPopup(`
          <div class="p-1.5 font-sans max-w-[200px]">
            <div class="flex items-center gap-1 mb-1">
              <span class="material-icons text-xs ${cfg.color}">${cfg.icon}</span>
              <span class="text-[9px] uppercase tracking-widest font-mono text-sage font-bold">${node.type.replace('_', ' ')}</span>
            </div>
            <h4 class="font-display font-bold text-xs text-ink mb-1 leading-snug">${node.title}</h4>
            <p class="text-[11px] text-ink/80 leading-normal mb-0">${node.description}</p>
          </div>
        `);

      // Sync map selection back to dashboard
      marker.on('click', () => {
        this.selectedNode.set(node);
        this.selectedTab.set(this.getTabNameForType(node.type));
      });
    });
  }

  /**
   * Triggers map movement and opens node popup.
   */
  selectNode(node: CulturalNode) {
    this.selectedNode.set(node);
    if (this.map) {
      this.map.flyTo([node.lat, node.lng], 15, { duration: 1.2 });
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
   * Save search query history limits to 5 items.
   */
  saveToHistory(name: string) {
    let hist = this.searchHistory();
    // Strip trailing region notes if present to match cleanly
    if (!hist.includes(name)) {
      hist = [name, ...hist.filter(h => h !== name)].slice(0, 6);
      this.searchHistory.set(hist);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('culture_history_list', JSON.stringify(hist));
      }
    }
  }

  private saveToLocalStorage(query: string, data: CulturalPathData) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(`culture_cache_${query}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed local caching:', e);
    }
  }

  private loadFromLocalStorage(query: string): CulturalPathData | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const dataStr = localStorage.getItem(`culture_cache_${query}`);
      if (!dataStr) return null;
      const data = JSON.parse(dataStr) as CulturalPathData;
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
      const histStr = localStorage.getItem('culture_history_list');
      if (histStr) {
        this.searchHistory.set(JSON.parse(histStr));
      }
    } catch (e) {
      console.warn('Failed loading cached history:', e);
    }
  }

  /**
   * Screen reader support: set accessibility text
   */
  getAriaLabelForNode(node: CulturalNode): string {
    return `Story Node: ${node.title}, category ${node.type}. Click to center map and inspect details.`;
  }
}
