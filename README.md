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

| Physical Button | Event | Tap | Double Tap | Hold |
|---|---|---|---|---|
| Left trigger (primary click) | `button1` | Left click + Cmd+C + arm paste | SuperWhisper + arm whisper mode | — |
| Right trigger (secondary click) | `button2` | Paste (Cmd+V) if armed, otherwise click | — | Tab + Enter |
| Middle click (scroll wheel) | `button3` | Delete | Escape | Esc + Esc + Select All + Delete |
| Back (left side) | `button4` | Enter | Escape | — |
| Forward (right side) | `button5` | SuperWhisper (toggle whisper mode) | — | — |
| D-pad up | `volume_increment` | Up arrow | Cursor app | `a` (test) |
| D-pad down | `volume_decrement` | Down arrow | iTerm app | — |
| D-pad left | `scan_previous_track` | Left arrow | Chrome app | — |
| D-pad right | `scan_next_track` | Right arrow | Tower app | — |
| D-pad center | `play_or_pause` | Enter | — | — |

**Whisper mode:** arm via double-click button1 or single press button5. While armed, next button1 click fires SuperWhisper and disarms. Button5 toggles on/off.

**Copy/paste:** Every button1 release fires Cmd+C and arms paste mode. Next button2 press fires Cmd+V and resets.

**Reserved:** Button1 (left trigger) hold slot is reserved — adding `to_if_held_down` breaks click-drag and copy/paste flow.

**Future:** Button2 (right trigger) double-tap is a candidate for a mode switcher — set a variable on double-tap to contextually remap other buttons, enabling alternate button layers.

## Notes

Extra double tap of https://app.screencast.com/SnjDxLxv4S2AQ