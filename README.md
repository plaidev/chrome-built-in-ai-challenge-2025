# AI Travel Activity Planning Assistant

> **Google Chrome Built-in AI Challenge 2025 Submission**

An intelligent travel activity search assistant that leverages Chrome's Built-in AI APIs to help travel agents quickly understand customer needs and find personalized activity recommendations.

## 🌐 Live Demo

**[https://chrome-built-in-ai-challenge-2025.vercel.app/](https://chrome-built-in-ai-challenge-2025.vercel.app/)** *(Requires Chrome Canary/Dev with AI flags enabled)*

## 🎥 Demo Video

**[Watch Demo Video](https://www.youtube.com/watch?v=vm_aq-CtGXs)**

## 🌟 Project Overview

**AI Travel Activity Planning Assistant** empowers travel agents with on-device AI intelligence, enabling privacy-first customer consultations through Chrome's Built-in AI.

### What it does

✅ **Privacy-First Conversation Processing**: All AI analysis runs entirely on-device using Gemini Nano (Prompt API / Summarizer API). Conversation data never leaves the device, ensuring full GDPR compliance.

✅ **Real-Time Staff Guidance**: The Prompt API instantly analyzes ongoing dialogues, extracting key travel requirements and suggesting the next best question (e.g., "Ask about activity level" or "Confirm dietary restrictions").

✅ **Intelligent Mentoring**: The AI functions as a digital mentor, helping even junior agents deliver expert-level consultations from day one — eliminating missed questions and overlooked details.

✅ **Human-AI Collaboration**: The system balances human strengths — empathy and relationship building — with AI capabilities in data processing and coverage. Staff stay focused on meaningful conversations while the AI handles the rest.

✅ **Smart Activity Search**: The Summarizer API converts natural dialogue into structured data for our backend API. Gemini 2.5 Flash, enhanced with Google Search Grounding, finds personalized travel activities complete with images and references from platforms like Klook, Trip.com, and Expedia.

### Inspiration

The inspiration came from a long-standing challenge in retail and customer service — balancing AI innovation with privacy protection. Many companies wanted to leverage customer interactions for insight, yet real-world conversations often contain personal information that cannot safely be sent to the cloud.

When **Chrome Built-in AI** was announced, we saw a turning point. For the first time, we could process conversations *on-device*, keeping sensitive data secure while enabling real-time understanding. That sparked our idea: to build a solution that empowers front-line sales reps through human-AI collaboration — using Chrome's built-in intelligence to make every customer interaction smarter, faster, and more personal.

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

## 🧪 Testing Instructions

We provide two testing patterns depending on your use case:

---

### Pattern 1: Quick Demo (Using Live Demo Site)

**Prerequisites:**
* Update Chrome to latest version (see "Chrome Setup" section below)

**Testing Steps:**

1. **Download AI Models (First-Time Only)**
   * Open https://chrome-built-in-ai-challenge-2025.vercel.app/
   * If a modal appears, click "Download AI Model" and wait for models to download (this may take some time)
   * Modal closes automatically when ready

2. **Start Voice Recognition**
   * Click the microphone button (turns red when active)

3. **Play Demo Audio**
   * Download `demo-dialog.wav` from the repository
   * Play the audio file near your microphone
   * **Expected Result**: Transcript appears in real-time as the audio plays

4. **Verify Summarizer API**
   * After the audio finishes, check the "AI Summary" section
   * **Expected Result**: A structured summary with extracted travel requirements appears

5. **Verify Prompt API (AI Assistant)**
   * Check the AI Assistant (with avatar) section during/after playback
   * **Expected Result**: AI suggestions appear based on the conversation content

6. **Add Staff Notes (Optional)**
   * Manually input any missing information in the "Staff Notes" field
   * Example: "Customer prefers morning activities"

7. **Search Activities**
   * Click the "Search Activities" button
   * **Expected Result**: Relevant activity recommendations appear with images and references

---

### Pattern 2: Local Development with Mock Data

**Prerequisites:**
* Update Chrome to latest version (see "Chrome Setup" section below)
* Node.js 18+
* Docker (optional, for containerized backend)

**Backend Setup (Docker):**

1. `git clone https://github.com/plaidev/chrome-built-in-ai-challenge-2025.git`
2. `cd chrome-built-in-ai-challenge-2025/backend`
3. `docker-compose up`
4. Server starts on `http://localhost:8080`

**Backend Setup (Without Docker):**

1. `git clone https://github.com/plaidev/chrome-built-in-ai-challenge-2025.git`
2. `cd chrome-built-in-ai-challenge-2025/backend`
3. `npm install`
4. `MOCK_MODE=true npm run start`
5. Server starts on `http://localhost:8080`

**Frontend Setup:**

1. `cd frontend`
2. `python -m http.server 8000`
3. Navigate to `http://localhost:8000`

**Testing Steps:**

Follow the same steps as Pattern 1 (steps 1-7), but with local URLs:
* Frontend: `http://localhost:8000`
* Backend: `http://localhost:8080`

---

### Chrome Setup (Recommended but Not Necessary)

1. **Update Chrome to Latest Version**
   * We recommend updating Chrome to the latest version
   * Check your version: `chrome://settings/help`

2. **Enable Built-in AI Flags:**
   * `chrome://flags/#prompt-api-for-gemini-nano` → **Enabled**
   * `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` → **Enabled**
   * `chrome://flags/#summarization-api-for-gemini-nano` → **Enabled**

3. **Restart Chrome**

4. **Verify Model Availability** (Open DevTools Console):
   * `await LanguageModel.availability();` // Should return `"available"`, `"downloadable"`, or `"downloading"`
   * `await ai.summarizer.availability();` // Should return `"available"`, `"downloadable"`, or `"downloading"`

## 🤖 Chrome Built-in AI APIs Used

### 1. Prompt API (Primary)

**What it does:**
- Real-time analysis of conversation transcripts
- Intelligent extraction of travel requirements (12-item structured format)
- Context-aware suggestions for missing information
- Natural language understanding for customer intent

**Implementation** (`frontend/js/ai/ai-assistant.js`):

```javascript
// Initialize AI session with system prompt
this.session = await LanguageModel.create({
  initialPrompts: [
    {
      role: 'system',
      content: this.getSystemPrompt()
    }
  ]
});

// Analyze conversation with streaming
const stream = await this.session.promptStreaming(prompt);
for await (const chunk of stream) {
  accumulated += chunk;
}
```

**Technical Details:**
- Custom system prompts for travel domain expertise
- Streaming API for real-time response display
- Context-aware analysis of customer conversations

### 2. Summarizer API

**What it does:**
- Automatic summarization of customer conversations
- Structured output generation for activity search
- Key information extraction from unstructured dialogue

**Implementation** (`frontend/js/ai/summarizer.js`):

```javascript
// Configure summarizer options
let options = {
  sharedContext: 'Travel agency consultation conversation',
  type: 'tldr',
  format: 'plain-text',
  length: 'long'
};

// Create summarizer
const summarizer = await Summarizer.create(options);

// Generate structured summary
const summary = await summarizer.summarize(textToSummarize);
```

**Technical Details:**
- Custom format for 12-item travel requirements
- TLDR-style extraction from natural dialogue
- Plain-text formatting with structured prompts
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

## 🛠️ Troubleshooting

### Issue: "AI not available"
**Solution:**
1. Update Chrome to the latest version
2. Enable flags in `chrome://flags`
3. Restart Chrome
4. Run in DevTools: `await LanguageModel.availability()` // Should return `"available"`, `"downloadable"`, or `"downloading"`


### Issue: "Backend connection failed"
**Solution:**
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check `.env` file exists with correct values
3. Review backend logs for errors
4. Try Mock Mode (remove `.env` file)

## 👥 Team

**PLAID　Inc. - Data Mind**

## 📄 License

MIT License - see LICENSE file for details
