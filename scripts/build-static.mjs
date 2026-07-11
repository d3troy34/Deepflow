import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const projectRoot = dirname(root)
const dist = join(projectRoot, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

await cp(join(projectRoot, 'index.html'), join(dist, 'index.html'))
await cp(join(projectRoot, 'legal.html'), join(dist, 'legal.html'))
await cp(join(projectRoot, 'css'), join(dist, 'css'), { recursive: true })
await cp(join(projectRoot, 'js'), join(dist, 'js'), { recursive: true })
await cp(join(projectRoot, 'assets'), join(dist, 'assets'), { recursive: true })
await cp(join(projectRoot, 'app', 'dist'), join(dist, 'app'), { recursive: true })
