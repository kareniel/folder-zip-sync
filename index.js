const fs = require('fs')
const path = require('path')
const yazl = require('yazl')
const deasync = require('deasync')

module.exports = zipFolderSync

function zipFolderSync (folder, outputFile, ignores) {
  folder = path.resolve(folder)
  outputFile = path.resolve(outputFile)

  const files = walkSync(folder)
  const zipfile = new yazl.ZipFile()

  let done = false

  zipfile
    .outputStream
    .pipe(fs.createWriteStream(outputFile))
    .on('close', () => done = true)

  files.forEach(file => {
    const stat = fs.statSync(file)
    zipfile.addFile(file, path.relative(folder, file))
  })

  zipfile.end()

  deasync.loopWhile(() => !done)
}

function walkSync (dir, done) {
  const list = fs.readdirSync(dir)
  let results = []

  list.forEach(file => {
    const filepath = path.join(dir, file)
    const stat = fs.statSync(filepath)

    if (stat.isDirectory()) {
      return results = results.concat(walkSync(filepath))
    }

    results.push(filepath)
  })

  return results
}
