/**
 * Audio Transcriber
 * Uses Chrome Prompt API for real-time audio transcription with Web Speech API fallback
 */

// WAV encoding function
function encodeWAV(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export class AudioTranscriber {
  constructor() {
    this.session = null;
    this.transcriptionCount = 0;
    this.audioContext = null;
    this.workletNode = null;
    this.stream = null;
    this.isRecording = false;
    this.fullTranscript = '';
    this.webSpeechRecognition = null;
    this.confirmedTranscript = '';
    this.pendingWebSpeech = '';
  }

  async initialize() {
    try {
      if (!window.LanguageModel) {
        console.log('LanguageModel API not available for audio transcription');
        return false;
      }

      const availability = await LanguageModel.availability();
      console.log('AudioTranscriber LanguageModel availability:', availability);

      if (availability !== 'available') {
        console.log('LanguageModel not available for transcription:', availability);
        return false;
      }

      this.session = await LanguageModel.create({
        expectedInputs: [{ type: 'audio' }, { type: 'text' }],
        initialPrompts: [{
          role: 'system',
          content: 'Please transcribe the audio accurately. Include all fillers like "um", "uh", "well", etc. and add appropriate punctuation. Use periods (.) and commas (,) for punctuation, not Japanese punctuation marks.'
        }]
      });

      console.log('✅ Audio Transcriber Prompt API Session initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio transcriber:', error);
      return false;
    }
  }

  async transcribeAudio(audioBlob) {
    try {
      if (!this.session) {
        console.error('Transcription session not initialized');
        return '';
      }

      console.log(`📝 Transcribing WAV chunk ${++this.transcriptionCount}...`);
      console.log(`  Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`);

      const arrayBuffer = await audioBlob.arrayBuffer();

      const response = await this.session.prompt([{
        role: 'user',
        content: [
          { type: 'text', value: 'Please transcribe the following audio including all fillers:' },
          { type: 'audio', value: arrayBuffer }
        ]
      }]);

      console.log('✅ Transcribed:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to transcribe:', err);
      return '';
    }
  }

  async startRecording(onTranscript) {
    try {
      if (this.isRecording) {
        console.log('Already recording');
        return false;
      }

      if (!this.session) {
        const initialized = await this.initialize();
        if (!initialized) {
          console.warn('Prompt API not available for transcription, using Web Speech API only');
          return false;
        }
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Initialize Web Speech API for immediate feedback
      if ('webkitSpeechRecognition' in window) {
        this.webSpeechRecognition = new webkitSpeechRecognition();
        this.webSpeechRecognition.continuous = true;
        this.webSpeechRecognition.interimResults = true;
        this.webSpeechRecognition.lang = 'en-US';

        this.webSpeechRecognition.onresult = (event) => {
          let webSpeechText = '';

          for (let i = 0; i < event.results.length; i++) {
            webSpeechText += event.results[i][0].transcript;
          }

          this.pendingWebSpeech = webSpeechText;

          if (onTranscript) {
            onTranscript({
              confirmed: this.confirmedTranscript,
              pending: this.pendingWebSpeech,
              fullText: this.confirmedTranscript
            });
          }
        };

        this.webSpeechRecognition.onerror = (event) => {
          console.log('Web Speech API error:', event.error);
        };

        this.webSpeechRecognition.start();
        console.log('Web Speech API started for immediate feedback');
      }

      // Create AudioContext
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.stream);

      // Load AudioWorklet
      await this.audioContext.audioWorklet.addModule('js/speech/pcm-processor.js');
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');

      source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);

      // Handle PCM data from worklet
      this.workletNode.port.onmessage = async (event) => {
        const float32Array = event.data;

        const wavBlob = encodeWAV(float32Array, this.audioContext.sampleRate);

        const result = await this.transcribeAudio(wavBlob);
        if (result) {
          if (this.confirmedTranscript && !this.confirmedTranscript.endsWith(' ')) {
            this.confirmedTranscript += ' ';
          }
          this.confirmedTranscript += result;
          this.fullTranscript = this.confirmedTranscript;

          // Reset Web Speech API when Prompt API result is received
          if (this.webSpeechRecognition) {
            this.pendingWebSpeech = '';
            this.webSpeechRecognition.stop();

            this.webSpeechRecognition.onend = () => {
              if (this.isRecording && this.webSpeechRecognition) {
                try {
                  this.webSpeechRecognition.lang = 'en-US';
                  this.webSpeechRecognition.start();
                  console.log('Web Speech API restarted after Prompt API result');
                } catch (error) {
                  console.log('Web Speech API restart error:', error);
                }
              }
            };
          }

          if (onTranscript) {
            onTranscript({
              confirmed: this.confirmedTranscript,
              pending: this.pendingWebSpeech,
              fullText: this.confirmedTranscript
            });
          }
        }
      };

      this.isRecording = true;
      console.log('🎤 WAV-based realtime recording started...');
      console.log(`📊 Sample rate: ${this.audioContext.sampleRate}Hz`);

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  stopRecording() {
    if (!this.isRecording) return;

    if (this.webSpeechRecognition) {
      this.webSpeechRecognition.stop();
      this.webSpeechRecognition = null;
    }

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.isRecording = false;
    console.log('🛑 Recording stopped');
  }

  reset() {
    this.confirmedTranscript = '';
    this.pendingWebSpeech = '';
    this.fullTranscript = '';
    this.transcriptionCount = 0;
  }

  getFullTranscript() {
    return this.confirmedTranscript;
  }
}
