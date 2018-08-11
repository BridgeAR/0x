'use strict'
const fs = require('fs')
process.stdout.write = (() => (chunk, encoding, cb) => {
  if (typeof encoding === 'function') {
    cb = encoding
  }
  fs.writeSync(3, chunk)
  if (typeof cb === 'function') cb()
  return true
})(process.stdout.write.bind(process.stdout))
