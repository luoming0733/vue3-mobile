import checkbox from '@inquirer/checkbox'
import { pick } from 'lodash-unified'

import { genIcons } from './genIcons.js'
import { logEnd, logStart, separator } from './util.js'

const answer = await checkbox({
  message: '选择脚本执行',
  choices: [
    { type: 'separator', separator: separator('Default') },
    { name: 'genIcons', value: 'genIcons' }
  ]
}).catch(err => {})

for (const [k, v] of Object.entries(
  pick(
    {
      genIcons
    },
    answer!
  )
)) {
  console.group(k)
  logStart()

  await v()

  logEnd()
  console.groupEnd()
}
