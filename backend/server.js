import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import ogs from 'open-graph-scraper';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Mock Mode Configuration
const MOCK_MODE = process.env.MOCK_MODE === 'true';

// GCP Configuration
const GCP_PROJECT = process.env.GCP_PROJECT;
const GCP_LOCATION = process.env.GCP_LOCATION;

if (MOCK_MODE) {
  console.warn('⚠️  WARNING: Running in MOCK MODE');
  console.warn('   Mock data will be returned for API requests');
  console.warn('   Set MOCK_MODE=false and configure GCP credentials to use real API');
} else {
  // Production mode - GCP credentials are required
  if (!GCP_PROJECT || !GCP_LOCATION) {
    console.error('❌ ERROR: GCP_PROJECT and GCP_LOCATION are required when MOCK_MODE=false');
    console.error('   Please set these environment variables or enable MOCK_MODE=true for demo');
    process.exit(1);
  }
  console.log('✅ Running in PRODUCTION MODE with GCP credentials');
}

// CORS configuration - Whitelist allowed origins
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:5501',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5501',
  'https://chrome-built-in-ai-challenge-2025.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Gemini AI with Vertex AI (only if not in mock mode)
let ai = null;
if (!MOCK_MODE) {
  ai = new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT,
    location: GCP_LOCATION
  });
}

/**
 * Generate mock activity search data
 */
