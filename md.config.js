// Markdown Magic config — generates Relacon tables in README
const path = require('path')
const fs = require('fs')

function loadMap() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'relacon-map.json'), 'utf-8'))
}

module.exports = {
  transforms: {
    RELACON_MAP() {
      const { buttons } = loadMap()
      const header = '| Button | Event | Tap | Double Tap | Hold | B2 Combo |'
      const sep = '|---|---|---|---|---|---|'
      const rows = buttons.map(b =>
        `| ${b.name} | \`${b.event}\` | ${b.tap} | ${b.doubleTap} | ${b.hold} | ${b.b2Combo} |`
      ).join('\n')
      return `${header}\n${sep}\n${rows}`
    },
    RELACON_MODIFIERS() {
      const { modifiers } = loadMap()
      const header = '| Modifier | Combo | Action |'
      const sep = '|---|---|---|'
      const rows = modifiers.map(m =>
        `| ${m.modifier} | ${m.combo} | ${m.action} |`
      ).join('\n')
      return `${header}\n${sep}\n${rows}`
    },
    RELACON_MODES() {
      const { modes } = loadMap()
      const header = '| D-pad | Edit (default) | Nav | Media |'
      const sep = '|---|---|---|---|'
      const rows = modes.map(m =>
        `| ${m.button} | ${m.edit} | ${m.nav} | ${m.media} |`
      ).join('\n')
      return `${header}\n${sep}\n${rows}`
    },
  }
}
