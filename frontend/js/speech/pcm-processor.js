class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 160000; // 10 seconds worth of samples (16000Hz * 10)
    this.buffer = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      // Convert to mono
      const channelData = input[0];

      // Add to buffer
      for (let i = 0; i < channelData.length; i++) {
        this.buffer.push(channelData[i]);
      }

      // Send when 10 seconds of data is accumulated
      if (this.buffer.length >= this.bufferSize) {
        const float32Array = new Float32Array(this.buffer.slice(0, this.bufferSize));
        this.port.postMessage(float32Array);

        // Clear buffer
        this.buffer = this.buffer.slice(this.bufferSize);
      }
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);