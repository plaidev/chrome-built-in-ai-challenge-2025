# AI-Powered Travel Activity Assistant

> **Google Chrome Built-in AI Challenge 2025 Submission**

An intelligent travel activity search assistant that leverages Chrome's Built-in AI APIs to help travel agents quickly understand customer needs and find personalized activity recommendations.

## 🌐 Live Demo

**[https://chrome-built-in-ai-challenge-2025.vercel.app/](https://chrome-built-in-ai-challenge-2025.vercel.app/)** *(Requires Chrome Canary/Dev with AI flags enabled)*

## 🎥 Demo Video

**[Watch Demo Video (3 minutes)](https://www.youtube.com/watch?v=vm_aq-CtGXs)**

## 🌟 Project Overview

This application revolutionizes the travel consultation process by using Chrome's Built-in AI to:
- **Transcribe and summarize** customer conversations in real-time
- **Extract key travel requirements** automatically (destination, dates, budget, preferences)
- **Provide intelligent suggestions** for missing information
- **Search and recommend activities** from multiple platforms (Klook, Trip.com, Expedia)

### Problem Statement

Travel agents face multiple challenges during customer consultations:

1. **Manual Note-Taking Overhead**: Agents spend significant time writing notes instead of engaging with customers, often missing important details or forgetting to ask key questions.

2. **Privacy & Compliance Concerns**: Traditional cloud-based transcription services require sending sensitive customer conversations (including personal information, travel plans, and payment details) to external servers, raising GDPR and data protection concerns.

3. **Inefficient Information Extraction**: Converting free-form conversations into structured travel requirements is time-consuming and error-prone.

4. **Training and Quality Assurance**: Less experienced staff often struggle to remember all necessary questions during consultations, leading to incomplete information gathering and reduced service quality. Traditional training takes months and requires constant supervision.

**Our Solution**: This application leverages Chrome's Built-in AI to process conversations entirely on-device, ensuring zero data transmission to external servers while automating the consultation workflow. The AI assistant guides staff through comprehensive information gathering with real-time suggestions, enabling even junior agents to deliver expert-level consultations. Agents can focus on building customer relationships while maintaining complete privacy compliance.

## 🤖 Chrome Built-in AI APIs Used

### 1. **Prompt API** (Primary)
- Real-time analysis of conversation transcripts
- Intelligent extraction of travel requirements (12-item structured format)
- Context-aware suggestions for missing information
- Natural language understanding for customer intent

### 2. **Summarizer API**
- Automatic summarization of customer conversations
- Structured output generation for activity search
- Key information extraction from unstructured dialogue

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vanilla JS)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Prompt API │  │ Summarizer   │  │ Audio Input  │      │
│  │              │  │     API      │  │ (Web Speech) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AI Assistant (Prompt API)                     │   │
│  │  - Analyze conversation                               │   │
│  │  - Extract travel requirements                        │   │
│  │  - Suggest missing information                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Summarizer (Summarizer API)                     │   │
│  │  - Generate structured summary                        │   │
│  │  - 12-item travel requirement format                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Gemini 2.5 Flash + Google Search Grounding       │   │
│  │  - Multi-platform activity search                     │   │
│  │  - Real-time web search (Klook, Trip.com, Expedia)   │   │
│  │  - OG image extraction                                │   │
│  │  - Mock mode for development/demo                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### 1. **Real-time Conversation Analysis**
- Live transcription using Web Speech API
- Instant AI-powered analysis of customer needs
- Dynamic suggestion generation for missing information

### 2. **Intelligent Summarization**
- Automatic extraction of 12 key travel requirements:
  - Destination
  - Travel Dates / Duration
  - Number of Travelers
  - Traveler Profile (age, special needs)
  - Activity Type / Interests
  - Budget per Person
  - Time Preference
  - Physical Activity Level
  - Group Type
  - Language Preference
  - Transportation
  - Special Requirements

### 3. **AI-Driven Activity Search**
- Multi-platform search (Klook, Trip.com, Expedia)
- Google Search Grounding for real-time web results
- Intelligent diversity in recommendations
- Rich metadata with images and references

### 4. **Staff-Friendly UX**
- Clean, intuitive interface
- Editable AI summaries
- Staff notes integration
- One-click activity search
- Skeleton loading states
- Responsive design

## 🚀 Getting Started

### Prerequisites

**For Frontend (Chrome Built-in AI):**
- Google Chrome Canary/Dev (version 127+)
- Enable Chrome AI features:
  1. Navigate to `chrome://flags`
  2. Enable the following flags:
     - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
     - `#prompt-api-for-gemini-nano` → **Enabled**
     - `#summarization-api-for-gemini-nano` → **Enabled**
  3. Restart Chrome
  4. Verify Gemini Nano is available:
     - Open DevTools Console
     - Run: `await ai.languageModel.capabilities()`
     - Should return: `{available: "readily"}`

**For Backend:**
- Node.js 18+
- Google Cloud Platform account (optional - can run in Mock Mode)
- Vertex AI API enabled (required only for production mode)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/plaidev/chrome-built-in-ai-challenge-2025.git
cd chrome-built-in-ai-challenge-2025
```

#### 2. Backend Setup

**Option A: Mock Mode (Demo - No GCP Required)**

Perfect for testing and demonstrations without GCP credentials.

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The default .env has MOCK_MODE=true, so you can start immediately
npm start
```

The server will start in **Mock Mode** and return sample activity data.

**Option B: Production Mode (Real GCP APIs)**

For production use with real Gemini API calls.

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file:
# MOCK_MODE=false
# GCP_PROJECT=your-gcp-project-id
# GCP_LOCATION=us-central1
# PORT=8080

# Start the server
npm start
```

The backend server will start on `http://localhost:8080`

**Mock Mode vs Production Mode:**
- `MOCK_MODE=true` - Returns sample Paris activity data instantly (no GCP required)
- `MOCK_MODE=false` - Uses real Gemini 2.5 Flash API with Google Search Grounding

#### 3. Frontend Setup

```bash
cd ../frontend

# Option 1: Using Python's HTTP server
python3 -m http.server 8000

# Option 2: Using Node.js http-server
npx http-server -p 8000

# Option 3: Using VS Code Live Server extension
# Just right-click index.html and select "Open with Live Server"
```

Access the application at `http://localhost:8000`

## 🧪 Testing Instructions

### Test Scenario 1: Paris Family Trip (Full Demo)

1. **Start the Application**
   - Open Chrome Canary with AI flags enabled
   - Navigate to `http://localhost:8000`
   - Ensure backend is running (check for mock mode warning if needed)

2. **Input Conversation**
   - Copy the following sample conversation into the text input area:

   ```
   Speaker 1: Hi Mr. Johnson, thank you for coming in today. I'm Emily White, and I'll be assisting you.

   Speaker 1: I understand you and your family—three of you—will be in Paris from November 10th to 17th, and you're looking for local activities. I heard your son is in 4th grade and this will be his first trip to Europe.

   Speaker 2: That's right. We want him to have a memorable experience.

   Speaker 1: Of course. I'd recommend a mix of sightseeing and fun local experiences—like visiting the Eiffel Tower, taking a Seine River cruise, and joining a French pastry-making class together. Disneyland Paris is also a great option for families.

   Speaker 2: That sounds great. He'd love Disneyland, and the pastry class sounds fun for all of us.

   Speaker 1: If you'd like to explore beyond the city, a day trip to Mont Saint-Michel is another great choice. The island's medieval abbey makes it enjoyable for both kids and adults. All of these activities are generally around $200 per person.

   Speaker 2: That's perfect. So Paris sightseeing, Disneyland, the pastry class, and maybe Mont Saint-Michel.

   Speaker 1: Exactly. I'll prepare a few personalized activity plans for your week in Paris with the budget in mind.

   Speaker 2: That would be great—thank you so much!
   ```

3. **Observe AI Analysis**
   - Wait 2-3 seconds for automatic processing
   - **AI Summary** section should populate with structured information:
     - Destination: Paris, France
     - Travel Dates: November 10th-17th (7 days)
     - Number of Travelers: 3
     - Traveler Profile: 4th grade child, first trip to Europe
     - Activity Interests: Eiffel Tower, Seine cruise, pastry class, Disneyland, Mont Saint-Michel
     - Budget: ~$200 per person
   - **AI Assistant** section should show:
     - ✓ Collected information (green checkmarks)
     - Missing items (if any) with suggestions

4. **Search Activities**
   - Click the **"Search Activities"** button
   - Page should auto-scroll to results section
   - Skeleton cards appear during loading
   - After 3-5 seconds, activity recommendations appear from 3 platforms:
     - **Klook**: Eiffel Tower, Louvre Museum
     - **Trip.com**: Disneyland Paris, Versailles Palace
     - **Expedia**: French Pastry Class, Mont Saint-Michel Day Trip

5. **Verify Results**
   - Each activity card should display:
     - Title and description
     - Highlights (bullet points)
     - Budget information
     - Platform name (Klook/Trip.com/Expedia)
     - References with clickable links
   - If in **Mock Mode**, a warning banner appears: "⚠️ MOCK DATA - This is sample data for demonstration purposes"

### Test Scenario 2: Voice Input (Chrome Canary only)

1. **Enable Microphone**
   - Click the microphone button in the "Customer Conversation" section
   - Allow microphone permissions when prompted

2. **Speak Naturally**
   - Read the sample conversation aloud (or improvise a travel consultation)
   - Watch the real-time transcription appear in the text area

3. **Verify AI Processing**
   - After speaking, click "Stop Recording"
   - AI should analyze the transcription automatically
   - Summary and suggestions should populate

### Test Scenario 3: Manual Editing

1. **Edit AI Summary**
   - Click on the AI Summary box
   - Modify any information (e.g., change budget, add preferences)
   - Changes are immediately saved

2. **Add Staff Notes**
   - Click on the "Staff Notes" section
   - Add custom notes like: "Customer prefers morning activities. Son has peanut allergy."

3. **Search with Custom Input**
   - Click "Search Activities"
   - Results should incorporate both AI summary and staff notes

### Test Scenario 4: Mock Mode (No GCP Credentials)

Perfect for demos and testing without setting up GCP.

1. **Edit .env File**
   ```bash
   # In backend directory, edit .env
   MOCK_MODE=true
   ```

2. **Restart Backend**
   ```bash
   cd backend
   npm start
   ```

3. **Verify Mock Mode**
   - Console should show: "⚠️ WARNING: Running in MOCK MODE"
   - Activity search returns sample Paris activities instantly (< 500ms)
   - All features work with mock data
   - Each activity card shows "⚠️ MOCK DATA" banner

4. **Test Activity Search**
   - Use the same sample conversation from Test Scenario 1
   - Click "Search Activities"
   - Results appear immediately with 6 sample activities:
     - **Klook**: Eiffel Tower, Louvre Museum
     - **Trip.com**: Disneyland Paris, Versailles Palace
     - **Expedia**: French Pastry Class, Mont Saint-Michel

## 🎯 Chrome Built-in AI API Usage Details

### Prompt API Implementation

**Location:** `frontend/js/ai/ai-assistant.js`

```javascript
// Initialize AI session
const session = await ai.languageModel.create({
  systemPrompt: `You are an AI assistant helping travel agents...`,
  temperature: 0.7,
  topK: 40
});

// Analyze conversation
const response = await session.prompt(conversationText);
```

**Key Features:**
- Custom system prompts for travel domain expertise
- Temperature and topK tuning for consistent outputs
- Context-aware analysis of customer conversations
- Structured JSON output for travel requirements

### Summarizer API Implementation

**Location:** `frontend/js/ai/summarizer.js`

```javascript
// Create summarizer with custom format
const summarizer = await ai.summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'long'
});

// Generate structured summary
const summary = await summarizer.summarize(conversationText);
```

**Key Features:**
- Custom format for 12-item travel requirements
- Key-points extraction from natural dialogue
- Markdown formatting for readability
- Long-form summaries for comprehensive details

## 📁 Project Structure

```
built-in-ai-challenge/
├── README.md                          # This file
├── demo-dialog.txt                    # Sample conversation for testing
├── frontend/                          # Frontend application
│   ├── index.html                     # Main HTML
│   ├── style.css                      # Styling
│   └── js/
│       ├── main.js                    # Application entry point
│       ├── config.js                  # Configuration (auto-detects env)
│       ├── ai/
│       │   ├── ai-assistant.js        # Prompt API - conversation analysis
│       │   └── summarizer.js          # Summarizer API - structured summaries
│       ├── speech/
│       │   ├── audio-transcriber.js   # Web Speech API integration
│       │   └── pcm-processor.js       # Audio processing
│       └── ui/
│           └── display.js             # UI rendering and interactions
└── backend/                           # Backend API server
    ├── package.json
    ├── .env.example                   # Environment variables template
    ├── server.js                      # Express server with Gemini API
    └── README.md                      # Backend-specific documentation
```

## 🔧 Configuration

### Frontend (`frontend/js/config.js`)

The frontend automatically detects the environment:
- **Production** (deployed): Uses production API URL
- **Local** (localhost/127.0.0.1): Uses `http://localhost:8080`

```javascript
const isProduction = window.location.hostname !== 'localhost'
                  && window.location.hostname !== '127.0.0.1';
export const API_BASE_URL = isProduction
  ? "https://built-in-ai-challenge-api-436424395724.us-central1.run.app"
  : "http://localhost:8080";
```

### Backend (`backend/.env`)

**Mock Mode (Default - No GCP Required):**
```env
# Mock Mode - returns sample data for demo/testing
MOCK_MODE=true

# Server Configuration
PORT=8080
```

**Production Mode (Requires GCP):**
```env
# Disable Mock Mode to use real APIs
MOCK_MODE=false

# Google Cloud Platform Configuration (required when MOCK_MODE=false)
GCP_PROJECT=your-gcp-project-id
GCP_LOCATION=us-central1

# Server Configuration
PORT=8080
```

**Important:**
- When `MOCK_MODE=true`: Server runs without GCP credentials and returns sample data
- When `MOCK_MODE=false`: Server requires valid `GCP_PROJECT` and `GCP_LOCATION` or will fail to start

## 🎨 UI/UX Highlights

- **Clean, Professional Design**: Travel agency-focused interface
- **Real-time Feedback**: Instant AI analysis and suggestions
- **Skeleton Loading States**: Smooth transitions during API calls
- **Editable AI Outputs**: Staff can refine AI-generated summaries
- **Responsive Layout**: Works on desktop and tablet
- **Auto-scroll**: Automatically scrolls to results when searching
- **Color-coded Status**: Visual indicators for collected/missing info
- **Platform Badges**: Clear source attribution for activities

## 🔐 Privacy & Security

### Complete On-Device Processing
- **Web Speech API with `processLocally`**: Speech recognition runs entirely on-device without sending audio to external servers
- **Prompt API for High-Accuracy Transcription**: Advanced on-device speech-to-text using Chrome's built-in AI (Gemini Nano)
- **Client-side AI Analysis**: Prompt API and Summarizer API run locally in Chrome - conversation data never leaves the user's browser
- **Zero Audio Transmission**: Customer conversations are processed locally, protecting sensitive consultation data

### Privacy-First Data Handling
- **Personal Information Removal**: Only anonymized summaries are sent to the backend API, not raw conversation transcripts
- **No Data Storage**: Conversations are processed in-memory only and discarded after session ends
- **Minimal Data Transfer**: Backend receives only structured travel requirements, not customer names or personal details

### Security Measures
- **API Security**: Backend uses Google Cloud authentication
- **CORS Enabled**: Secure cross-origin resource sharing
- **Environment Variables**: Sensitive credentials never exposed in client code
- **HTTPS Only**: All production API calls use encrypted connections

## 🐛 Known Limitations

1. **Chrome Built-in AI Availability**: Requires Chrome Canary/Dev with specific flags enabled
2. **Gemini Nano Model**: Must be downloaded (~1.7GB) on first use
3. **Voice Input**: Web Speech API works best with clear audio
4. **Language Support**: Currently optimized for English conversations
5. **Rate Limits**: Google Search Grounding has API quotas

## 🛠️ Troubleshooting

### Issue: "AI not available"
**Solution:**
1. Check Chrome version (127+)
2. Enable flags in `chrome://flags`
3. Run in DevTools: `await ai.languageModel.capabilities()`
4. Restart Chrome

### Issue: "Backend connection failed"
**Solution:**
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check `.env` file exists with correct values
3. Review backend logs for errors
4. Try Mock Mode (remove `.env` file)

## 👥 Team

**PLAID, Inc. - Data Mind**

## 📄 License

MIT License - see LICENSE file for details
