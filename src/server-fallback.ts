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
  nodes: {
    title: string;
    type: 'attraction' | 'hidden_gem' | 'heritage' | 'food' | 'shopping' | 'event';
    description: string;
    lat: number;
    lng: number;
  }[];
  impact_note: string;
  quick_tips: string[];
}

export const FALLBACK_PATHS: Record<string, CulturalPathData> = {
  kyoto: {
    location_name: "Kyoto, Japan",
    coordinates: { lat: 35.0116, lng: 135.7681 },
    immersive_story: "Kyoto, the ancient imperial capital of Japan, breathes through centuries-old wooden machiya houses, mossy stone steps, and the gentle whisper of bamboo leaves. Walking through its historic districts, the scent of burning incense and damp cedar wood fills the air, while the soft clicking of wooden Geta sandals on stone pavements echoes in the quiet alleys. It is a sanctuary where sacred Shinto rituals and Zen philosophies are still etched into daily life.",
    links: {
      attractions: "Fushimi Inari-taisha: Wander through the mesmerizing mountain path of over 10,000 vibrant vermilion Torii gates, dedicated to the Shinto god of rice and agriculture.",
      hidden_gems: "Gio-ji Temple: A tiny, tranquil temple tucked away in Arashiyama, famous for its lush moss garden that glows in emerald hues and its quiet, reflective atmosphere.",
      heritage: "Gion District & Ochaya Culture: The preservation of wooden teahouses and the highly skilled arts of Geiko and Maiko performing traditional dances, music, and tea ceremonies.",
      local_events: "Gion Matsuri (July): One of Japan's most famous festivals, featuring massive hand-carved wooden floats (yamaboko) parading through the city streets to purify the town.",
      authentic_food: "Kiseki-style Yudofu (Silken Tofu Hotpot): Creamy local tofu simmered in a light kombu seaweed broth, served in wooden pots with soy-dashi, grated ginger, and scallions. It represents Zen simplicity and pure culinary art.",
      cultural_experience: "Respectful Zen Garden Meditation: Visit a temple like Ryoan-ji early in the morning, keeping voices to a low whisper, appreciating the dry-landscape rock formations without stepping onto the raked gravel.",
      shopping: "Uji Matcha and Kiyomizu-yaki Ceramics: Delicate, hand-painted tea cups and organic green tea powder sourced from the nearby hills of Uji, preserving centuries of pottery-making lineages."
    },
    nodes: [
      {
        title: "Fushimi Inari Shrine",
        type: "attraction",
        description: "The mountain path of 10,000 vermilion Torii gates whispering with Shinto prayers.",
        lat: 34.9671,
        lng: 135.7727
      },
      {
        title: "Kinkaku-ji (Golden Pavilion)",
        type: "attraction",
        description: "A Zen Buddhist temple whose top two floors are completely covered in brilliant gold leaf, overlooking a pristine mirror pond.",
        lat: 35.0394,
        lng: 135.7292
      },
      {
        title: "Kiyomizu-dera Temple",
        type: "attraction",
        description: "A majestic wooden temple clinging to Mount Otowa, celebrated for its massive stage with scenic panoramas of cherry blossoms.",
        lat: 34.9949,
        lng: 135.7850
      },
      {
        title: "Gio-ji Moss Temple",
        type: "hidden_gem",
        description: "An emerald-tinted sanctuary of moss and bamboo, far from the standard tourist paths.",
        lat: 35.0215,
        lng: 135.6661
      },
      {
        title: "Otagi Nenbutsu-ji",
        type: "hidden_gem",
        description: "Tucked in deep Arashiyama, this secret forest temple is populated by 1,200 whimsical hand-carved stone Rakan statues.",
        lat: 35.0298,
        lng: 135.6622
      },
      {
        title: "Honen-in Temple",
        type: "hidden_gem",
        description: "A secluded Buddhist temple near the Philosopher's Path with a thatched gateway, stone bridges, and mossy, peaceful forest gardens.",
        lat: 35.0242,
        lng: 135.7936
      },
      {
        title: "Gion Corner Teahouse",
        type: "heritage",
        description: "The historic heart of Kyoto's traditional performing arts and preserved wooden architecture.",
        lat: 35.0037,
        lng: 135.7752
      },
      {
        title: "Toyooka Yudofu Restaurant",
        type: "food",
        description: "A legendary culinary stop serving silken tofu hotpots prepared using pristine spring water.",
        lat: 35.0110,
        lng: 135.7780
      },
      {
        title: "Kiyomizu Pottery Quarter",
        type: "shopping",
        description: "Meet local sixth-generation artisans crafting hand-painted Kiyomizu-yaki ceramics.",
        lat: 34.9948,
        lng: 135.7782
      }
    ],
    impact_note: "Visiting smaller moss temples in Arashiyama distributes tourism revenue to local preservation monks and relieves pressure on the overcrowded Golden Pavilion.",
    quick_tips: [
      "Always carry cash as local temples, traditional noodle shops, and artisan workshops do not accept cards.",
      "Never take photos of geishas or maiko on private streets; admire their elegance from a respectful distance.",
      "Take your trash back with you, as there are no public trash bins on the streets of Kyoto to preserve pristine cleanliness."
    ]
  },
  paris: {
    location_name: "Paris, France",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    immersive_story: "Paris, the City of Light, sits majestically along the sweeping curves of the Seine River, filled with the aroma of freshly baked butter croissants and espresso wafting from sidewalk cafés. Its wide Haussmannian boulevards contrast with narrow cobblestone pathways in Montmartre, where street artists capture the golden hour. Paris is an open-air museum where literary history, revolutionary spirit, and architectural mastery merge seamlessly.",
    links: {
      attractions: "Musée de l'Orangerie: An exquisite gallery inside the Tuileries Gardens, housing Claude Monet's monumental 'Water Lilies' in curved, sun-drenched rooms.",
      hidden_gems: "La Petite Ceinture: An abandoned 19th-century railway line circling Paris, now reclaimed by nature as a quiet, green wilderness walk filled with wildflowers.",
      heritage: "Shakespeare and Company & Left Bank Intellect: The legacy of bohemian writers, lost generation artists, and philosophical cafes on the Left Bank.",
      local_events: "Fête de la Musique (June 21): A city-wide celebration where thousands of musicians perform for free on every street corner, square, and park.",
      authentic_food: "Steak Frites & Escargots de Bourgogne: Classic Parisian bistro dishes enjoyed alongside natural wines under zinc-topped bars.",
      cultural_experience: "Bouquinistes along the Seine: Engage in gentle conversations with the local riverside book sellers whose dark green metal boxes have guarded vintage prints and literature since the 16th century.",
      shopping: "Artisanal Macarons from Pierre Hermé & Vintage Flea Markets: Sourcing rare art deco treasures at Marché aux Puces de Saint-Ouen."
    },
    nodes: [
      {
        title: "Musée de l'Orangerie",
        type: "attraction",
        description: "Monet's sweeping water lilies captured in perfect, curved architectural light.",
        lat: 48.8638,
        lng: 2.3227
      },
      {
        title: "Eiffel Tower & Champ de Mars",
        type: "attraction",
        description: "The towering wrought-iron icon of Paris standing grandly over the vast green lawns of Champ de Mars.",
        lat: 48.8584,
        lng: 2.2945
      },
      {
        title: "Notre-Dame Cathedral",
        type: "attraction",
        description: "The historic gothic masterpiece on Île de la Cité, with spectacular flying buttresses and stone gargoyles.",
        lat: 48.8530,
        lng: 2.3499
      },
      {
        title: "La Petite Ceinture (14th)",
        type: "hidden_gem",
        description: "A secret railway trail overrun by wild ivy and local street art inside the city loop.",
        lat: 48.8265,
        lng: 2.3291
      },
      {
        title: "Musée de la Chasse et de la Nature",
        type: "hidden_gem",
        description: "An eccentric, artistic museum tucked inside a Marais mansion dedicated to the relationship between humans, nature, and art.",
        lat: 48.8612,
        lng: 2.3592
      },
      {
        title: "Vineyard of Montmartre",
        type: "hidden_gem",
        description: "Clos Montmartre, a secret, authentic, steep hillside vineyard preserving Parisian wine-making since the 1930s.",
        lat: 48.8887,
        lng: 2.3411
      },
      {
        title: "Bouquinistes of the Seine",
        type: "heritage",
        description: "The world's largest open-air historic library lining the banks of the Seine River.",
        lat: 48.8530,
        lng: 2.3499
      },
      {
        title: "Bistrot Paul Bert",
        type: "food",
        description: "A classic culinary landmark preserving old-world French bistro culture and natural wines.",
        lat: 48.8507,
        lng: 2.3802
      },
      {
        title: "Marché Saint-Ouen",
        type: "shopping",
        description: "Explore the labyrinthine alleys of the historic Parisian vintage and antique market.",
        lat: 48.9015,
        lng: 2.3418
      }
    ],
    impact_note: "Buying from the riverside Bouquinistes protects a UNESCO-recognized open-air bookseller trade dating back to the 1500s from modern digital displacement.",
    quick_tips: [
      "Always greet shopkeepers with a polite 'Bonjour' before browsing; it is a vital custom of Parisian respect.",
      "Avoid dining in the immediate squares around the Eiffel Tower; explore nearby neighborhood side alleys.",
      "Use the metro instead of ride-shares to lower your carbon footprint and experience daily Parisian commuter life."
    ]
  },
  cairo: {
    location_name: "Cairo, Egypt",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    immersive_story: "Cairo, the 'Cradle of Civilization,' is a mesmerizing sensory tapestry where the ancient call to prayer resounds over thousands of minarets, blending with the bustling sounds of historic bazaars. The smell of roasted cumin, sweet mint tea, and jasmine water floats through the narrow alleys of Islamic Cairo, while the timeless Nile River flows silently by. Here, Pharaohs, Islamic dynasties, and Coptic heritage reside side-by-side in majestic stone.",
    links: {
      attractions: "The Giza Plateau: Stand before the Great Pyramids and the Sphinx, ancient stone marvels that have watched over the desert sands for 4,500 years.",
      hidden_gems: "Al-Muizz Street: An open-air museum of medieval Islamic architecture, filled with gorgeous brass-domed mausoleums, ancient schools, and intricate stone carvings.",
      heritage: "The Coptic Quarter & Hanging Church: Discover the deep roots of Egyptian Christianity, walking through quiet, stone-walled alleys dating back to the Roman fortress of Babylon.",
      local_events: "El Tannoura Sufi Dance: A spiritual whirling dervish performance featuring vibrant, rotating skirts and traditional folk instruments at Wekalet El Ghouri.",
      authentic_food: "Koshary: A comforting, aromatic layering of lentils, rice, macaroni, chickpeas, crispy caramelized onions, and a garlic-chili tomato vinegar sauce. It is Egypt's national soul food.",
      cultural_experience: "Respectful Bazaar Haggling: Bargain at Khan el-Khalili with a friendly smile, treating the exchange as a lighthearted social ritual rather than a tense transaction.",
      shopping: "Hand-blown Muski Glass and Papyrus Art: Beautiful translucent turquoise glassware hand-blown by local families in Old Cairo, preserving a dying craft."
    },
    nodes: [
      {
        title: "The Great Pyramid of Giza",
        type: "attraction",
        description: "The last remaining wonder of the ancient world rising from the Sahara desert.",
        lat: 29.9792,
        lng: 31.1342
      },
      {
        title: "Egyptian Museum at Tahrir Square",
        type: "attraction",
        description: "The legendary pink-walled museum housing a massive, unparalleled collection of Pharaonic antiquities, golden treasures, and statues.",
        lat: 30.0478,
        lng: 31.2336
      },
      {
        title: "Citadel of Saladin",
        type: "attraction",
        description: "A massive medieval Islamic fortification offering striking, panoramic views over Cairo and housing the gorgeous Alabaster Mosque.",
        lat: 30.0299,
        lng: 31.2611
      },
      {
        title: "Al-Muizz Historic Street",
        type: "hidden_gem",
        description: "A gorgeous corridor of medieval Islamic monuments, towers, and ancient brass-smiths.",
        lat: 30.0515,
        lng: 31.2618
      },
      {
        title: "Cave Church of Saint Simon",
        type: "hidden_gem",
        description: "An extraordinary, massive Christian amphitheater church carved deep into the rocky cliffs of Mokattam Mountain.",
        lat: 30.0309,
        lng: 31.2745
      },
      {
        title: "Ibn Tulun Spiral Minaret",
        type: "hidden_gem",
        description: "Cairo's oldest intact mosque, celebrated for its unique external spiral staircase minaret inspired by Samarra architecture.",
        lat: 30.0287,
        lng: 31.2494
      },
      {
        title: "Wekalet El Ghouri Sufi Stage",
        type: "event",
        description: "The spiritual home of the El Tannoura dance, where whirling Sufi rituals are performed.",
        lat: 30.0465,
        lng: 31.2612
      },
      {
        title: "Abou Tarek Koshary",
        type: "food",
        description: "The legendary multi-story diner serving Cairo's most famous and beloved national Koshary dish.",
        lat: 30.0505,
        lng: 31.2392
      },
      {
        title: "Old Glassblowers Quarter",
        type: "shopping",
        description: "Watch local master glassblowers shape Muski turquoise glasses in high-heat kilns.",
        lat: 30.0385,
        lng: 31.2592
      }
    ],
    impact_note: "Hiring registered local Egyptologist guides and purchasing Muski glassware directly from the glass-makers provides sustainable income directly to multigenerational artisan families.",
    quick_tips: [
      "Dress modestly, keeping shoulders and knees covered, especially when visiting active mosques or Coptic churches.",
      "Tipping (Baksheesh) is a standard custom for all small services; carry small-denomination bills of Egyptian pounds.",
      "Accept hibiscus tea (Karkadeh) when offered by shopkeepers; it is a traditional sign of hospitality."
    ]
  },
  rio: {
    location_name: "Rio de Janeiro, Brazil",
    coordinates: { lat: -22.9068, lng: -43.1729 },
    immersive_story: "Rio de Janeiro, the 'Cidade Maravilhosa,' is where sheer granite peaks cloaked in rainforest plunge directly into the roaring Atlantic Ocean. The air is thick with sea salt, sweet açai pulp, and the rhythmic, syncopated beats of samba echoing from open-air neighborhood plazas. From the sweeping beaches of Copacabana to the historic streets of Santa Teresa, Rio overflows with a passionate, collective joy of living.",
    links: {
      attractions: "Sugarloaf Mountain (Pão de Açúcar): Ride the glass-walled cable cars to witness a jaw-dropping panorama of Guanabara Bay and the city's coastal contours.",
      hidden_gems: "Parque Lage: A magnificent, ruined neo-classical mansion nestled deep at the foot of Corcovado mountain, surrounded by dense Atlantic jungle.",
      heritage: "Pedra do Sal: The birthplace of Samba, where musicians gather around a historic stone table to play acoustic guitars, pandeiros, and cavaquinhos.",
      local_events: "Samba Circles in Lapa: Vibrant Friday night street gatherings where locals and visitors dance to live brass bands under the monumental Roman-style Lapa Arches.",
      authentic_food: "Feijoada: A slow-cooked, rich black bean stew simmered with salted pork, beef, and sausage, served with toasted cassava flour (farofa), collard greens, and orange slices.",
      cultural_experience: "Respecting the Beach Culture (Carioca Lifestyle): Rent a beach chair ('cadeira') at Copacabana, buy refreshments from local walking vendors, and applaud the setting sun.",
      shopping: "Brazilian Gemstones and Handmade Canga Tapestries: Vibrant beach wraps with local patterns, hand-dyed by neighborhood co-operatives."
    },
    nodes: [
      {
        title: "Sugarloaf Cable Car Station",
        type: "attraction",
        description: "Soar above the ocean to look down on Rio's green peaks and golden beaches.",
        lat: -22.9556,
        lng: -43.1648
      },
      {
        title: "Christ the Redeemer",
        type: "attraction",
        description: "The monumental Art Deco statue of Jesus Christ crowning Corcovado mountain, blessing Rio with open arms.",
        lat: -22.9519,
        lng: -43.2105
      },
      {
        title: "Copacabana Beach Walkway",
        type: "attraction",
        description: "The wave-patterned black and white stone mosaic walkway flanking one of the world's most vibrant and famous ocean shorelines.",
        lat: -22.9712,
        lng: -43.1852
      },
      {
        title: "Parque Lage Mansion",
        type: "hidden_gem",
        description: "An Italian-style palace reclaimed by the lush Atlantic forest, rich in art history.",
        lat: -22.9585,
        lng: -43.2112
      },
      {
        title: "Real Gabinete Português",
        type: "hidden_gem",
        description: "A jaw-dropping, cathedral-like 19th-century library filled with dark hand-carved wood and thousands of rare Portuguese volumes.",
        lat: -22.9056,
        lng: -43.1818
      },
      {
        title: "Vista Chinesa Gazebo",
        type: "hidden_gem",
        description: "An oriental-style gazebo tucked in Tijuca Forest, offering a breathtaking, isolated perspective of Rio's bays and peaks.",
        lat: -22.9729,
        lng: -43.2492
      },
      {
        title: "Pedra do Sal Samba Rock",
        type: "heritage",
        description: "The historical African-Brazilian stone plaza where street Samba was born.",
        lat: -22.8988,
        lng: -43.1856
      },
      {
        title: "Casa da Feijoada",
        type: "food",
        description: "A cultural culinary institution dedicated to serving authentic, multi-pot Carioca Feijoada.",
        lat: -22.9832,
        lng: -43.2033
      },
      {
        title: "Santa Teresa Artisan Collective",
        type: "shopping",
        description: "Explore hillside studios showcasing beautiful hand-carved wood crafts and custom tapestries.",
        lat: -22.9248,
        lng: -43.1878
      }
    ],
    impact_note: "Supporting community-run tours in Santa Teresa and buying cangas from local beach vendors ensures tourism benefits resident families directly.",
    quick_tips: [
      "Carry only the cash you need for the day and leave valuable jewelry at your hotel to enjoy the city with peace of mind.",
      "Stay hydrated with cold, fresh coconut water (Água de Coco) readily available from kiosks along the beachfront.",
      "Learn a few basic Portuguese greetings like 'Tudo bem?' to connect warmly with locals."
    ]
  }
};