function generateMockActivityData(query) {
  return {
    success: true,
    query,
    results: [
      {
        platform: 'Klook',
        domain: 'klook.com',
        responseText: `### 1. Eiffel Tower Summit Access with Optional Seine River Cruise

Experience Paris's most iconic landmark with priority access to the summit, offering breathtaking panoramic views of the City of Light.

**Description:**
Skip the long lines and ascend to the top of the Eiffel Tower. This ticket includes access to all three levels, including the exclusive summit. Optional Seine River cruise available for a complete Parisian experience.

**Highlights:**
- Priority access to avoid long queues
- Access to all three levels including the summit
- Stunning 360-degree views of Paris
- Optional 1-hour Seine River cruise
- Audio guide available in multiple languages

**Budget:** $45-65 per person (depending on options selected)

---

### 2. Louvre Museum Skip-the-Line Ticket with Audio Guide

Discover the world's largest art museum and see masterpieces like the Mona Lisa and Venus de Milo without waiting in line.

**Description:**
Explore over 35,000 works of art spanning from ancient civilizations to the 19th century. Perfect for families with audio guides designed for all ages.

**Highlights:**
- Skip-the-line entrance
- Audio guide in 10+ languages including kid-friendly versions
- See iconic works: Mona Lisa, Venus de Milo, Winged Victory
- Self-paced exploration
- Valid for full day access

**Budget:** $25-35 per person`,
        textWithCitations: `## Klook

> ⚠️ **MOCK DATA** - This is sample data for demonstration purposes

### 1. Eiffel Tower Summit Access with Optional Seine River Cruise

Experience Paris's most iconic landmark with priority access to the summit, offering breathtaking panoramic views of the City of Light.

**Description:**
Skip the long lines and ascend to the top of the Eiffel Tower. This ticket includes access to all three levels, including the exclusive summit. Optional Seine River cruise available for a complete Parisian experience.

**Highlights:**
- Priority access to avoid long queues
- Access to all three levels including the summit
- Stunning 360-degree views of Paris
- Optional 1-hour Seine River cruise
- Audio guide available in multiple languages

**Budget:** $45-65 per person (depending on options selected)

---

### 2. Louvre Museum Skip-the-Line Ticket with Audio Guide

Discover the world's largest art museum and see masterpieces like the Mona Lisa and Venus de Milo without waiting in line.

**Description:**
Explore over 35,000 works of art spanning from ancient civilizations to the 19th century. Perfect for families with audio guides designed for all ages.

**Highlights:**
- Skip-the-line entrance
- Audio guide in 10+ languages including kid-friendly versions
- See iconic works: Mona Lisa, Venus de Milo, Winged Victory
- Self-paced exploration
- Valid for full day access

**Budget:** $25-35 per person

**References:**
[1] [Eiffel Tower Summit Access - Klook](https://www.klook.com/activity/mock-eiffel-tower/)
[2] [Louvre Museum Skip-the-Line - Klook](https://www.klook.com/activity/mock-louvre/)`,
        sources: [
          {
            index: 1,
            url: 'https://www.klook.com/activity/mock-eiffel-tower/',
            title: 'Eiffel Tower Summit Access - Klook',
            domain: 'klook.com'
          },
          {
            index: 2,
            url: 'https://www.klook.com/activity/mock-louvre/',
            title: 'Louvre Museum Skip-the-Line - Klook',
            domain: 'klook.com'
          }
        ],
        images: [],
        metadata: {
          groundingChunksCount: 2,
          groundingSupportsCount: 0,
          webSearchQueriesCount: 1
        }
      },
      {
        platform: 'Trip.com',
        domain: 'trip.com',
        responseText: `### 1. Disneyland Paris 1-Day 2-Park Ticket

The perfect family adventure! Explore both Disneyland Park and Walt Disney Studios Park in one magical day.

**Description:**
Create unforgettable memories with your family at Disneyland Paris. This ticket grants access to both theme parks, featuring classic Disney attractions, spectacular shows, and character meet-and-greets.

**Highlights:**
- Access to both Disneyland Park and Walt Disney Studios
- Over 50 attractions and rides
- Meet beloved Disney characters
- Spectacular parades and nighttime shows
- Family-friendly dining options throughout the parks

**Budget:** $75-95 per person (varies by season)

---

### 2. Versailles Palace and Gardens Skip-the-Line Tour

Step back in time to the opulent world of French royalty with a guided tour of the magnificent Palace of Versailles.

**Description:**
Avoid the crowds with priority access to the Palace of Versailles. Your guide will bring history to life as you explore the Hall of Mirrors, Royal Apartments, and stunning gardens.

**Highlights:**
- Skip-the-line entry to the palace
- Expert English-speaking guide
- Explore the Hall of Mirrors and Royal Apartments
- Free time to wander the beautiful gardens
- Round-trip transportation from Paris available

**Budget:** $65-85 per person`,
        textWithCitations: `## Trip.com

> ⚠️ **MOCK DATA** - This is sample data for demonstration purposes

### 1. Disneyland Paris 1-Day 2-Park Ticket

The perfect family adventure! Explore both Disneyland Park and Walt Disney Studios Park in one magical day.

**Description:**
Create unforgettable memories with your family at Disneyland Paris. This ticket grants access to both theme parks, featuring classic Disney attractions, spectacular shows, and character meet-and-greets.

**Highlights:**
- Access to both Disneyland Park and Walt Disney Studios
- Over 50 attractions and rides
- Meet beloved Disney characters
- Spectacular parades and nighttime shows
- Family-friendly dining options throughout the parks

**Budget:** $75-95 per person (varies by season)

---

### 2. Versailles Palace and Gardens Skip-the-Line Tour

Step back in time to the opulent world of French royalty with a guided tour of the magnificent Palace of Versailles.

**Description:**
Avoid the crowds with priority access to the Palace of Versailles. Your guide will bring history to life as you explore the Hall of Mirrors, Royal Apartments, and stunning gardens.

**Highlights:**
- Skip-the-line entry to the palace
- Expert English-speaking guide
- Explore the Hall of Mirrors and Royal Apartments
- Free time to wander the beautiful gardens
- Round-trip transportation from Paris available

**Budget:** $65-85 per person

**References:**
[1] [Disneyland Paris 1-Day 2-Park Ticket - Trip.com](https://www.trip.com/activity/mock-disneyland-paris/)
[2] [Versailles Palace and Gardens Skip-the-Line Tour - Trip.com](https://www.trip.com/activity/mock-versailles/)`,
        sources: [
          {
            index: 1,
            url: 'https://www.trip.com/activity/mock-disneyland-paris/',
            title: 'Disneyland Paris Tickets - Trip.com',
            domain: 'trip.com'
          },
          {
            index: 2,
            url: 'https://www.trip.com/activity/mock-versailles/',
            title: 'Versailles Palace Tour - Trip.com',
            domain: 'trip.com'
          }
        ],
        images: [],
        metadata: {
          groundingChunksCount: 2,
          groundingSupportsCount: 0,
          webSearchQueriesCount: 1
        }
      },
      {
        platform: 'Expedia',
        domain: 'expedia.com',
        responseText: `### 1. French Pastry Baking Class in Paris

Learn the art of French pastry-making with a hands-on cooking class led by a professional pastry chef.

**Description:**
Perfect for families! This interactive class teaches you how to make authentic French pastries like croissants, éclairs, or macarons. Enjoy your creations afterward with coffee or hot chocolate.

**Highlights:**
- Hands-on cooking experience for all ages
- Professional pastry chef instruction
- Learn to make 2-3 classic French pastries
- Enjoy your homemade treats
- Recipe cards to take home

**Budget:** $80-100 per person

---

### 2. Mont Saint-Michel Day Trip from Paris

Discover the magical island abbey of Mont Saint-Michel, one of France's most iconic landmarks.

**Description:**
Journey to Normandy to explore this UNESCO World Heritage site. Walk through medieval streets, visit the stunning abbey, and enjoy the dramatic tidal surroundings.

**Highlights:**
- Round-trip transportation from Paris
- English-speaking guide
- Guided tour of the abbey
- Free time to explore the island village
- Photo opportunities with breathtaking views
- Optional lunch stop in Normandy

**Budget:** $150-180 per person (includes transportation and entrance fees)`,
        textWithCitations: `## Expedia

> ⚠️ **MOCK DATA** - This is sample data for demonstration purposes

### 1. French Pastry Baking Class in Paris

Learn the art of French pastry-making with a hands-on cooking class led by a professional pastry chef.

**Description:**
Perfect for families! This interactive class teaches you how to make authentic French pastries like croissants, éclairs, or macarons. Enjoy your creations afterward with coffee or hot chocolate.

**Highlights:**
- Hands-on cooking experience for all ages
- Professional pastry chef instruction
- Learn to make 2-3 classic French pastries
- Enjoy your homemade treats
- Recipe cards to take home

**Budget:** $80-100 per person

---

### 2. Mont Saint-Michel Day Trip from Paris

Discover the magical island abbey of Mont Saint-Michel, one of France's most iconic landmarks.

**Description:**
Journey to Normandy to explore this UNESCO World Heritage site. Walk through medieval streets, visit the stunning abbey, and enjoy the dramatic tidal surroundings.

**Highlights:**
- Round-trip transportation from Paris
- English-speaking guide
- Guided tour of the abbey
- Free time to explore the island village
- Photo opportunities with breathtaking views
- Optional lunch stop in Normandy

**Budget:** $150-180 per person (includes transportation and entrance fees)

**References:**
[1] [French Pastry Baking Class in Paris - Expedia](https://www.expedia.com/things-to-do/mock-pastry-class/)
[2] [Mont Saint-Michel Day Trip from Paris - Expedia](https://www.expedia.com/things-to-do/mock-mont-saint-michel/)`,
        sources: [
          {
            index: 1,
            url: 'https://www.expedia.com/things-to-do/mock-pastry-class/',
            title: 'French Pastry Class - Expedia',
            domain: 'expedia.com'
          },
          {
            index: 2,
            url: 'https://www.expedia.com/things-to-do/mock-mont-saint-michel/',
            title: 'Mont Saint-Michel Day Trip - Expedia',
            domain: 'expedia.com'
          }
        ],
        images: [],
        metadata: {
          groundingChunksCount: 2,
          groundingSupportsCount: 0,
          webSearchQueriesCount: 1
        }
      }
    ],
    searchTime: 1500,
    searchTimeSeconds: 1.5,
    timestamp: new Date().toISOString(),
    mockMode: true
  };
}

