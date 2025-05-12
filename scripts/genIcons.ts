import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { basename } from 'node:path'

import { cleanupSVG, SVG } from '@iconify/tools'
import { globbySync } from 'globby'

import { resolve } from './util.js'

export async function genIcons() {
  const iconsSvgPath = resolve('/src/assets/icons/svg')
  const iconsJsonPath = resolve('/src/assets/icons/json')

  const files = globbySync([`${iconsSvgPath}/*.svg`])

  if (!existsSync(iconsJsonPath)) {
    mkdirSync(iconsJsonPath)
  } else {
    rmSync(iconsJsonPath, { recursive: true, force: true })
    mkdirSync(iconsJsonPath)
  }

  files.forEach(file => {
    const content = readFileSync(file, { encoding: 'utf-8' })

    const svg = new SVG(content)
    const fileName = basename(file, '.svg')

    cleanupSVG(svg)

    const icon = {
      key: fileName,
      value: {
        body: svg.getBody(),
        width: svg.viewBox.width || 48,
        height: svg.viewBox.height || 48
      }
    }

    writeFileSync(`${iconsJsonPath}/${fileName}.json`, JSON.stringify(icon))
  })
}
