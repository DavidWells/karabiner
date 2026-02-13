// Markdown Magic config — generates Relacon button map table in README
const path = require('path')
const fs = require('fs')

module.exports = {
  transforms: {
    RELACON_MAP() {
      const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'relacon-map.json'), 'utf-8'))
      const header = '| Button | Event | Tap | Double Tap | Hold | B2 Combo |'
      const sep = '|---|---|---|---|---|---|'
      const rows = map.map(b =>
        `| ${b.name} | \`${b.event}\` | ${b.tap} | ${b.doubleTap} | ${b.hold} | ${b.b2Combo} |`
      ).join('\n')
      return `${header}\n${sep}\n${rows}`
    }
  }
}
