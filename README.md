# @DavidWells's Karabiner Elements configuration

Fork of https://github.com/mxstbr/karabiner

If you like TypeScript and want your Karabiner configuration maintainable & type-safe, you probably want to use the custom configuration DSL / generator I created in `rules.ts` and `utils.ts`!

Get ID of apps on mac

```bash
osascript -e 'id of app "Camtasia 2023"'
```

> “This repo is incredible - thanks so much for putting it together! I always avoided Karabiner mostly because of its complicated configuration. **Your project makes it so much easier to work with and so much more powerful. I'm geeking out on how much faster I'm going to be now.**”
>
> — @jhanstra ([source](https://github.com/mxstbr/karabiner/pull/4))

Watch the video about this repo:

[![YouTube video by Max Stoiber explaining how and why to use this repo](https://img.youtube.com/vi/j4b_uQX3Vu0/0.jpg)](https://www.youtube.com/watch?v=j4b_uQX3Vu0)

You probably don't want to use my exact configuration, as it's optimized for my personal style & usage. Best way to go about using this if you want to? Probably delete all the sublayers in `rules.ts` and add your own based on your own needs!

## Installation

1. Install & start [Karabiner Elements](https://karabiner-elements.pqrs.org/)
1. Clone this repository
1. Delete the default `~/.config/karabiner` folder
1. Create a symlink with `ln -s ~/github/mxstbr/karabiner ~/.config` (where `~/github/mxstbr/karabiner` is your local path to where you cloned the repository)
1. [Restart karabiner_console_user_server](https://karabiner-elements.pqrs.org/docs/manual/misc/configuration-file-path/) with `` launchctl kickstart -k gui/`id -u`/org.pqrs.karabiner.karabiner_console_user_server ``

## Development

```
yarn install
```

to install the dependencies. (one-time only)

```
yarn run build
```

builds the `karabiner.json` from the `rules.ts`.

```
yarn run watch
```

watches the TypeScript files and rebuilds whenever they change.

## License

Copyright (c) 2022 Maximilian Stoiber, licensed under the [MIT license](./LICENSE.md).


## ELECOM Relacon Button Map

<!-- docs RELACON_MAP -->
| Button | Event | Tap | Double Tap | Hold | B2 Combo |
|---|---|---|---|---|---|
| Left trigger | `button1` | Click + Cmd+C + arm paste | Select All (Cmd+A) | — (reserved) | — |
| Right trigger | `button2` | Paste (Cmd+V) if armed, else nothing | Right-click | Modifier (enables combos) | — |
| Scroll wheel press | `button3` | Delete | Esc+Esc+SelectAll+Delete | Esc+Esc+SelectAll+Delete | B2+B3 = Toggle nav mode |
| Back (left side) | `button4` | Enter | — | — | B2+B4 = Shift+Enter / Nav: Prev window |
| Forward (right side) | `button5` | SuperWhisper (toggle whisper) | — | — | B2+B5 = Tab+Enter / Nav: Next window |
| D-pad up | `volume_increment` | Up arrow | Cursor app | — | Nav: B2+Up = Cursor |
| D-pad down | `volume_decrement` | Down arrow | iTerm app | — | Nav: B2+Down = iTerm |
| D-pad left | `scan_previous_track` | Left arrow | Chrome app | — | B2+Left = Prev space / Nav: Chrome |
| D-pad right | `scan_next_track` | Right arrow | Tower app | — | B2+Right = Next space / Nav: Tower |
| D-pad center | `play_or_pause` | Enter | — | — | — |
<!-- /docs -->

**Whisper mode:** toggle via button5. While armed, next button5 press fires SuperWhisper and disarms.

**Copy/paste:** Every button1 release fires Cmd+C and arms paste mode. Next button2 press fires Cmd+V and resets.

**Button2 modifier:** Hold button2 (right trigger) to activate combo layer — other buttons gain alternate actions while held.

**Reserved:** Button1 (left trigger) hold slot is reserved — adding `to_if_held_down` breaks click-drag and copy/paste flow.

**Button2 double-tap:** Fires right-click. Single tap does nothing (unless paste is armed).

## Nav Mode

Toggle with **B2+B3** (right trigger + scroll wheel press). A macOS notification shows "Nav mode ON/OFF".

When active:
- **D-pad** navigates within the focused app (tabs, panes) instead of arrows/double-tap-to-open
- **B2 + d-pad** opens the app that double-tap normally opens (Cursor, iTerm, Chrome, Tower)
- **B2 + button4/5** cycles windows (Cmd+\`/Cmd+Shift+\`) instead of Shift+Enter/Tab+Enter

### D-pad per app

| D-pad | iTerm | Cursor / VS Code | Chrome |
|---|---|---|---|
| Up | Next tab | TODO | TODO |
| Down | Prev tab | TODO | TODO |
| Left | Next pane | TODO | TODO |
| Right | Prev pane | TODO | TODO |

### B2 combos (all apps)

| Combo | Nav mode | Default mode |
|---|---|---|
| B2 + B3 | Toggle nav mode | Toggle nav mode |
| B2 + B4 (back) | Prev window (Cmd+Shift+\`) | Shift+Enter |
| B2 + B5 (forward) | Next window (Cmd+\`) | Tab+Enter |
| B2 + D-pad up | Open Cursor | — |
| B2 + D-pad down | Open iTerm | — |
| B2 + D-pad left | Open Chrome | Prev space |
| B2 + D-pad right | Open Tower | Next space |

### Adding a new app

Shortcuts are defined in the `NAV` constant in `rules.ts` — shared by both Razer mouse and Relacon mappings. Change the shortcut once, both devices update.

## Pattern Ideas

**Multi-button combos**
- Simultaneous press of two buttons → different action (e.g. Button1+Button2 = app switch)
- Button + scroll → zoom, horizontal scroll, or volume
- Button + pointer movement → window resize or desktop switch

**Timing-based**
- Double-tap-and-hold — double click but hold on second press, triggers a different mode (drag lock)
- Tap-then-tap-another — sequential presses of different buttons within a window (chord sequence / vim-style)

**Modal / layer patterns**
- Hold one button to enter a "mode" where all other inputs change meaning
- Toggle modes — tap a combo to enter persistent mode, tap again to exit
- Sticky modifiers — tap a button to make the next action modified (one-shot shift)

**Gesture-inspired**
- Directional hold — hold button + move pointer in a direction = different actions per direction
- Rapid repeated press (triple-click, quadruple-click) — each count maps to a different action

**Chording**
- Pressing specific combos of 3+ buttons simultaneously maps to unique actions
- With 3 buttons you get 7 unique combos

**Best for handheld mouse**
1. Simultaneous press combos — Button1+Button2, Button1+Button3, etc.
2. Hold-as-layer — one button becomes a modifier that changes what others do
3. Sequential chords — Button1 then Button2 within 200ms = unique action
4. Tap dance — single/double/triple tap on same button, each doing something different

## Notes

Extra double tap of https://app.screencast.com/SnjDxLxv4S2AQ