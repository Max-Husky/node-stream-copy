const Readable = require('stream').Readable;

class CopyStream extends Readable {
  #closeCB;
  #readyCB;

  /**
   * Creates a new copy stream
   * @param {function(CopyStream): void} closeCB The callback to use to unlink the stream
   * @param {function(): void} readyCB The callback to use when ready to recieve more data
   * @param {import('stream').readableOptions} readableOptions
   */
  constructor(closeCB, readyCB, readableOptions) {
    super(readableOptions);
    this.#closeCB = closeCB;
    this.#readyCB = readyCB;
  }

  _read(size) {
    this.#readyCB();
  }

  _destroy() {
    this.#closeCB(this);
  }
}

module.exports = CopyStream;
