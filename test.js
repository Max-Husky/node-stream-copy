const Splitter = require('./splitter.js');
const fs = require('fs');
const crypto = require('crypto');

const HASHES = crypto.getHashes();
console.log("Stream-Copy> randomly choosing hash alg out of: " + HASHES.length);
const ALG = HASHES[Math.floor(Math.random() * HASHES.length)];
const COPIES = 20

console.log(`Stream-Copy> Alg: ${ALG}, Copies: ${COPIES}`);

// the test hash value
const HASH = crypto.createHash(ALG).update(fs.readFileSync('./splitter.js')).digest('base64');

// getting the splitter
var splitter = new Splitter(COPIES);
var copies = splitter.getCopyStreams();
var completed = 0;

// getting the stream to copy
fs.createReadStream('./splitter.js').pipe(splitter);

// linking each copy to get a hash from them
for (let i = 0; i < copies.length; i++) {
  let h = crypto.createHash(ALG);
  h.on('readable', () => {
    let str = h.read();
    if (str !== null) {
      completed += 1;
      if (str.toString('base64') !== HASH) throw new Error("Stream-Copy> Hash not Matching");
    }
  });
  copies[i].pipe(h);
}

setInterval(() => {
  if (completed > COPIES) throw new Error("Stream-Copy> Tests Completed exceded tests done");
  if (completed === COPIES) {
    console.info("Stream-Copy> Test Successful");
    process.exit(0);
  }
}, 500);
