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

D-pad consumer keys (`volume_increment`, etc.) DO sustain while held (verified via EventViewer — single key_down/key_up pair). They support `to_if_alone` and `to_if_held_down` patterns when used with B2 held as a modifier.

**D-pad modifier limitation:** D-pad center (`play_or_pause`) can act as a held modifier, but ONLY for buttons B1–B5 (separate physical buttons). D-pad directions (up/down/left/right) share the same physical rocker as center — moving from center to a direction releases center first, clearing the held variable before the direction event fires. D-pad-held + d-pad-direction combos are physically impossible.

**Ergonomics:** The thumb rests over B4 (back), B3 (scroll wheel), and B5 (forward). Only one thumb is available, so pressing two of these simultaneously (e.g. B4+B3, B5+B3, B4+B5) is impractical. The thumb is also the only finger on the d-pad. When the thumb moves to the d-pad, only B1 and B2 (front triggers, index/middle finger) are reachable. All other buttons (B3/B4/B5) are hard to reach with the thumb on the d-pad. Practical modifier combos: thumb holds one button (B4/B5/center) while index/middle finger clicks B1 or B2.

When adding nav mode support for a new app:
1. Add `mapButton` rules for each d-pad direction with the app's condition and `relacon_mode == 2`
2. Place them before the generic d-pad rules
3. Update the nav mode section in README.md
4. Update `RelaconMap` if B2 combo behavior changes

App conditions available: `IS_TERMINAL_WINDOW`, `IS_EDITOR_WINDOW`, `IS_BROWSER_WINDOW`, `IS_CHROME_WINDOW`.

Use `RELACON_*` constants for variable conditions instead of inline objects. Defined near `isRelacon` in `rules.ts`:
- `RELACON_B2_HELD` — right trigger held (combo layer)
- `RELACON_NAV_MODE` — nav mode active
- `RELACON_COPIED` — paste armed
- `RELACON_STT_ACTIVE` — speech-to-text active
- `RELACON_DBLCLICK` / `RELACON_B2_DBLCLICK` — double-click timing windows
- `RELACON_B1_HELD` — left trigger held (used for B1+B2 zoom combo)

## macOS setup required

- **Zoom**: System Settings → Accessibility → Zoom → enable BOTH "Use keyboard shortcuts to zoom" AND "Use scroll gesture with modifier keys to zoom" (set to Control). Without both enabled, B2+B1 zoom and B2 double-tap reset won't work.

## B2+B1 zoom

B2+B1 hold (either order) outputs Ctrl for macOS accessibility zoom (Ctrl + scroll wheel). B2 double-tap resets zoom to 1x via CGEvent (bypasses held Ctrl modifier). B2 double-tap also fires right-click context menu (known issue — other buttons don't register while both triggers are held, so no clean reset-only combo).

## iTerm settings

"Copy to pasteboard on selection" (iTerm → Settings → General → Selection) must be OFF — it conflicts with B1's explicit Cmd+C copy-on-release. With it on, iTerm copies on select AND B1 copies on release, causing double-copy and unexpected paste behavior.

## Troubleshooting: missing notifications

macOS Focus/Sleep mode suppresses osascript `display notification` alerts. If mode-switcher notifications (B2+B3) or other alerts stop appearing, check if Focus mode or Do Not Disturb is active before debugging Karabiner rules.

## Stuck variables

Karabiner persists variable state internally. If a variable gets stuck (e.g. `stt_active = 1` when STT isn't running), renaming the variable in `rules.ts` and rebuilding clears the stale state — Karabiner treats the new name as a fresh variable defaulting to 0. This is a cache-bust workaround for when variable state gets out of sync with reality.

## Copy/paste flow

Button1 tap fires Cmd+C and arms paste (`relacon_copied = 1`). Button2 uses `to_if_alone` to paste only on release with no other button pressed — this prevents accidental paste when B2 is held for combos. The `to_if_alone` approach means paste has a slight delay (~300ms) and will also fire on the first tap of a double-tap (known issue, documented in README).

## Speech-to-text + Enter

When speech-to-text is recording (`relacon_stt == 1`), button4 stops recording and fires Enter after a 500ms delay via `to_delayed_action`. The delay gives STT time to paste transcribed text before Enter submits. Uses Karabiner's native delayed action (no shell commands or accessibility permissions needed).

## Tap/hold split pattern

Two variants depending on context:

1. **`to_if_alone` + `to_if_held_down`**: Tap fires one action, hold fires another. ~300ms delay before tap fires (Karabiner waits to see if you're holding). See B2+B3 (nav toggle / clear all).

2. **`to` + `to_if_held_down`**: Tap action fires immediately (no delay), hold action kicks in after threshold. Trade-off: tap action fires even on hold (stray keypress before hold action takes over). Use when `to_if_alone` doesn't work — e.g. B2+button4, where B2 is physically held so Karabiner never considers button4 "alone". See B2+B4 (Shift+Enter / pane switch).

## B2 + d-pad tap/hold split

B2 + d-pad supports both tap and hold actions using `to_if_alone` / `to_if_held_down`. Quick B2+d-pad tap fires window/pane/tab navigation, holding B2+d-pad for 500ms opens an app. This works because `to_if_alone` fires on release (no conflict with B2 being held), and consumer keys DO sustain while the d-pad is held (verified via EventViewer — single key_down on press, key_up on release).

For left/right d-pad where the tap action varies by app (terminal vs editor vs browser), each app gets its own manipulator within the same rule — all sharing the same `to_if_held_down` app-open action.

## Shared navigation shortcuts

`NAV` constant in `rules.ts` is the single source of truth for app navigation shortcuts (prev/next tab, prev/next pane, etc.). Both Razer mouse rules and Relacon nav mode rules reference it. Change a shortcut once, both devices update.

## PopClip extensions

PopClip provides text-selection shortcuts. Extensions live in `/Users/david/dotfiles/extensions/popclip/`:
- `Vibe.popclipext` — focuses iTerm + runs vibe alias
- `iTerm-AddToChat.popclipext` — finds Claude Code pane (✳ in title), pastes selected text with surrounding spaces

## Radial menu (TODO)

B2+B1 tap fires Hyper+P for a radial/pie menu app. Tried Pi Menu and Radial — neither worked well for our use case. Still looking for a good radial menu app for macOS that can be triggered via keyboard shortcut.

## Hammerspoon flag file bridge

Karabiner can distinguish input devices but Hammerspoon can't. To make Hammerspoon actions device-specific, Karabiner writes flag files via `shell_command` that Hammerspoon reads on demand.

Flag constants (`B1_FLAG_ON`, `B1_FLAG_OFF`, etc.) are defined near `RELACON_B1_HELD` in `rules.ts`. Add them to `to` (press) and `to_after_key_up` (release) arrays in manipulators. Flag files live in `../hammerspoon/state/`.

See `../hammerspoon/CLAUDE.md` for the full pattern and how to add new flags.

## Key files

- `rules.ts` — all Karabiner rules + RelaconMap data + build output logic
- `utils.ts` — helper functions (sublayers, hyper key, etc.)
- `md.config.js` — markdown-magic config for README generation
- `karabiner.json` — generated output, do not edit directly