/**
 * Fetch Open Graph image from URL
 */
async function fetchOGImage(url) {
  try {
    const { result } = await ogs({ url });

    if (result.success && result.ogImage) {
      // Get the first image
      const image = Array.isArray(result.ogImage) ? result.ogImage[0] : result.ogImage;
      return {
        url: image.url,
        alt: result.ogTitle || 'Activity image',
        width: image.width,
        height: image.height,
        isFallback: false
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch OG image from ${url}:`, error.message);
    return null;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'built-in-ai-challenge-api',
    timestamp: new Date().toISOString()
  });
});

// Activity search endpoint with Google Search grounding
app.post('/api/activity-search', async (req, res) => {
  const startTime = Date.now();

  try {
    const { query, includeImages = true } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`\n🔍 Activity Search Request`);
    console.log(`Query: ${query}`);
    console.log(`Include Images: ${includeImages}`);

    // Return mock data if in mock mode
    if (MOCK_MODE) {
      console.log('📦 Returning mock data (MOCK_MODE enabled)');
      const mockData = generateMockActivityData(query);
      return res.json(mockData);
    }

    // Search all platforms in a single request
    const platforms = [
      { name: 'Klook', domain: 'klook.com' },
      { name: 'Trip.com', domain: 'trip.com' },
      { name: 'Expedia', domain: 'expedia.com' }
    ];

    console.log(`\n🔍 Searching ${platforms.length} platforms in one request...`);

    // Construct combined search prompt for all platforms
    const searchPrompt = `Search for activities that match these requirements: "${query}"

Search the following platforms and return results for each:
1. Klook (site:klook.com) - Find 2 DIFFERENT activities
2. Trip.com (site:trip.com) - Find 2 DIFFERENT activities or attractions
3. Expedia (site:expedia.com) - Find 2 DIFFERENT things to do or activities

IMPORTANT RULES:
- Each activity within a platform must be unique and different from each other
- Activities across different platforms should also be diverse and varied
- Avoid recommending the same or very similar activities across platforms
- Prioritize variety: if one platform suggests "Tokyo Disneyland", other platforms should suggest different types of activities

For each activity, include:
- Title
- Description
- Highlights - use bullet points
- Budget

CRITICAL FORMATTING RULES:
1. Use EXACTLY these headers on separate lines:
   ## Klook
   ## Trip.com
   ## Expedia
2. Each platform must be in its own section with its own header
3. Do NOT combine platforms or use numbers in headers
4. Use bullet points (- or •) for Highlights to make them easy to read`;

    // Grounding configuration to search all domains
    const config = {
      tools: [{ googleSearch: {} }],
      groundingConfig: {
        sources: [
          {
            type: 'WEB',
            webSearchQueries: [
              'site:klook.com',
              'site:trip.com',
              'site:expedia.com'
            ]
          }
        ]
      }
    };

    // Execute combined grounded search
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: searchPrompt,
      config,
    });

    console.log(`📊 Response received: ${response.text.length} characters`);

    // Get plain text without inline citations
    const textWithCitations = response.text;

    // Extract grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    console.log(`📚 Total Grounding Sources: ${groundingChunks.length}`);

    // Split response by platform headers
    const platformResults = [];
    const platformSections = textWithCitations.split(/##\s*(Klook|Trip\.com|Expedia)/i);

    for (let i = 1; i < platformSections.length; i += 2) {
      const platformName = platformSections[i].trim();
      const platformText = platformSections[i + 1] || '';

      const platform = platforms.find(p =>
        p.name.toLowerCase() === platformName.toLowerCase()
      );

      if (!platform) continue;

      console.log(`\n📋 Processing ${platform.name}...`);

      // Get sources for this platform based on domain
      const platformSources = groundingChunks
        .map((chunk, index) => ({
          index: index + 1,
          url: chunk.web?.uri || 'No URI',
          title: chunk.web?.title || 'No title',
          domain: chunk.web?.domain || 'Unknown'
        }))
        .filter(source => source.domain.includes(platform.domain.replace('.com', '')));

      console.log(`   Found ${platformSources.length} sources`);

      // Fetch OG images if requested
      let images = [];
      if (includeImages && platformSources.length > 0) {
        const urls = platformSources.map(s => s.url);
        console.log(`   Fetching ${urls.length} images...`);

        const imagePromises = urls.map(async (url) => {
          const ogData = await fetchOGImage(url);
          return ogData;
        });

        images = await Promise.all(imagePromises);
        images = images.filter(Boolean);
      }

      // Build references section for this platform
      let referencesSection = '';
      if (platformSources.length > 0) {
        referencesSection = '\n\n**References:**\n' + platformSources
          .map((source, idx) => `[${idx + 1}] [${source.title}](${source.url})`)
          .join('\n');
      }

      platformResults.push({
        platform: platform.name,
        domain: platform.domain,
        responseText: platformText.trim(),
        textWithCitations: `## ${platform.name}\n${platformText.trim()}${referencesSection}`,
        sources: platformSources,
        images,
        metadata: {
          groundingChunksCount: platformSources.length,
          groundingSupportsCount: groundingMetadata?.groundingSupports?.length || 0,
          webSearchQueriesCount: groundingMetadata?.webSearchQueries?.length || 0
        }
      });
    }

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    console.log(`\n✅ Completed search for ${platformResults.length} platforms`);
    console.log(`⏱️  Total search time: ${searchTime}ms (${(searchTime / 1000).toFixed(2)}s)`);

    res.json({
      success: true,
      query,
      results: platformResults,
      searchTime: searchTime,
      searchTimeSeconds: parseFloat((searchTime / 1000).toFixed(2)),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Activity search error:', error);
    res.status(500).json({
      success: false,
      error: 'Activity search failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Built-in AI Challenge API Server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/activity-search - Activity search with references and OG images`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
