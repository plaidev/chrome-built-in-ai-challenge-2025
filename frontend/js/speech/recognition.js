/**
 * Speech Recognition
 * Handles voice input using Web Speech API
 */

// Global state
let recognition = null;
let recognizing = false;
let ignore_onend = false;
let start_timestamp = 0;
let final_transcript = '';

/**
 * Initialize speech recognition
 */
export function initializeSpeechRecognition(callbacks) {
  if (!('webkitSpeechRecognition' in window)) {
    showUpgradeMessage();
    return false;
  }

  const start_button = document.getElementById('start_button');
  if (start_button) {
    start_button.style.display = 'inline-block';
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.processLocally = true;
  recognition.lang = 'en-US';

  // Log on-device status for verification
  console.log('🎤 Speech Recognition Settings:');
  console.log('  - processLocally:', recognition.processLocally);
  console.log('  - continuous:', recognition.continuous);
  console.log('  - interimResults:', recognition.interimResults);

  recognition.onstart = function() {
    recognizing = true;
    console.log('✅ Speech recognition started');
    console.log('  - On-device mode:', recognition.processLocally ? 'ENABLED ✓' : 'DISABLED ✗');
    showInfo('info_speak_now');

    const start_button = document.getElementById('start_button');
    if (start_button) {
      start_button.classList.add('recording');
      start_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="8" y="8" width="8" height="8" rx="1.5" ry="1.5"/></svg>';
    }

    if (callbacks && callbacks.onStart) {
      callbacks.onStart();
    }
  };

  recognition.onerror = function(event) {
    const start_button = document.getElementById('start_button');
    if (start_button) {
      start_button.classList.remove('recording');
      start_button.innerHTML = '<svg id="start_img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
    }

    if (event.error == 'no-speech') {
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    const start_button = document.getElementById('start_button');
    if (start_button) {
      start_button.classList.remove('recording');
      start_button.innerHTML = '<svg id="start_img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
    }

    if (callbacks && callbacks.onEnd) {
      callbacks.onEnd();
    }

    if (ignore_onend) {
      return;
    }
    showInfo('info_start');
  };

  recognition.onresult = function(event) {
    let interim_transcript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    final_transcript = capitalize(final_transcript);

    const final_span = document.getElementById('final_span');
    const interim_span = document.getElementById('interim_span');

    if (final_span) final_span.innerHTML = linebreak(final_transcript);
    if (interim_span) interim_span.innerHTML = linebreak(interim_transcript);

    if (callbacks && callbacks.onResult) {
      callbacks.onResult(final_transcript, interim_transcript);
    }
  };

  return true;
}

/**
 * Start speech recognition
 */
export function startRecognition() {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.start();
  ignore_onend = false;

  const final_span = document.getElementById('final_span');
  const interim_span = document.getElementById('interim_span');
  if (final_span) final_span.innerHTML = '';
  if (interim_span) interim_span.innerHTML = '';

  start_timestamp = event.timeStamp;
}

/**
 * Stop speech recognition
 */
export function stopRecognition() {
  if (recognition && recognizing) {
    recognition.stop();
  }
}

/**
 * Reset transcript
 */
export function resetTranscript() {
  final_transcript = '';
  const final_span = document.getElementById('final_span');
  const interim_span = document.getElementById('interim_span');
  if (final_span) final_span.innerHTML = '';
  if (interim_span) interim_span.innerHTML = '';
}

/**
 * Get current transcript
 */
export function getTranscript() {
  return final_transcript;
}

/**
 * Set transcript programmatically
 */
export function setTranscript(text) {
  final_transcript = text;
  const final_span = document.getElementById('final_span');
  if (final_span) {
    final_span.innerHTML = linebreak(text);
  }
}

/**
 * Utility functions
 */
function showInfo(id) {
  const infos = ['info_start', 'info_speak_now', 'info_no_speech', 'info_no_microphone', 'info_allow', 'info_denied', 'info_blocked', 'info_upgrade'];
  for (const infoId of infos) {
    const el = document.getElementById(infoId);
    if (el) {
      el.style.display = infoId === id ? 'inline' : 'none';
    }
  }
}

function linebreak(s) {
  return s.replace(/\n/g, '<br>');
}

function capitalize(s) {
  return s.replace(/\S/, (m) => m.toUpperCase());
}

function showUpgradeMessage() {
  showInfo('info_upgrade');
}
