const Writable = require('stream').Writable;
const CopyStream = require('./copy.js');

class SplitterStream extends Writable {
  /**
   * The copy streams
   * @private @type {CopyStream[]} @readonly
   */
  #copies;

  /**
   * The streams currently being waited on
   * @private @type {number[]} @readonly
   */
  #waiting;

  /**
   * The callback waiting to be finished
   * @private @type {function(): void} @readonly
   */
  #cb;

  /**
   * The remaining data to push through
   * @private @type {Chunks}
   */
  #remain;

  /**
   * Create Copies
   * @param {number} copies 
   * @param {{writable: import('stream').WritableOptions, readable: import('stream').ReadableOptions}} options
   */
  constructor(copies, {writable = {} = {}, readable = {} = {}} = {}) {
    super(writable);

    // creating the copy stream
    // and linking the closing method and ready method to each
    let arr = [];
    for (let i = 0; i < copies; i++) {
      arr[i] = new CopyStream(this.#closeCopy.bind(this, i), this.#ready.bind(this, i), readable);
    }
    this.#copies = arr;

    this.#waiting = [];
  }

  /**
   * Removes a copy stream from the splitter
   * @param {number} id The id of the copy stream
   * @param {*} copyStream The copy stream
   */
  #closeCopy(id, copyStream) {
    // removing the stream from the copy list
    let i = this.#copies.indexOf(copyStream);
    if (i >= 0) this.#copies.splice(i, 1);

    // removing the stream from the waiting list
    this.#ready(id);
  }

  /**
   * removes id from the waiting list and starts copying if empty
   * @param {number} id The id to remove
   */
  #ready(id) {
    let i = this.#waiting.indexOf(id);
    if (i >= 0) this.#waiting.splice(i, 1);

    // if all streams are ready start sending the old data
    if (this.#waiting.length === 0 && this.#cb !== undefined) this._writev(this.#remain, this.#cb);
  }

  /**
   * Gets a list of all copy streams
   * @returns {CopyStream[]} A copy of the copy stream array
   */
  getCopyStreams() {
    return this.#copies.slice(0);
  }

  /**
   * @override
   * @inheritdoc
   * @param {Chunks} chunks
   * @param {function(): void} cb
   */
  _writev(chunks, cb) {
    let i,
        size = chunks.length,
        copies = this.#copies,
        copyCount = copies.length,
        reading = true;

    // attempting to send all the data to the copy streams
    // exits early if one stream is full
    for (i = 0; i < size && reading; i++) {
      for (let c = 0; c < copyCount; c++) {
        // pushing the chunk through and checks if stream is full
        if (!copies[c].push(chunks[i].chunk, chunks[i].encoding)) {
          // if full adding the stream to the waiting list
          this.#waiting.push(c);
          reading = false;
        }
      }
    }

    // checks to see if all streams are still ready
    if (reading) {
      // telling the stream its done with this set.
      cb();
    } else {

      // if not it saves the cb and any unsent data for
      // when they are ready again
      this.#cb = cb;
      this.#waiting = chunks.slice(i);
    }
  }

  _write(chunk, encoding, cb) {
    this._writev([{chunk: chunk, encoding: encoding}], cb);
  }
}

module.exports = SplitterStream;

/**
 * @typedef {Object[]} Chunks
 * @property {Chunk} chunk The chunks of data
 * @property {ChunkEncoding} encoding The encoding for the chunk
 */
/**
 * @typedef {String|Buffer} Chunk
 */
/**
 * @typedef {('ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex')} ChunkEncoding
 */
