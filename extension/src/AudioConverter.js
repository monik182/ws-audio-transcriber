import Recorder from 'opus-recorder';

class AudioConverter {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }

  async createAudioBufferFromUint8Array(uint8Array) {
    try {
      const audioBuffer = await this.context.decodeAudioData(uint8Array.buffer);
      return audioBuffer;
    } catch (error) {
      console.log('ERROR>>>>', error)
      throw new Error('Failed to decode audio data. Ensure the data is in a supported audio format.');
    }
  }

  audioBufferToWav(audioBuffer) {
    const numOfChannels = audioBuffer.numberOfChannels,
      length = audioBuffer.length * numOfChannels * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      sampleRate = audioBuffer.sampleRate,
      bitDepth = 16;

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioBuffer.length * numOfChannels * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, audioBuffer.length * numOfChannels * 2, true);

    let offset = 44,
      pos = 0;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    while (pos < audioBuffer.length) {
      for (let i = 0; i < numOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][pos]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
      pos++;
    }

    return buffer;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  download(buffer, filename, mimeType) {
    const blob = new Blob([buffer], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async convertAndDownload(data, mimeType, filename = 'output') {
    try {
      const audioBuffer = await this.createAudioBufferFromUint8Array(data);
      let buffer;
      let extension;

      switch (mimeType) {
        case 'audio/wav':
          buffer = this.audioBufferToWav(audioBuffer);
          extension = '.wav';
          break;
        case 'audio/ogg; codecs=opus':
          buffer = await this.audioBufferToOgg(audioBuffer);
          extension = '.ogg';
          break;
        default:
          throw new Error('Unsupported MIME type');
      }

      this.download(buffer, filename + extension, mimeType);
    } catch (error) {
      console.error('Error converting and downloading audio:', error);
    }
  }

  async audioBufferToOgg(audioBuffer) {
    return new Promise((resolve, reject) => {
      const recorder = new Recorder({
        encoderPath: '/path/to/your/public/js/encoderWorker.min.js', // Update this path
        encoderSampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        streamPages: false,
        maxFramesPerPage: 1,
        encoderApplication: 2049, // VOIP
        encoderFrameSize: 20,
        bufferLength: 4096,
        streamOptions: { mode: 'ogg', mimeType: 'audio/ogg' },
      });

      recorder.ondataavailable = (typedArray) => {
        resolve(typedArray.buffer);
      };

      recorder.onstart = () => {
        const channels = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
          channels.push(audioBuffer.getChannelData(i));
        }
        const interleaved = this.interleave(channels);
        recorder.encode([interleaved]);
      };

      recorder.onstreamerror = (e) => {
        reject(e);
      };

      recorder.start();
    });
  }

  interleave(channels) {
    const length = channels[0].length;
    const result = new Float32Array(length * channels.length);
    let index = 0, inputIndex = 0;

    while (index < result.length) {
      for (let i = 0; i < channels.length; i++) {
        result[index++] = channels[i][inputIndex];
      }
      inputIndex++;
    }
    return result;
  }
}

export default AudioConverter;
