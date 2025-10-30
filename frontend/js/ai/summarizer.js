/**
 * Summarizer
 * Handles conversation summarization using Chrome's Summarizer API
 */
import { MIN_TEXT_LENGTH, SUMMARY_DELAY } from '../config.js';

// Global state
let summarizer = null;
let summarizerOptions = null;
let lastSummaryTime = 0;
let lastSummaryText = '';
let summaryTimer = null;

/**
 * Initialize Summarizer API
 */
export async function initializeSummarizer() {
  try {
    // Check availability
    const availability = await Summarizer.availability();
    console.log('Summarizer availability:', availability);

    // Configure summarizer options
    let options = {
      sharedContext: 'Travel agency consultation conversation',
      type: 'tldr',
      format: 'plain-text',
      length: 'long'
    };

    // Store options for later use
    summarizerOptions = options;

    const statusElement = document.getElementById('aiStatus');

    switch (availability) {
      case 'unavailable':
        if (statusElement) {
          statusElement.className = 'ai-status unavailable';
          statusElement.innerHTML = '❌ Summarizer is not available (device not supported)';
          statusElement.style.display = 'block';
        }
        break;

      case 'downloadable':
        if (statusElement) {
          statusElement.className = 'ai-status downloadable';
          statusElement.innerHTML = '⚠️ AI model download required';
          statusElement.style.display = 'block';
        }
        break;

      case 'downloading':
        if (statusElement) {
          statusElement.className = 'ai-status downloading';
          statusElement.innerHTML = '⏳ Downloading model...';
          statusElement.style.display = 'block';
        }
        checkDownloadStatus();
        break;

      case 'available':
        if (statusElement) {
          statusElement.style.display = 'none';
        }

        // Model already available, create instance
        try {
          summarizer = await Summarizer.create(options);
          console.log('Summarizer created (model already available)');
        } catch (error) {
          console.log('Will create summarizer on user activation');
        }
        break;

      default:
        console.warn('Unknown availability status:', availability);
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Summarizer:', error);
    const statusElement = document.getElementById('aiStatus');
    if (statusElement) {
      statusElement.className = 'ai-status unavailable';
      statusElement.innerHTML = '❌ Failed to initialize Summarizer';
      statusElement.style.display = 'block';
    }
    return false;
  }
}

/**
 * Check download status periodically
 */
async function checkDownloadStatus() {
  const statusElement = document.getElementById('aiStatus');

  const checkInterval = setInterval(async () => {
    try {
      const availability = await Summarizer.availability();
      console.log('Checking download status:', availability);

      if (availability === 'available') {
        clearInterval(checkInterval);

        if (statusElement) {
          statusElement.style.display = 'none';
        }

        // Create instance
        try {
          summarizer = await Summarizer.create(summarizerOptions);
          console.log('Summarizer created after download complete');
        } catch (error) {
          console.log('Will create summarizer on user activation');
        }
      } else if (availability === 'unavailable') {
        clearInterval(checkInterval);
        if (statusElement) {
          statusElement.className = 'ai-status unavailable';
          statusElement.innerHTML = '❌ Download failed';
        }
      }
    } catch (error) {
      console.error('Error checking download status:', error);
      clearInterval(checkInterval);
    }
  }, 2000); // Check every 2 seconds
}

/**
 * Generate summary from transcript
 */
export async function generateSummary(transcript) {
  if (!transcript || transcript.trim().length < MIN_TEXT_LENGTH) {
    console.log('Not enough text to summarize');
    return;
  }

  // Check if text has changed since last summary
  if (transcript === lastSummaryText) {
    console.log('Skipping summary - text has not changed');
    return;
  }

  const now = Date.now();
  if (now - lastSummaryTime < SUMMARY_DELAY) {
    console.log('Skipping summary - too soon');
    return;
  }

  lastSummaryTime = now;
  lastSummaryText = transcript;

  console.log('=== Using Summarizer API for summary ===');

  // Use Summarizer API only
  if (summarizer) {
    return await generateSummarizerApiSummary(transcript);
  } else {
    console.log('⚠️ Summarizer API is not available');
    const summaryElement = document.getElementById('summary');
    summaryElement.innerHTML = '';
    return null;
  }
}

/**
 * Generate summary using Summarizer API
 */
async function generateSummarizerApiSummary(transcript) {
  console.log('>>> Generating summary with Summarizer API...');

  try {
    const summaryElement = document.getElementById('summary');
    summaryElement.innerHTML = 'AI is summarizing...';

    // Prepare text with structured format for activity search
    const textToSummarize = `Conversation content: ${transcript}

Important: Please output in a format that includes all 12 items below. Each item should start with "- " and be separated by ":".

[Activity Search Requirements]
- Destination: (City, region, country)
- Travel Dates / Duration: (When? How many days?)
- Number of Travelers: (How many people?)
- Traveler Profile: (Age groups: Adults/Seniors/Kids, Special needs: Accessibility/Child-friendly)
- Activity Type / Interests: (Specify actual interests mentioned - e.g., Disneyland, museums, food tours, hiking, diving, theme parks, etc. Also categorize: Culture & History/Adventure & Sports/Food & Dining/Entertainment/Relaxation/Nature & Wildlife)
- Budget per Person: (How much per activity or per day?)
- Time Preference: (Morning/Afternoon/Evening, Full-day/Half-day/Multi-day)
- Physical Activity Level: (Easy/Moderate/Challenging)
- Group Type: (Solo/Couple/Family/Friends, optional)
- Language Preference: (English guide/Japanese guide/Self-guided, optional)
- Transportation: (Pick-up service/Meet at location/Own transportation, optional)
- Special Requirements: (Dietary restrictions/Allergies/Accessibility/Other, optional)

Notes:
1. All 12 items must be included
2. Items 1-8 are essential; Items 9-12 are optional but helpful
3. Items not mentioned in the conversation should be marked as "TBD" or "Not specified"
4. Do not include personal names or personally identifiable information
5. Each item should be concise and on one line
6. Do not add unnecessary explanatory text`;

    try {
      // Check if streaming is available
      if (summarizer.summarizeStreaming) {
        // Use streaming API
        const stream = await summarizer.summarizeStreaming(textToSummarize, {
          sharedContext: 'Travel agency consultation conversation'
        });

        let summary = '';
        let isFirstChunk = true;

        for await (const chunk of stream) {
          // Clear processing message on first chunk
          if (isFirstChunk) {
            summaryElement.innerHTML = '';
            isFirstChunk = false;
          }

          // Accumulate all chunks
          summary += chunk;

          // Display the accumulated summary
          summaryElement.innerHTML = summary.replace(/\n/g, '<br>');
        }

        return summary;
      } else {
        // Fallback to non-streaming API
        let summary = await summarizer.summarize(textToSummarize);

        // Display the summary as-is
        if (summary) {
          summaryElement.innerHTML = summary.replace(/\n/g, '<br>');
          return summary;
        } else {
          summaryElement.innerHTML = '';
          return null;
        }
      }
    } catch (error) {
      console.error('Failed to generate Summarizer API summary:', error);
      summaryElement.innerHTML = '';
      return null;
    }
  } catch (error) {
    console.error('Error in generateSummarizerApiSummary:', error);
    return null;
  }
}

/**
 * Start auto-summary timer
 */
export function startSummaryTimer(callback) {
  stopSummaryTimer();
  summaryTimer = setInterval(callback, SUMMARY_DELAY);
}

/**
 * Stop auto-summary timer
 */
export function stopSummaryTimer() {
  if (summaryTimer) {
    clearInterval(summaryTimer);
    summaryTimer = null;
  }
}

/**
 * Reset summary state
 */
export function resetSummary() {
  lastSummaryTime = 0;
  lastSummaryText = '';
}
