// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { App, CulturalPathData, CulturalNode } from './app';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Initialize Angular TestBed environment for Vitest
try {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch {
  // Catch already-initialized environment in watch mode
}

describe('App Component Unit Tests', () => {
  let app: App;
  let mockHttp: { post: () => Observable<CulturalPathData> };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockHttp = {
      post: () => of({
        location_name: 'Kyoto, Japan',
        coordinates: { lat: 35.0116, lng: 135.7681 },
        immersive_story: 'A magical historical city.',
        links: {
          attractions: 'shrine',
          hidden_gems: 'shrine',
          heritage: 'shrine',
          local_events: 'shrine',
          authentic_food: 'shrine',
          cultural_experience: 'shrine',
          shopping: 'shrine'
        },
        nodes: [],
        impact_note: 'supports local shops',
        quick_tips: []
      })
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const testBedInjector = TestBed.inject(Injector);
    runInInjectionContext(testBedInjector, () => {
      app = new App();
    });
  });

  it('should create the app component', () => {
    expect(app).toBeTruthy();
  });

  describe('parseFloatCoords', () => {
    it('should parse valid coordinate numbers', () => {
      expect(app.parseFloatCoords(12.34)).toBe(12.34);
    });

    it('should parse valid coordinate strings', () => {
      expect(app.parseFloatCoords('12.34')).toBe(12.34);
      expect(app.parseFloatCoords('-56.78')).toBe(-56.78);
    });

    it('should return NaN for null, undefined or empty strings', () => {
      expect(app.parseFloatCoords(null)).toBeNaN();
      expect(app.parseFloatCoords(undefined)).toBeNaN();
      expect(app.parseFloatCoords('')).toBeNaN();
    });

    it('should handle hemisphere suffixes S and W by making them negative', () => {
      expect(app.parseFloatCoords('34.5 S')).toBe(-34.5);
      expect(app.parseFloatCoords('120.5W')).toBe(-120.5);
      expect(app.parseFloatCoords('12.3 N')).toBe(12.3);
    });
  });

  describe('sanitizeAndSetData', () => {
    it('should sanitize primary coordinates', () => {
      const mockData: CulturalPathData = {
        location_name: 'Test Location',
        coordinates: { lat: NaN, lng: NaN },
        immersive_story: 'A great test story.',
        links: {
          attractions: 'Attractions info',
          hidden_gems: 'Hidden gems info',
          heritage: 'Heritage info',
          local_events: 'Events info',
          authentic_food: 'Food info',
          cultural_experience: 'Experience info',
          shopping: 'Shopping info'
        },
        nodes: [
          { title: 'Node 1', type: 'attraction', description: 'Desc 1', lat: NaN, lng: NaN }
        ],
        impact_note: 'Helps locals.',
        quick_tips: ['Tip 1']
      };

      app.sanitizeAndSetData(mockData);

      const resolved = app.currentData();
      expect(resolved).toBeTruthy();
      expect(resolved!.coordinates.lat).toBe(26.9124); // fallback central lat
      expect(resolved!.coordinates.lng).toBe(75.7873); // fallback central lng
      expect(resolved!.nodes[0].lat).not.toBeNaN();
      expect(resolved!.nodes[0].lng).not.toBeNaN();
    });
  });

  describe('speakStory', () => {
    it('should toggle speaking signal', () => {
      // Mock window.speechSynthesis in test environment
      const mockSynth = {
        speak: () => {
          void 0;
        },
        cancel: () => {
          void 0;
        },
        getVoices: () => [] as SpeechSynthesisVoice[]
      };
      
      const originalSynth = window.speechSynthesis;
      Object.defineProperty(window, 'speechSynthesis', {
        value: mockSynth,
        configurable: true,
        writable: true
      });

      // Mock SpeechSynthesisUtterance constructor globally for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).SpeechSynthesisUtterance = class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
        voice = null;
        rate = 1;
        pitch = 1;
        onend = null;
        onerror = null;
      };

      // Temporarily mock platformId to 'browser' for TTS test
      app['platformId'] = 'browser';

      app.speakStory('A great testing narrative.');
      expect(app.isSpeaking()).toBe(true);

      // Call again should cancel it
      app.speakStory('A great testing narrative.');
      expect(app.isSpeaking()).toBe(false);

      // Restore original
      Object.defineProperty(window, 'speechSynthesis', {
        value: originalSynth,
        configurable: true,
        writable: true
      });
    });
  });

  describe('selectNode', () => {
    it('should set selected node signal', () => {
      const mockNode: CulturalNode = {
        title: 'Selected Venue',
        type: 'hidden_gem',
        description: 'A cozy spot.',
        lat: 12,
        lng: 34
      };

      app.selectNode(mockNode);
      expect(app.selectedNode()).toBe(mockNode);
    });
  });

  describe('onSubmit', () => {
    it('should call search on valid form', () => {
      const searchSpy = vi.spyOn(app, 'search').mockImplementation(() => {
        void 0;
      });
      app.searchForm.setValue({ query: 'Kyoto' });
      app.onSubmit();
      expect(searchSpy).toHaveBeenCalledWith('Kyoto');
    });

    it('should not call search on invalid form', () => {
      const searchSpy = vi.spyOn(app, 'search').mockImplementation(() => {
        void 0;
      });
      app.searchForm.setValue({ query: '' });
      app.onSubmit();
      expect(searchSpy).not.toHaveBeenCalled();
    });
  });

  describe('saveToHistory', () => {
    it('should prepend item to history and enforce length limit of 6', () => {
      app.searchHistory.set(['City A', 'City B']);
      app.saveToHistory('City C');
      expect(app.searchHistory()[0]).toBe('City C');
      expect(app.searchHistory().length).toBe(3);

      app.searchHistory.set(['A', 'B', 'C', 'D', 'E', 'F']);
      app.saveToHistory('G');
      expect(app.searchHistory().length).toBe(6);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string securely', () => {
      const originalText = 'Hello World of Cultural Journeys 2026!';
      const cipherText = app.encrypt(originalText);
      
      expect(cipherText).not.toBe(originalText);
      expect(cipherText).not.toContain('Hello World');
      
      const decryptedText = app.decrypt(cipherText);
      expect(decryptedText).toBe(originalText);
    });

    it('should handle decoding errors gracefully in decrypt', () => {
      const invalidCipher = '---!!!invalid_base64_string_representing_cipher_text!!!---';
      const decrypted = app.decrypt(invalidCipher);
      expect(decrypted).toBe('');
    });
  });

  describe('getAriaLabelForNode', () => {
    it('should produce appropriate screen reader labels', () => {
      const mockNode: CulturalNode = {
        title: 'Ancient Shrine',
        type: 'heritage',
        description: 'Old temple.',
        lat: 10,
        lng: 20
      };
      const label = app.getAriaLabelForNode(mockNode);
      expect(label).toContain('Ancient Shrine');
      expect(label).toContain('heritage');
    });
  });

  describe('getGoogleMapsDirUrl', () => {
    it('should construct a valid Google Maps directions URL with coordinates', () => {
      const url = app.getGoogleMapsDirUrl(35.0116, 135.7681);
      expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=35.0116,135.7681');
    });
  });
});
