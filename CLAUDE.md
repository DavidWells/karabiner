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

Update `RelaconMap` when changing button mappings — the build regenerates all docs automatically.

## Key files

- `rules.ts` — all Karabiner rules + RelaconMap data + build output logic
- `utils.ts` — helper functions (sublayers, hyper key, etc.)
- `md.config.js` — markdown-magic config for README generation
- `karabiner.json` — generated output, do not edit directly
