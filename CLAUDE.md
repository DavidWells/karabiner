# Karabiner Configuration

TypeScript-based Karabiner Elements config. Edit `rules.ts`, run `yarn build` to generate `karabiner.json`.

## Build process

`yarn build` runs `tsm rules.ts && md-magic --files README.md` which:

1. Compiles rules from `rules.ts` into `karabiner.json`
2. Writes `karabiner.json` to **both** locations:
   - `/Users/david/dotfiles/.config/karabiner/karabiner.json` (repo copy)
   - `~/.config/karabiner/karabiner.json` (where Karabiner Elements reads from)
3. Generates `docs/relacon-map.html` and `docs/relacon-map.json` from `RelaconMap` data
4. Runs markdown-magic to update the README table from `docs/relacon-map.json`

## Config sync

Karabiner reads from `~/.config/karabiner/karabiner.json`. The build writes to both the repo and that location directly. No symlink — Karabiner doesn't reliably follow symlinks.

The build preserves non-rule settings (devices, `keyboard_type_v2`, `fn_function_keys`, etc.) by reading the existing config first and only replacing `profiles[0].complex_modifications.rules`.

## ELECOM Relacon mappings

`RelaconMap` array in `rules.ts` is the source of truth for button mappings. It drives:
- `docs/relacon-map.html` — visual reference
- `docs/relacon-map.json` — intermediate data
- README table via markdown-magic `RELACON_MAP` transform (`md.config.js`)

When changing Relacon button behavior in `rules.ts`, you MUST also update the corresponding `RelaconMap` entry to match, then run `yarn build`. This keeps the README table, `docs/relacon-map.html`, and `docs/relacon-map.json` in sync with actual behavior.

## Nav mode

`relacon_mode` variable toggles between 1 (off) and 2 (nav mode on) via B2+B3. When nav mode is active, d-pad buttons fire app-specific navigation instead of arrows/double-tap-to-open.

Nav mode rules go in `RelaconButtons` array and MUST be placed before generic rules for the same key so Karabiner matches them first. The pattern:
- Nav mode tap rules: `relacon_mode == 2` + app condition (e.g. `IS_TERMINAL_WINDOW`) + `isRelacon`
- Nav mode B2 combos: `relacon_b2_held == 1` + `relacon_mode == 2` + `isRelacon` — placed before generic B2 combos

D-pad consumer keys (`volume_increment`, etc.) don't support `to_if_held_down` — the hardware sends instant press+release. Use `mapButton` for nav mode tap actions, not `tapHoldButton`.

When adding nav mode support for a new app:
1. Add `mapButton` rules for each d-pad direction with the app's condition and `relacon_mode == 2`
2. Place them before the generic d-pad rules
3. Update the nav mode section in README.md
4. Update `RelaconMap` if B2 combo behavior changes

App conditions available: `IS_TERMINAL_WINDOW`, `IS_EDITOR_WINDOW`, `IS_BROWSER_WINDOW`, `IS_CHROME_WINDOW`.

## Key files

- `rules.ts` — all Karabiner rules + RelaconMap data + build output logic
- `utils.ts` — helper functions (sublayers, hyper key, etc.)
- `md.config.js` — markdown-magic config for README generation
- `karabiner.json` — generated output, do not edit directly
