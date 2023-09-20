const fs = require('node:fs/promises')
const path = require('node:path')
const pc = require('picocolors')

const folder = process.argv[2] ?? ''

const ls = async (folder) => {
  let files

  try {
    files = await fs.readdir(folder)
  } catch {
    console.error(pc.red(`No se puede leer el directorio ${folder}`))
    process.exit(1)
  }

  const filesPromise = files.map(async file => {
    const filePath = path.join(folder, file)
    let stats

    try {
      stats = await fs.stat(filePath)
    } catch {
      console.error(pc.red(`No se puede leer el archivo ${filePath}`))
      process.exit(1)
    }

    const isDirectory = stats.isDirectory()
    const fileType = isDirectory ? 'D' : 'F'
    const fileSize = stats.size.toString()
    const fileModified = stats.mtime.toLocaleString()

    return `${fileType} ${pc.blue(file.padEnd(20))} ${pc.green(fileSize.padStart(10))} ${fileModified}`
  })

  const filesInfo = await Promise.all(filesPromise)

  filesInfo.forEach(fileInfo => console.log(fileInfo))
}

ls(folder)
