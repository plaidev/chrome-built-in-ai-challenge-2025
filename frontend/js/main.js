/**
 * Main Application Entry Point
 * Activity Search Assistant - Chrome Built-in AI Challenge
 */

import { API_BASE_URL, MIN_TEXT_LENGTH } from './config.js';
import { AIAssistant } from './ai/ai-assistant.js';
import { initializeSummarizer, generateSummary, startSummaryTimer, stopSummaryTimer, resetSummary } from './ai/summarizer.js';
import {
  initializeSpeechRecognition,
  startRecognition,
  stopRecognition,
  resetTranscript,
  getTranscript,
  setTranscript
} from './speech/recognition.js';
import { AudioTranscriber } from './speech/audio-transcriber.js';
import { displayActivities, showLoadingState, hideLoadingState, showError } from './ui/display.js';

// Global instances
let aiAssistant = null;
let audioTranscriber = null;
let usePromptAPITranscription = false; // Toggle between Web Speech API and Prompt API

/**
 * Initialize the application
 */
async function initializeApp() {
  console.log('🚀 Initializing Tour Search Application...');

  // Set placeholders for English
  initializePlaceholders();

  // Check AI models availability and show download modal if needed
  await checkAIModelsAvailability();

  // Initialize Summarizer API
  await initializeSummarizer();

  // Initialize Speech Recognition
  const speechCallbacks = {
    onStart: () => {
      startSummaryTimer(async () => {
        const transcript = getTranscript();
        await generateSummary(transcript);
      });
    },
    onEnd: async () => {
      stopSummaryTimer();

      // Analyze conversation with Travel Assistant when speech recognition ends
      const transcript = getTranscript();
      if (aiAssistant && transcript && transcript.length > 50) {
        await aiAssistant.analyzeConversation(transcript);
      }
    },
    onResult: (final, interim) => {
      // Summary is handled by timer
    }
  };

  initializeSpeechRecognition(speechCallbacks);

  // Initialize AI Assistant
  aiAssistant = new AIAssistant();
  await aiAssistant.initialize();

  // Initialize Audio Transcriber (Prompt API)
  audioTranscriber = new AudioTranscriber();
  const transcriberReady = await audioTranscriber.initialize();
  if (transcriberReady) {
    console.log('✅ Prompt API Audio Transcription available - enabled by default');
    usePromptAPITranscription = true;
  } else {
    console.log('ℹ️ Using Web Speech API only for transcription');
  }

  // Initialize editable text areas
  initializeTextInput();
  initializeEditableSummaries();
  initializeStaffMemo();
  initializeTranscriptContainer();

  // Setup event listeners
  setupEventListeners();

  console.log('✅ Application initialized successfully');
}

/**
 * Check AI models availability and show download modal if needed
 */
