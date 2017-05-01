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
    if(stat.isDirectory()){
      file = path.relative(folder, file);
      zipfile.addEmptyDirectory(file, path.relative(folder, file))
    }else{
      zipfile.addFile(file, path.relative(folder, file))
    }
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

    results.push(filepath)
    if (stat.isDirectory()) {
      return results = results.concat(walkSync(filepath))
    }
  })

  return results
}
