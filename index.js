const fs = require('fs')
const path = require('path')
const yazl = require('yazl')
const deasync = require('deasync')

module.exports = zipFolderSync

if (process.argv.length > 2) {
  const args = process.argv.slice(2)
  const folder = path.join(__dirname, args[0])
  const outputFile = args[1] || 'output.zip'
  const ignores = args.slice(2) || ['.git']

  process.stdout.write(`Zipping ${outputFile}...`)

  zipFolderSync(folder, outputFile, ignores)
}


function zipFolderSync (folder, outputFile, ignores) {
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