async function checkAIModelsAvailability() {
  const modal = document.getElementById('aiSetupModal');
  const statusDiv = document.getElementById('modalStatus');
  const downloadButton = document.getElementById('modalDownloadButton');

  if (!modal || !statusDiv || !downloadButton) return;

  let summarizerAvailability = 'unavailable';
  let languageModelAvailability = 'unavailable';

  // Check Summarizer availability
  try {
    if (window.Summarizer) {
      summarizerAvailability = await Summarizer.availability();
      console.log('Summarizer availability:', summarizerAvailability);
    }
  } catch (error) {
    console.error('Failed to check Summarizer availability:', error);
  }

  // Check LanguageModel (Prompt API) availability
  try {
    if (window.LanguageModel) {
      languageModelAvailability = await LanguageModel.availability();
      console.log('LanguageModel availability:', languageModelAvailability);
    }
  } catch (error) {
    console.error('Failed to check LanguageModel availability:', error);
  }

  // Determine if we need to show the download modal
  const needsDownload = summarizerAvailability === 'downloadable' || languageModelAvailability === 'downloadable';
  const isDownloading = summarizerAvailability === 'downloading' || languageModelAvailability === 'downloading';

  if (needsDownload || isDownloading) {
    // Show modal
    modal.style.display = 'flex';

    if (isDownloading) {
      statusDiv.innerHTML = '<span class="loading-spinner"></span> Downloading AI models...';
      downloadButton.style.display = 'none';
    } else if (needsDownload) {
      statusDiv.innerHTML = '⚠️ AI models need to be downloaded for full functionality';
      downloadButton.style.display = 'block';

      // Add download button click handler
      downloadButton.onclick = async () => {
        // Disable button and change text with spinner
        downloadButton.disabled = true;
        downloadButton.innerHTML = '<span class="loading-spinner"></span> Downloading AI models...';

        try {
          let summarizerProgress = 0;
          let languageModelProgress = 0;

          const updateProgress = () => {
            // Use Summarizer progress as the main indicator
            const displayProgress = summarizerProgress;

            statusDiv.innerHTML = `
              <div style="margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.875rem; color: var(--text-primary);">Downloading AI models...</span>
                  <span style="font-size: 0.875rem; font-weight: 600; color: #4a90e2;">${displayProgress.toFixed(0)}%</span>
                </div>
                <div class="download-progress">
                  <div class="download-progress-bar" style="width: ${displayProgress}%"></div>
                </div>
              </div>
            `;
          };

          // Initial progress update
          updateProgress();

          // Download models sequentially (parallel may fail due to user gesture requirement)

          // Try to create Summarizer (triggers download)
          if (summarizerAvailability === 'downloadable' && window.Summarizer) {
            console.log('🔴 [main.js] Starting Summarizer.create() for download...');
            await window.Summarizer.create({
              sharedContext: 'Travel agency consultation conversation',
              type: 'tldr',
              format: 'plain-text',
              length: 'long',
              monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                  summarizerProgress = e.loaded * 100;
                  console.log(`🔴 [main.js] Summarizer downloaded: ${summarizerProgress.toFixed(0)}%`);
                  updateProgress();
                });
              }
            });
            console.log('🔴 [main.js] Summarizer.create() completed - download finished');
            summarizerProgress = 100;
            updateProgress();
          }

          // Try to create LanguageModel session (triggers download)
          if (languageModelAvailability === 'downloadable' && window.LanguageModel) {
            console.log('🔵 [main.js] Starting LanguageModel.create() for download...');
            await window.LanguageModel.create({
              monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                  languageModelProgress = e.loaded * 100;
                  console.log(`🔵 [main.js] LanguageModel downloaded: ${languageModelProgress.toFixed(0)}%`);
                  updateProgress();
                });
              }
            });
            console.log('🔵 [main.js] LanguageModel.create() completed - download finished');
            languageModelProgress = 100;
            updateProgress();
          }

          // Poll for completion
          const checkInterval = setInterval(async () => {
            let summarizerStatus = 'unavailable';
            let languageModelStatus = 'unavailable';

            if (window.Summarizer) {
              summarizerStatus = await window.Summarizer.availability();
            }
            if (window.LanguageModel) {
              languageModelStatus = await window.LanguageModel.availability();
            }

            const summarizerReady = summarizerAvailability === 'downloadable' ? summarizerStatus === 'available' : true;
            const languageModelReady = languageModelAvailability === 'downloadable' ? languageModelStatus === 'available' : true;

            if (summarizerReady && languageModelReady) {
              clearInterval(checkInterval);
              statusDiv.innerHTML = '✅ AI models downloaded successfully!';
              downloadButton.textContent = 'Download Complete';
              setTimeout(() => {
                modal.style.display = 'none';
                location.reload(); // Reload to reinitialize with new models
              }, 2000);
            }
          }, 2000);

        } catch (error) {
          console.error('Download failed:', error);
          statusDiv.innerHTML = '❌ Download failed. Please try again.';
          downloadButton.disabled = false;
          downloadButton.textContent = 'Download AI Model';
        }
      };
    }
  }
}

/**
 * Set placeholder styles
 */
