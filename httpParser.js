// httpParser.js

const { EventEmitter } = require('events');

export class HTTPParser extends EventEmitter {
  constructor() {
    super();
    this.buffer = Buffer.alloc(0);
    this.headersComplete = false;
  }

  parse(data) {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);
    this.processBuffer();
  }

  processBuffer() {
    const headerEnd = this.buffer.indexOf('\r\n\r\n');

    if (this.headersComplete === false && headerEnd !== -1) {
      const headers = this.buffer.subarray(0, headerEnd).toString();
      this.emit('headers', headers);

      this.buffer = this.buffer.subarray(headerEnd + 4);
      this.headersComplete = true;
    }

    if(this.headersComplete && Buffer.byteLength(this.buffer) > 0) {
      this.emit('data', this.buffer);
      this.buffer = Buffer.alloc(0);
    }
  }
}
