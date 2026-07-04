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
  etiquette_tips: string;
  historical_context: string;
  vibe: string;
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
  emergency_contacts: EmergencyContacts;
  marketplace: MarketplaceItem[];
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
        lng: 135.7727,
        etiquette_tips: "Pass through the gates on the left or right side; the center of the path is reserved for the Shinto deities. Bow slightly at the entrance torii.",
        historical_context: "500 years ago, this mountain was a sacred, forested pilgrimage site guarded strictly by monks. The torii gates were donated one by one by merchants seeking blessings.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "Kinkaku-ji (Golden Pavilion)",
        type: "attraction",
        description: "A Zen Buddhist temple whose top two floors are completely covered in brilliant gold leaf, overlooking a pristine mirror pond.",
        lat: 35.0394,
        lng: 135.7292,
        etiquette_tips: "Always walk on the marked gravel walkways. Keep voices low to preserve the tranquil garden environment.",
        historical_context: "In 1397, this was built as a luxurious retirement villa for Shogun Ashikaga Yoshimitsu before becoming a Zen temple after his death.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Kiyomizu-dera Temple",
        type: "attraction",
        description: "A majestic wooden temple clinging to Mount Otowa, celebrated for its massive stage with scenic panoramas of cherry blossoms.",
        lat: 34.9949,
        lng: 135.7850,
        etiquette_tips: "When drinking from the Otowa Waterfall, use the metal cups provided, but only drink from ONE stream (health, longevity, or studies) to avoid greediness.",
        historical_context: "Built in 778, the iconic main wooden stage was constructed entirely without a single nail, utilizing complex joinery to survive earthquakes.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "Gio-ji Moss Temple",
        type: "hidden_gem",
        description: "An emerald-tinted sanctuary of moss and bamboo, far from the standard tourist paths.",
        lat: 35.0215,
        lng: 135.6661,
        etiquette_tips: "Do not touch or step on the delicate moss; it takes decades to cultivate and is highly sensitive.",
        historical_context: "Originally a secluded nunnery for tragic court dancers mentioned in the Tale of Heike, serving as a quiet refuge for centuries.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Otagi Nenbutsu-ji",
        type: "hidden_gem",
        description: "Tucked in deep Arashiyama, this secret forest temple is populated by 1,200 whimsical hand-carved stone Rakan statues.",
        lat: 35.0298,
        lng: 135.6622,
        etiquette_tips: "Treat each unique stone statue with respect. Do not place coins directly on their faces or heads.",
        historical_context: "Rebuilt after catastrophic typhoons in the 20th century. The 1,200 unique statues were carved by ordinary citizens from all over Japan.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Honen-in Temple",
        type: "hidden_gem",
        description: "A secluded Buddhist temple near the Philosopher's Path with a thatched gateway, stone bridges, and mossy, peaceful forest gardens.",
        lat: 35.0242,
        lng: 135.7936,
        etiquette_tips: "Bow slightly when crossing between the two white sand mounds (Byakusandou) at the entrance, which represent purifying water.",
        historical_context: "Founded in 1680, this tiny, moss-draped retreat was a quiet center of Zen learning and a burial place of noted philosophers.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Gion Corner Teahouse",
        type: "heritage",
        description: "The historic heart of Kyoto's traditional performing arts and preserved wooden architecture.",
        lat: 35.0037,
        lng: 135.7752,
        etiquette_tips: "If you spot a Maiko or Geiko on the street, do not touch her kimono or block her path. Taking close-up photos on private streets is strictly forbidden.",
        historical_context: "In the Edo period, Gion developed as a bustling hub of teahouses where guests were entertained by professional musicians and performers.",
        vibe: "Artisan & Creative"
      },
      {
        title: "Toyooka Yudofu Restaurant",
        type: "food",
        description: "A legendary culinary stop serving silken tofu hotpots prepared using pristine spring water.",
        lat: 35.0110,
        lng: 135.7780,
        etiquette_tips: "Do not stick your chopsticks vertically into your bowl of rice, as this mimics a funeral ritual. Place them on the chopstick rest.",
        historical_context: "Originally tofu was served exclusively to Buddhist monks as a vegetarian protein source (Shojin Ryori) in Kyoto's local temples.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Kiyomizu Pottery Quarter",
        type: "shopping",
        description: "Meet local sixth-generation artisans crafting hand-painted Kiyomizu-yaki ceramics.",
        lat: 34.9948,
        lng: 135.7782,
        etiquette_tips: "Handle pottery with both hands to prevent dropping, and ask before taking close-up photos of a ceramic master's unique wares.",
        historical_context: "Since the 16th century, master potters have operated kilns here, utilizing fine mountain clays to supply the imperial court and tea masters.",
        vibe: "Artisan & Creative"
      }
    ],
    impact_note: "Visiting smaller moss temples in Arashiyama distributes tourism revenue to local preservation monks and relieves pressure on the overcrowded Golden Pavilion.",
    quick_tips: [
      "Always carry cash as local temples, traditional noodle shops, and artisan workshops do not accept cards.",
      "Never take photos of geishas or maiko on private streets; admire their elegance from a respectful distance.",
      "Take your trash back with you, as there are no public trash bins on the streets of Kyoto to preserve pristine cleanliness."
    ],
    emergency_contacts: {
      police: "110 (General Police)",
      medical: "119 (Fire & Ambulance)",
      tourist_helpline: "050-3816-2720 (Japan National Tourism Helpline)",
      tips: "Kyoto is extremely safe, but heatstroke in the humid summer is common. Visit temples in early morning. Keep hydrated."
    },
    marketplace: [
      {
        item_name: "Kiyomizu-yaki Tea Cup",
        description: "Exquisite hand-painted ceramic cup fired in historic Kyoto kilns, reflecting Zen motifs.",
        price_estimate: "$35 - $80 USD",
        location_tip: "Kiyomizu Pottery Quarter boutiques"
      },
      {
        item_name: "Uji Ceremonial Matcha",
        description: "Organic, stone-ground green tea leaves harvested from the rolling hills of neighboring Uji.",
        price_estimate: "$20 - $45 USD",
        location_tip: "Ippodo Tea Co. main shop"
      },
      {
        item_name: "Handmade Washi Paper Fans",
        description: "Traditional bamboo and mulberry paper fans hand-painted by local Kyoto folding masters.",
        price_estimate: "$25 - $60 USD",
        location_tip: "Aiba Sensuten heritage shop"
      }
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
        lng: 2.3227,
        etiquette_tips: "Maintain silence in the oval water lily rooms. Do not use flash photography as it degrades the canvas paint layers.",
        historical_context: "100 years ago, these barracks-like brick structures inside the royal Tuileries gardens were used to store citrus trees during the bitter winters.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Eiffel Tower & Champ de Mars",
        type: "attraction",
        description: "The towering wrought-iron icon of Paris standing grandly over the vast green lawns of Champ de Mars.",
        lat: 48.8584,
        lng: 2.2945,
        etiquette_tips: "Beware of street signature petitions; they are often distraction methods used by local pickpockets.",
        historical_context: "Built in 1889 for the World's Fair, it was initially hated by Parisian artists who protested against this 'tragic iron street lamp.'",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Notre-Dame Cathedral",
        type: "attraction",
        description: "The historic gothic masterpiece on Île de la Cité, with spectacular flying buttresses and stone gargoyles.",
        lat: 48.8530,
        lng: 2.3499,
        etiquette_tips: "Remove hats and maintain a quiet posture of reverence inside this active, holy Catholic cathedral.",
        historical_context: "Constructed starting in 1163, this monument witnessed the coronation of Napoleon and survived both World Wars with minor damage.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "La Petite Ceinture (14th)",
        type: "hidden_gem",
        description: "A secret railway trail overrun by wild ivy and local street art inside the city loop.",
        lat: 48.8265,
        lng: 2.3291,
        etiquette_tips: "Leave no trace. Do not litter, as this urban nature belt is a key habitat for Parisian urban wildlife.",
        historical_context: "During the 1850s to 1930s, this was a heavily smoking freight railway line that circled Paris before being abandoned due to the metro.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Musée de la Chasse et de la Nature",
        type: "hidden_gem",
        description: "An eccentric, artistic museum tucked inside a Marais mansion dedicated to the relationship between humans, nature, and art.",
        lat: 48.8612,
        lng: 2.3592,
        etiquette_tips: "Do not touch the delicate historic dioramas or stuffed animal installations.",
        historical_context: "Housed in two grand 17th-century mansions, this private collection explores historical hunting ethics and natural history through a modern art lens.",
        vibe: "Artisan & Creative"
      },
      {
        title: "Vineyard of Montmartre",
        type: "hidden_gem",
        description: "Clos Montmartre, a secret, authentic, steep hillside vineyard preserving Parisian wine-making since the 1930s.",
        lat: 48.8887,
        lng: 2.3411,
        etiquette_tips: "The vineyard interior is closed to the general public except during the autumn grape harvest festival; enjoy views from behind the metal fences.",
        historical_context: "In 1933, local artists planted these vines to prevent real estate developers from building apartment blocks over their beautiful hill.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Bouquinistes of the Seine",
        type: "heritage",
        description: "The world's largest open-air historic library lining the banks of the Seine River.",
        lat: 48.8530,
        lng: 2.3499,
        etiquette_tips: "Greet the bouquiniste with a polite 'Bonjour'. Do not bend the pages of vintage prints or books.",
        historical_context: "Since the 16th century, these booksellers have sold literature from wooden boxes. They are now a UNESCO World Heritage cultural practice.",
        vibe: "Artisan & Creative"
      },
      {
        title: "Bistrot Paul Bert",
        type: "food",
        description: "A classic culinary landmark preserving old-world French bistro culture and natural wines.",
        lat: 48.8507,
        lng: 2.3802,
        etiquette_tips: "Wait to be seated. It is polite to ask for the bill by making eye contact and saying 'L'addition, s'il vous plaît'. Do not rush.",
        historical_context: "A preserved neighborhood institution that stood strong against the wave of fast-food chains, preserving slow-cooked French heritage.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Marché Saint-Ouen",
        type: "shopping",
        description: "Explore the labyrinthine alleys of the historic Parisian vintage and antique market.",
        lat: 48.9015,
        lng: 2.3418,
        etiquette_tips: "Be respectful when haggling; don't make extreme low-ball offers on precious, century-old antiques.",
        historical_context: "In the 1880s, rag-pickers expelled from central Paris set up stalls outside the city walls to sell salvaged furniture and objects.",
        vibe: "Artisan & Creative"
      }
    ],
    impact_note: "Buying from the riverside Bouquinistes protects a UNESCO-recognized open-air bookseller trade dating back to the 1500s from modern digital displacement.",
    quick_tips: [
      "Always greet shopkeepers with a polite 'Bonjour' before browsing; it is a vital custom of Parisian respect.",
      "Avoid dining in the immediate squares around the Eiffel Tower; explore nearby neighborhood side alleys.",
      "Use the metro instead of ride-shares to lower your carbon footprint and experience daily Parisian commuter life."
    ],
    emergency_contacts: {
      police: "17 (French National Police) or 112 (European Emergency)",
      medical: "15 (SAMU Medical Helpline)",
      tourist_helpline: "01-49-52-53-54 (Paris Tourism Office Helpline)",
      tips: "Beware of distraction pickpocket scams around major monuments. Keep your bag zipped. Never sign street petition clipboards."
    },
    marketplace: [
      {
        item_name: "Vintage Art Deco Print",
        description: "An authentic, weathered 1920s poster or vintage literary volume sourced from the riverside banks.",
        price_estimate: "$15 - $50 USD",
        location_tip: "Seine River Bouquinistes boxes"
      },
      {
        item_name: "Artisanal Macarons Box",
        description: "Delicately baked almond-meringue cookies with local, natural fruit and floral ganaches.",
        price_estimate: "$30 - $60 USD",
        location_tip: "Pierre Hermé Marais boutique"
      },
      {
        item_name: "Handmade Marais Perfume",
        description: "A custom-formulated scent composed of organic french lavender and rose notes by independent perfumers.",
        price_estimate: "$80 - $150 USD",
        location_tip: "Le Labo or local Marais perfumeries"
      }
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
        lng: 31.1342,
        etiquette_tips: "Do not attempt to climb the historic blocks of the pyramids; it is illegal and causes rapid erosion of the ancient stones.",
        historical_context: "Built around 2560 BC for Pharaoh Khufu, this was the tallest man-made structure on Earth for over 3,800 years, originally clad in polished white limestone.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "Egyptian Museum at Tahrir Square",
        type: "attraction",
        description: "The legendary pink-walled museum housing a massive, unparalleled collection of Pharaonic antiquities, golden treasures, and statues.",
        lat: 30.0478,
        lng: 31.2336,
        etiquette_tips: "Purchase a photography ticket if you plan to take photos. Do not touch any ancient stone sarcophagi or monuments.",
        historical_context: "Inaugurated in 1902, this was the first purpose-built museum in the Middle East designed to protect Egypt's heritage from foreign looting.",
        vibe: "Artisan & Creative"
      },
      {
        title: "Citadel of Saladin",
        type: "attraction",
        description: "A massive medieval Islamic fortification offering striking, panoramic views over Cairo and housing the gorgeous Alabaster Mosque.",
        lat: 30.0299,
        lng: 31.2611,
        etiquette_tips: "Remove shoes at the mosque entrance. Women must wear a head covering (provided for free at the entrance door) and dress modestly.",
        historical_context: "Constructed in 1176 by Saladin to defend Cairo from Crusaders, it served as the royal seat of Egyptian government for 700 years.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "Al-Muizz Historic Street",
        type: "hidden_gem",
        description: "A gorgeous corridor of medieval Islamic monuments, towers, and ancient brass-smiths.",
        lat: 30.0515,
        lng: 31.2618,
        etiquette_tips: "Walk respectfully. Accept sweet hibiscus tea when offered by local metal-smiths; it is a sign of welcome.",
        historical_context: "Dating back to the Fatimid dynasty in 969 AD, this street was the primary thoroughfare of Cairo, lined with magnificent palaces.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Cave Church of Saint Simon",
        type: "hidden_gem",
        description: "An extraordinary, massive Christian amphitheater church carved deep into the rocky cliffs of Mokattam Mountain.",
        lat: 30.0309,
        lng: 31.2745,
        etiquette_tips: "Keep voices soft; this is an active pilgrimage church serving the local Christian Zabbaleen community.",
        historical_context: "Established in the 1970s by the local recycling community, this amphitheater can hold 20,000 worshippers under the solid rock cliffs.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "Ibn Tulun Spiral Minaret",
        type: "hidden_gem",
        description: "Cairo's oldest intact mosque, celebrated for its unique external spiral staircase minaret inspired by Samarra architecture.",
        lat: 30.0287,
        lng: 31.2494,
        etiquette_tips: "Climb the spiral staircase one at a time and hold on to the central stone pillar, as there are no handrails.",
        historical_context: "Built in 879 AD, this mosque was constructed to withstand flooding, with its spiral minaret representing Mesopotamia's influence on Egypt.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Wekalet El Ghouri Sufi Stage",
        type: "event",
        description: "The spiritual home of the El Tannoura dance, where whirling Sufi rituals are performed.",
        lat: 30.0465,
        lng: 31.2612,
        etiquette_tips: "Arrive at least an hour early to secure tickets. No loud talking is allowed once the spiritual drumming begins.",
        historical_context: "This 16th-century stone caravanserai (Wekala) was originally a trade hub where travelling merchants stored spices and silks.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Abou Tarek Koshary",
        type: "food",
        description: "The legendary multi-story diner serving Cairo's most famous and beloved national Koshary dish.",
        lat: 30.0505,
        lng: 31.2392,
        etiquette_tips: "Tipping is expected here. Leave a small change (5-10 EGP) on the table for the servers.",
        historical_context: "Started in the 1950s as a tiny street cart by Abou Tarek, it evolved into a landmark restaurant visited by presidents and tourists.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Old Glassblowers Quarter",
        type: "shopping",
        description: "Watch local master glassblowers shape Muski turquoise glasses in high-heat kilns.",
        lat: 30.0385,
        lng: 31.2592,
        etiquette_tips: "Stand at a safe distance from the open kilns, and don't touch the glass pieces until they have fully cooled down.",
        historical_context: "Multigenerational families have operated wood-fired kilns in Old Cairo for centuries, recycling broken glass into magical teal utensils.",
        vibe: "Artisan & Creative"
      }
    ],
    impact_note: "Hiring registered local Egyptologist guides and purchasing Muski glassware directly from the glass-makers provides sustainable income directly to multigenerational artisan families.",
    quick_tips: [
      "Dress modestly, keeping shoulders and knees covered, especially when visiting active mosques or Coptic churches.",
      "Tipping (Baksheesh) is a standard custom for all small services; carry small-denomination bills of Egyptian pounds.",
      "Accept hibiscus tea (Karkadeh) when offered by shopkeepers; it is a traditional sign of hospitality."
    ],
    emergency_contacts: {
      police: "122 (Egyptian Emergency Police) or 126 (Tourist Police)",
      medical: "123 (Ambulance Helpline)",
      tourist_helpline: "19654 (Egypt Tourism Helpline)",
      tips: "Haggle with a polite smile. Keep small change for bathroom tips. Ensure you only drink bottled water."
    },
    marketplace: [
      {
        item_name: "Hand-Blown Muski Teal Glassware",
        description: "Beautiful translucent turquoise glasses shaped by local Cairo master families using recycled bottles.",
        price_estimate: "$10 - $25 USD",
        location_tip: "Old Glassblowers Quarter workshops"
      },
      {
        item_name: "Khan el-Khalili Brass Lantern",
        description: "Intricately hand-pierced geometric brass lamp that casts stunning, starry shadow arrays on surrounding walls.",
        price_estimate: "$30 - $70 USD",
        location_tip: "Khan el-Khalili artisan stalls"
      },
      {
        item_name: "Organic Egyptian Cotton Scarf",
        description: "Super-soft, lightweight, breathable scarves hand-loomed in Upper Egypt from premium long-staple cotton.",
        price_estimate: "$20 - $40 USD",
        location_tip: "Al-Muizz heritage cooperatives"
      }
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
        lng: -43.1648,
        etiquette_tips: "Avoid feeding the small marmosets (micos) on the mountain trails; it harms their digestive health and makes them aggressive.",
        historical_context: "Constructed in 1912, this was only the third passenger cable car system built in the world, dramatically changing access to Rio's bays.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Christ the Redeemer",
        type: "attraction",
        description: "The monumental Art Deco statue of Jesus Christ crowning Corcovado mountain, blessing Rio with open arms.",
        lat: -22.9519,
        lng: -43.2105,
        etiquette_tips: "Do not lie flat on the viewing deck to take pictures; it blocks other visitors. Maintain a respectful posture around this sacred monument.",
        historical_context: "Completed in 1931, the statue is made of reinforced concrete clad in a mosaic of thousands of triangular soapstone tiles.",
        vibe: "Sacred & Spiritual"
      },
      {
        title: "Copacabana Beach Walkway",
        type: "attraction",
        description: "The wave-patterned black and white stone mosaic walkway flanking one of the world's most vibrant and famous ocean shorelines.",
        lat: -22.9712,
        lng: -43.1852,
        etiquette_tips: "Do not leave your belongings unattended when going for a swim. Ask a friendly beach neighbor to watch them for you.",
        historical_context: "Designed by landscape architect Roberto Burle Marx in 1970, the abstract Portuguese stone wave pattern represents the flowing sea tides.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Parque Lage Mansion",
        type: "hidden_gem",
        description: "An Italian-style palace reclaimed by the lush Atlantic forest, rich in art history.",
        lat: -22.9585,
        lng: -43.2112,
        etiquette_tips: "Respect the central pool area; swimming, wading, or throwing coins into the water is strictly forbidden.",
        historical_context: "Originally a private sugar mill estate, in the 1920s it was redesigned by an Italian architect for singer Gabriella Besanzoni.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Real Gabinete Português",
        type: "hidden_gem",
        description: "A jaw-dropping, cathedral-like 19th-century library filled with dark hand-carved wood and thousands of rare Portuguese volumes.",
        lat: -22.9056,
        lng: -43.1818,
        etiquette_tips: "Speak only in whispers. Flash photography is strictly forbidden to protect the fragile ancient book spines.",
        historical_context: "Founded in 1837 by Portuguese immigrants, this neo-Manueline building houses the largest collection of Portuguese literature outside of Portugal.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Vista Chinesa Gazebo",
        type: "hidden_gem",
        description: "An oriental-style gazebo tucked in Tijuca Forest, offering a breathtaking, isolated perspective of Rio's bays and peaks.",
        lat: -22.9729,
        lng: -43.2492,
        etiquette_tips: "Avoid visiting the gazebo after sunset as forest roads are unlit and security patrols are reduced.",
        historical_context: "Built between 1902 and 1906, it honors the Chinese immigrants who were brought to Brazil to cultivate tea in the 19th century.",
        vibe: "Quiet & Reflective"
      },
      {
        title: "Pedra do Sal Samba Rock",
        type: "heritage",
        description: "The historical African-Brazilian stone plaza where street Samba was born.",
        lat: -22.8988,
        lng: -43.1856,
        etiquette_tips: "Buy drinks directly from local neighborhood street vendors to support the local Afro-Brazilian resident economy.",
        historical_context: "During the slave-trade era, this was a sacred stone salt-market. Afro-Brazilian workers gathered here to play music, founding modern Samba.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Casa da Feijoada",
        type: "food",
        description: "A cultural culinary institution dedicated to serving authentic, multi-pot Carioca Feijoada.",
        lat: -22.9832,
        lng: -43.2033,
        etiquette_tips: "Feijoada is a heavy, slow-digesting feast; do not rush the meal. Enjoy a caipirinha and let the afternoon pass slowly.",
        historical_context: "A preserved neighborhood diner that remained dedicated to slow-cooking Rio's complex black bean stew without cutting corners.",
        vibe: "Bustling & Energetic"
      },
      {
        title: "Santa Teresa Artisan Collective",
        type: "shopping",
        description: "Explore hillside studios showcasing beautiful hand-carved wood crafts and custom tapestries.",
        lat: -22.9248,
        lng: -43.1878,
        etiquette_tips: "Ask the artists about their process; they are extremely friendly and love explaining the history behind their designs.",
        historical_context: "Since the 1960s, Santa Teresa has been a bohemian enclave for artists who set up studios in grand, dilapidated 19th-century mansions.",
        vibe: "Artisan & Creative"
      }
    ],
    impact_note: "Supporting community-run tours in Santa Teresa and buying cangas from local beach vendors ensures tourism benefits resident families directly.",
    quick_tips: [
      "Carry only the cash you need for the day and leave valuable jewelry at your hotel to enjoy the city with peace of mind.",
      "Stay hydrated with cold, fresh coconut water (Água de Coco) readily available from kiosks along the beachfront.",
      "Learn a few basic Portuguese greetings like 'Tudo bem?' to connect warmly with locals."
    ],
    emergency_contacts: {
      police: "190 (Military Police) or 127 (Tourist Police)",
      medical: "192 (SAMU Medical Ambulance)",
      tourist_helpline: "0800-707-1800 (Rio Tourism Helpline)",
      tips: "Do not bring phones or wallets out in plain view on beaches or busy avenues. Carry only essential cash."
    },
    marketplace: [
      {
        item_name: "Handmade Canga Tapestry",
        description: "A beautiful, vibrant beach wrap hand-dyed with local botanical or geometric wave motifs by favela co-ops.",
        price_estimate: "$12 - $25 USD",
        location_tip: "Copacabana local street vendors"
      },
      {
        item_name: "Santa Teresa Clay Figure",
        description: "Hand-sculpted and painted clay figurines representing historic street musicians and folklore characters.",
        price_estimate: "$18 - $35 USD",
        location_tip: "Santa Teresa Artisan Collective studios"
      },
      {
        item_name: "Chorinho Acoustic Guitar Vinyl",
        description: "Rare vinyl records of historic acoustic instrumental guitar music sourced from Lapa antique booksellers.",
        price_estimate: "$15 - $40 USD",
        location_tip: "Lapa historic flea market"
      }
    ]
  }
};