function initializePlaceholders() {
  const style = document.createElement('style');
  style.id = 'language-styles';
  style.textContent = `
    #transcript_container.show-placeholder::before {
      content: 'You can paste or type conversation here...';
    }
    .summary-box:empty::before {
      content: 'Summary will be automatically generated from conversation';
    }
    .memo-box:empty::before {
      content: 'Add your notes here...\\ARecommended activities, customer preferences, accessibility needs, etc.';
      white-space: pre-line;
    }
  `;
  document.head.appendChild(style);

  const infoStart = document.getElementById('info_start');
  if (infoStart) infoStart.style.display = 'inline';
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Start/Stop button
  const startButton = document.getElementById('start_button');
  if (startButton) {
    startButton.addEventListener('click', async (event) => {
      event.preventDefault();

      // Use Prompt API transcription if available and enabled
      if (usePromptAPITranscription && audioTranscriber) {
        await handlePromptAPIRecording();
      } else {
        startRecognition();
      }
    });
  }

  // Reset button
  const resetButton = document.getElementById('reset_button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      handleReset();
    });
  }

  // Search tours button
  const searchButton = document.getElementById('searchToursButton');
  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const summaryElement = document.getElementById('summary');
      const staffMemoElement = document.getElementById('staffMemo');

      // Disable button and show loading state
      searchButton.disabled = true;
      searchButton.textContent = 'Searching...';
      searchButton.classList.add('loading');

      let summary = summaryElement ? summaryElement.innerText.trim() : '';
      const staffMemo = staffMemoElement ? staffMemoElement.innerText.trim() : '';

      // If no summary, try to generate from transcript
      if (!summary) {
        const transcript = getTranscript();
        if (transcript && transcript.trim().length > 50) {
          showLoadingState('Generating summary...');
          summary = await generateSummary(transcript);
          hideLoadingState();

          if (!summary) {
            showError('Failed to generate summary. Please try again.');
            searchButton.disabled = false;
            searchButton.textContent = 'Search Activities';
            searchButton.classList.remove('loading');
            return;
          }
        } else {
          showError('Please provide a conversation summary or transcript first.');
          searchButton.disabled = false;
          searchButton.textContent = 'Search Activities';
          searchButton.classList.remove('loading');
          return;
        }
      }

      // Combine summary with staff notes
      let summaryWithMemo = summary;
      if (staffMemo) {
        summaryWithMemo += `\n\nStaff Notes:\n${staffMemo}`;
      }

      // Use summary and staff notes directly as query
      const searchQuery = summaryWithMemo;

      showLoadingState('Searching activities...');

      // Scroll to tour recommendations section
      const tourSection = document.getElementById('tourRecommendations');
      if (tourSection) {
        tourSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      try {
        // Call activity search API
        const response = await fetch(`${API_BASE_URL}/api/activity-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: searchQuery
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        hideLoadingState();

        if (data.success && data.results) {
          displayActivities(data.results);
        } else {
          showError(data.error || 'Failed to search activities');
        }

        // Re-enable button
        searchButton.disabled = false;
        searchButton.textContent = 'Search Activities';
        searchButton.classList.remove('loading');
      } catch (error) {
        console.error('Activity search error:', error);
        hideLoadingState();
        showError('Unable to complete the search. Please try again.');

        // Re-enable button
        searchButton.disabled = false;
        searchButton.textContent = 'Search Activities';
        searchButton.classList.remove('loading');
      }
    });
  }
}

/**
 * Handle Prompt API recording
 */
async function handlePromptAPIRecording() {
  if (!audioTranscriber.isRecording) {
    // Start recording
    const started = await audioTranscriber.startRecording((transcript) => {
      const finalSpan = document.getElementById('final_span');
      const interimSpan = document.getElementById('interim_span');

      if (finalSpan) {
        finalSpan.textContent = transcript.confirmed;
      }
      if (interimSpan) {
        interimSpan.textContent = transcript.pending;
      }

      // Update transcript for other components
      setTranscript(transcript.fullText);
    });

    if (started) {
      const startButton = document.getElementById('start_button');
      if (startButton) {
        startButton.classList.add('recording');
      }

      startSummaryTimer(async () => {
        const transcript = audioTranscriber.getFullTranscript();
        if (transcript) {
          await generateSummary(transcript);
        }
      });
    }
  } else {
    // Stop recording
    audioTranscriber.stopRecording();

    const startButton = document.getElementById('start_button');
    if (startButton) {
      startButton.classList.remove('recording');
    }

    stopSummaryTimer();

    // Analyze conversation with Travel Assistant
    const transcript = audioTranscriber.getFullTranscript();
    if (aiAssistant && transcript && transcript.length > 50) {
      await aiAssistant.analyzeConversation(transcript);
    }
  }
}

/**
 * Handle reset button
 */
function handleReset() {
  // Reset transcript
  resetTranscript();

  // Reset audio transcriber if using Prompt API
  if (audioTranscriber) {
    audioTranscriber.reset();
  }

  // Clear summary
  const summaryElement = document.getElementById('summary');
  if (summaryElement) summaryElement.innerHTML = '';

  // Clear staff notes
  const memoElement = document.getElementById('staffMemo');
  if (memoElement) memoElement.innerHTML = '';

  // Hide tour recommendations
  const tourSection = document.getElementById('tourRecommendations');
  if (tourSection) tourSection.style.display = 'none';

  // Reset summary state
  resetSummary();

  // Stop summary timer
  stopSummaryTimer();

  // Reset Travel Assistant suggestion
  const suggestionText = document.getElementById('suggestionText');
  if (suggestionText) {
    suggestionText.innerHTML = 'Let\'s gather information about the following:<br>1. Destination<br>2. Travel Dates / Duration<br>3. Number of Travelers<br>4. Traveler Profile (age, special needs)<br>5. Activity Type / Interests<br>6. Budget per Person<br>7. Time Preference<br>8. Physical Activity Level<br>9. Group Type (optional)<br>10. Language Preference (optional)<br>11. Transportation (optional)<br>12. Special Requirements (optional)';
  }

  // Show info message
  const infoStart = document.getElementById('info_start');
  if (infoStart) infoStart.style.display = 'inline';
}


/**
 * Initialize text input with debouncing
 */
function initializeTextInput() {
  const finalSpan = document.getElementById('final_span');
  if (!finalSpan) return;

  let debounceTimer = null;
  const DEBOUNCE_DELAY = 2000;

  finalSpan.addEventListener('input', function() {
    const text = this.innerText.trim();

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(async () => {
      if (text && text.length > 50) {
        await generateSummary(text);

        // Analyze conversation with Travel Assistant
        if (aiAssistant) {
          await aiAssistant.analyzeConversation(text);
        }
      }
    }, DEBOUNCE_DELAY);
  });

  // Handle paste
  finalSpan.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text);
  });
}

/**
 * Update search button state based on summary length
 */
function updateSearchButtonState() {
  const summaryElement = document.getElementById('summary');
  const searchButton = document.getElementById('searchToursButton');

  if (!summaryElement || !searchButton) return;

  const summaryText = summaryElement.innerText.trim();
  const hasEnoughText = summaryText.length >= MIN_TEXT_LENGTH;

  searchButton.disabled = !hasEnoughText;

  if (!hasEnoughText) {
    searchButton.title = `Summary must be at least ${MIN_TEXT_LENGTH} characters (current: ${summaryText.length})`;
  } else {
    searchButton.title = '';
  }
}

/**
 * Initialize editable summaries
 */
function initializeEditableSummaries() {
  const summaryBox = document.getElementById('summary');
  if (!summaryBox) return;

  // Prevent HTML paste
  summaryBox.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text);

    // Update button state after paste
    setTimeout(updateSearchButtonState, 0);
  });

  // Update button state on input
  summaryBox.addEventListener('input', updateSearchButtonState);

  // Watch for programmatic changes to summary (from AI generation)
  const observer = new MutationObserver(() => {
    updateSearchButtonState();
  });

  observer.observe(summaryBox, {
    childList: true,
    characterData: true,
    subtree: true
  });

  // Initial button state
  updateSearchButtonState();
}

/**
 * Initialize staff notes
 */
function initializeStaffMemo() {
  const memoBox = document.getElementById('staffMemo');
  if (!memoBox) return;

  // Prevent HTML paste
  memoBox.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text);
  });
}

/**
 * Initialize transcript container click handling
 */
function initializeTranscriptContainer() {
  const transcriptContainer = document.getElementById('transcript_container');
  const finalSpan = document.getElementById('final_span');
  const interimSpan = document.getElementById('interim_span');

  if (!transcriptContainer || !finalSpan || !interimSpan) return;

  // Function to update placeholder visibility
  function updatePlaceholder() {
    const hasFinalText = finalSpan.textContent.trim().length > 0;
    const hasInterimText = interimSpan.textContent.trim().length > 0;

    if (hasFinalText || hasInterimText) {
      transcriptContainer.classList.remove('show-placeholder');
    } else {
      transcriptContainer.classList.add('show-placeholder');
    }
  }

  // Initial placeholder state
  updatePlaceholder();

  // Watch for changes in final_span
  const finalObserver = new MutationObserver(updatePlaceholder);
  finalObserver.observe(finalSpan, {
    childList: true,
    characterData: true,
    subtree: true
  });

  // Watch for changes in interim_span
  const interimObserver = new MutationObserver(updatePlaceholder);
  interimObserver.observe(interimSpan, {
    childList: true,
    characterData: true,
    subtree: true
  });

  // When clicking on the container, focus the final_span
  transcriptContainer.addEventListener('click', function(e) {
    // Only focus if the click target is the container itself, not the spans
    if (e.target === transcriptContainer) {
      finalSpan.focus();
    }
  });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
