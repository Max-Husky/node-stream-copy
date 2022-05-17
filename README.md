# node-stream-copy
## Class: `SplitterStream`
extends the [`Writable`](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#class-streamwritable) class
The splitter stream copies all data written to it to the CopyStreams which can be retrieved with `getCopyStream()`
### Constructor
`new Splitter(copies[, options])`
- `copies` is the number of copy streams to be created
- `options` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
  - `writable` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) is an [`WritableOptions`](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#new-streamwritableoptions)
  - `redable` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) is an [`ReadableOptions`](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#new-streamreadableoptions)
### Method: `getCopyStreams(): CopyStreams[]`
Gets a list of all currently connected `CopyStream`s
## Class: `CopyStream`
extends the [`Readable`](https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#class-streamreadable) class
The copy stream recieves a copy of all the data sent to the `SplitterStream`

## Example
The following will create 4 copies of `fileToCopy.txt` named: `copy0.txt`, `copy1.txt`, `copy2.txt`, and `copy3.txt`

    const SplitterStream = require("@maxhusky/stream-copy");
    const fs = require("fs");
    
    // creating the splitter and all the copy streams
    var splitter = new SplitterStream(4);
    var copies = splitter.getCopyStreams();
    
    // getting the original file
    fs.createReadStream("./fileToCopy.txt").pipe(splitter);
    
    // saving all the copies to file
    for (let i = 0; i < copies.length; i++)
        copies[i].pipe(fs.createWriteStream("./copy" + i + ".txt"));
