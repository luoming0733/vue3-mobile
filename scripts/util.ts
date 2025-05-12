import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import chalk from 'chalk'
import figures from 'figures'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const resolve = (path: string) => join(__dirname, '..', path)

const halfSeparator = new Array(7).fill(figures.line).join('')
export const separator = (text: string) =>
  chalk.dim(halfSeparator + text + halfSeparator)

export const logStart = () => console.log(chalk.dim('start...'))
export const logEnd = () => console.log(chalk.dim('done'))
