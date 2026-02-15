// @ts-nocheck
import fs from 'fs'
import path from 'path'
import os from 'os'
import { KarabinerRules } from './types'
import { createHyperSubLayers, createRightHyperSubLayers, app, open } from './utils'
import { autoQuotes } from './rules/auto-quotes'

const textEditorIds = [
  '^com\\.microsoft\\.VSCode$',
  '^com\\.sublimetext\\.4$',
  '^com\\.github\\.atom$',
  '^com\\.googlecode\\.iterm2$',
  '^com\\.jetbrains\\.pycharm$',
  '^com\\.visualstudio\\.code\\.oss$',
  '^com\\.cursor\\.code\\.oss$',
  '^com\\.todesktop\\.230313mzl4w4u92$',
]

const editorIds = [
  '^com\\.microsoft\\.VSCode$',
  '^com\\.sublimetext\\.4$',
  // cursor
  '^com\\.todesktop\\.230313mzl4w4u92$'
]

const terminalIds = [
  '^com\\.googlecode\\.iterm2$'
]

const browserIds = [
  '^com\\.apple\\.Safari$',
  '^com\\.google\\.Chrome$',
  '^com\\.google\\.Chrome\\.canary$',
  '^com\\.opera\\.Opera$',
  '^com\\.brave\\.Browser$',
]

const IS_TERMINAL_WINDOW = [
  {
    type: 'frontmost_application_if',
    bundle_identifiers: terminalIds,
  },
]

const IS_EDITOR_WINDOW = [
  {
    type: 'frontmost_application_if',
    bundle_identifiers: editorIds,
  },
]

const IS_BROWSER_WINDOW = [
  {
    type: 'frontmost_application_if',
    bundle_identifiers: browserIds,
  },
]

const IS_CHROME_WINDOW = [
  {
    type: 'frontmost_application_if',
    bundle_identifiers: [
      '^com\\.google\\.Chrome$',
      '^com\\.google\\.Chrome\\.canary$',
    ],
  },
]

// Speech-to-text hotkey (Option+Control+Space)
const OPEN_TEXT_TO_SPEECH = [
  {
    key_code: 'spacebar',
    modifiers: ['left_option', 'left_control'],
  },
]

// Set in keyboard maestro
const toggleBackToPreviousApp = [
  {
    repeat: false,
    key_code: 'l',
    modifiers: ['left_command', 'left_option', 'left_shift', 'left_control'],
  },
]

// App navigation shortcuts — single source of truth for Razer mouse + Relacon mappings
const NAV = {
  terminal: {
    prevTab: { key_code: 'open_bracket', modifiers: ['left_command', 'left_shift'] },
    nextTab: { key_code: 'close_bracket', modifiers: ['left_command', 'left_shift'] },
    prevPane: { key_code: 'open_bracket', modifiers: ['left_command'] },
    nextPane: { key_code: 'close_bracket', modifiers: ['left_command'] },
    closeTab: { key_code: 'w', modifiers: ['left_command'] },
  },
  editor: {
    prevTab: { key_code: 'left_arrow', modifiers: ['left_command', 'left_option'] },
    nextTab: { key_code: 'right_arrow', modifiers: ['left_command', 'left_option'] },
    closeTab: { key_code: 'w', modifiers: ['left_command'] },
  },
  browser: {
    prevTab: { key_code: 'tab', modifiers: ['left_control', 'left_shift'] },
    nextTab: { key_code: 'tab', modifiers: ['left_control'] },
    closeTab: { key_code: 'w', modifiers: ['left_command'] },
  },
  global: {
    nextWindow: { key_code: 'grave_accent_and_tilde', modifiers: ['left_command'] },
    prevWindow: { key_code: 'grave_accent_and_tilde', modifiers: ['left_command', 'left_shift'] },
  },
}

const ejectToScreenShot = [
  {
    description: 'Eject to Screenshot',
    manipulators: [
      {
        from: {
          consumer_key_code: 'eject',
        },
        to: [
          {
            key_code: '5',
            modifiers: ['left_command', 'left_shift'],
          },
        ],
        type: 'basic',
      },
    ],
  },
]

const ejectKeyToDelete = [
  {
    description: 'Eject to Screenshot',
    manipulators: [
      {
        from: {
          consumer_key_code: 'eject',
        },
        to: [
          {
            key_code: 'delete_or_backspace',
          },
        ],
        type: 'basic',
      },
    ],
  },
]

const doubleShiftToEnter = [
  {
    "description": "Double-tap left shift → Enter key",
    "manipulators": [
      {
        "conditions": [
          {
            "name": "left_shift_pressed",
            "type": "variable_if",
            "value": 1
          }
        ],
        "from": {
          "key_code": "left_shift",
          "modifiers": {
            "optional": ["any"]
          }
        },
        "to": [
          {
            "key_code": "return_or_enter"
          }
        ],
        "type": "basic"
      },
      {
        "from": {
          "key_code": "left_shift",
          "modifiers": {
            "optional": ["any"]
          }
        },
        "to": [
          {
            "set_variable": {
              "name": "left_shift_pressed",
              "value": 1
            }
          },
          {
            "key_code": "left_shift"
          }
        ],
        "to_delayed_action": {
          "to_if_canceled": [
            {
              "set_variable": {
                "name": "left_shift_pressed",
                "value": 0
              }
            }
          ],
          "to_if_invoked": [
            {
              "set_variable": {
                "name": "left_shift_pressed", 
                "value": 0
              }
            }
          ]
        },
        "type": "basic"
      }
    ]
  }
]

/* Razer mouse */
const isMouseButton = [
  {
    type: 'device_if',
    identifiers: [
      {
        product_id: 103,
        vendor_id: 5426,
      },
      {
        product_id: 83,
        vendor_id: 5426,
      },
    ],
  },
]

/* ELECOM Relacon trackball */
const isRelacon = [
  {
    type: 'device_if',
    identifiers: [
      {
        vendor_id: 1390,
        product_id: 342,
      },
    ],
  },
]

// Right trigger (button2) is physically held down — activates combo layer for other buttons
const RELACON_B2_HELD = { type: 'variable_if', name: 'relacon_b2_held', value: 1 }
// Mode: nav — d-pad fires app navigation instead of arrows
const RELACON_NAV_MODE = { type: 'variable_if', name: 'relacon_mode', value: 2 }
// Mode: media — d-pad passes through native consumer keys (volume, track skip, play/pause)
const RELACON_MEDIA_MODE = { type: 'variable_if', name: 'relacon_mode', value: 3 }
// Left trigger (button1) fired Cmd+C — next button2 press will paste
const RELACON_COPIED = { type: 'variable_if', name: 'relacon_copied', value: 1 }
// Speech-to-text active — next button5 press stops recording and disarms
const STT_ACTIVE = { type: 'variable_if', name: 'stt_active', value: 1 }
// Back button (button4) held — activates combo layer
const RELACON_B4_HELD = { type: 'variable_if', name: 'relacon_b4_held', value: 1 }
// D-pad center (play_or_pause) held — activates combo layer
const RELACON_CENTER_HELD = { type: 'variable_if', name: 'relacon_center_held', value: 1 }
// Forward button (button5) held — activates combo layer
const RELACON_B5_HELD = { type: 'variable_if', name: 'relacon_b5_held', value: 1 }
const DICTATION_STATE_ON = { set_variable: { name: 'stt_active', value: 1 } }
const DICTATION_STATE_OFF = { set_variable: { name: 'stt_active', value: 0 } }
// Button1 double-click detected within timing window
const RELACON_DBLCLICK = { type: 'variable_if', name: 'relacon_dblclick', value: 1 }
// Button2 double-click detected within timing window
const RELACON_B2_DBLCLICK = { type: 'variable_if', name: 'relacon_b2_dblclick', value: 1 }

const CLEAR_ALL = [
  { key_code: 'escape' },
  { key_code: 'escape' },
  { key_code: 'a', modifiers: ['left_command'] },
  { key_code: 'delete_or_backspace' },
]

// Window management actions — shared across hyper key sublayers and Relacon combos
const MOVE_WINDOW_TO_NEXT_DISPLAY = [
  { key_code: 'right_arrow', modifiers: ['left_option', 'left_command', 'left_control'] },
]

// Set Karabiner variables via CLI — usable in shell_command actions or external scripts
const KARABINER_CLI = '/Library/Application Support/org.pqrs.Karabiner-Elements/bin/karabiner_cli'
function setVars(vars) {
  return { shell_command: `'${KARABINER_CLI}' --set-variables '${JSON.stringify(vars)}'` }
}

// Maps a held button + another button/key to an action (isRelacon baked in)
function mapHeldCombo({ description, held, button, consumerKey, to, conditions = [] }) {
  return mapButton({ description, button, consumerKey, to, conditions: [held, ...isRelacon, ...conditions] })
}

// Maps a pointing_button or consumer_key_code to an action
function mapButton({ description, button, consumerKey, to, conditions = [] }) {
  const from = consumerKey ? { consumer_key_code: consumerKey } : { pointing_button: button }
  return {
    description,
    manipulators: [
      {
        type: 'basic',
        from,
        to,
        conditions: [...conditions],
      },
    ],
  }
}

// Tap fires one action, hold fires another (once, no repeat)
function tapHoldButton({ description, button, consumerKey, tap, hold, conditions = [], delay = 300 }) {
  const from = consumerKey ? { consumer_key_code: consumerKey } : { pointing_button: button }
  return {
    description,
    manipulators: [
      {
        type: 'basic',
        from,
        to_if_alone: tap,
        to_if_held_down: hold.map(h => ({ ...h, repeat: false })),
        parameters: {
          'basic.to_if_alone_timeout_milliseconds': delay,
          'basic.to_if_held_down_threshold_milliseconds': delay,
        },
        conditions: [...conditions],
      },
    ],
  }
}

// Single press fires one action (or passthrough), double press fires another
function doubleClickButton({ description, button, consumerKey, to, singleTo, conditions = [], delay = 300 }) {
  const key = button || consumerKey
  const varName = `double_click_${key}`
  const from = consumerKey ? { consumer_key_code: consumerKey } : { pointing_button: button }
  const passthrough = consumerKey ? [] : [{ pointing_button: button }]
  return {
    description,
    manipulators: [
      {
        type: 'basic',
        from,
        to,
        conditions: [
          { type: 'variable_if', name: varName, value: 1 },
          ...conditions,
        ],
      },
      {
        type: 'basic',
        from,
        to: [
          { set_variable: { name: varName, value: 1 } },
          ...(singleTo || passthrough),
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: varName, value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: varName, value: 0 } },
          ],
        },
        parameters: {
          'basic.to_delayed_action_delay_milliseconds': delay,
        },
        conditions: [...conditions],
      },
    ],
  }
}

/*
 * ELECOM Relacon available inputs:
 *   pointing_button:
 *     button1 - left click (L)
 *     button2 - right click (R)
 *     button3 - middle click (scroll wheel press)
 *     button4 - back (left side)
 *     button5 - forward (right side)
 *   consumer_key_code:
 *     scan_previous_track, scan_next_track (d-pad left/right)
 *     volume_increment, volume_decrement (d-pad up/down)
 *     play_or_pause (d-pad center)
 */

// Source of truth for Relacon button mappings — generates HTML and README table
const RelaconMap = [
  { name: 'Left trigger', event: 'button1', tap: 'Click + Cmd+C + arm paste', doubleTap: 'Escape + Select All (Cmd+A)', hold: '— (reserved)', b2Combo: '—' },
  { name: 'Right trigger', event: 'button2', tap: 'Paste (Cmd+V) on release if armed', doubleTap: 'Right-click', hold: 'Modifier (enables combos)', b2Combo: '—' },
  { name: 'Scroll wheel press', event: 'button3', tap: 'Delete (repeats, 3s → clear all)', doubleTap: '—', hold: '—', b2Combo: 'B2+B3 tap = Cycle mode (Edit→Nav→Media) / hold = Clear all' },
  { name: 'Back (left side)', event: 'button4', tap: 'Enter (stops STT + delayed Enter if active)', doubleTap: '—', hold: 'Modifier (B4 layer)', b2Combo: 'B2+B4 tap = Shift+Enter, hold = next pane/tab / Nav: Prev pane (iTerm) or tab' },
  { name: 'Forward (right side)', event: 'button5', tap: 'Speech-to-text (toggle)', doubleTap: '—', hold: 'Modifier (B5 layer)', b2Combo: 'B2+B5 = Tab+Enter / Nav: Next pane (iTerm) or tab' },
  { name: 'D-pad up', event: 'volume_increment', tap: 'Up arrow', doubleTap: 'Cursor app', hold: '—', b2Combo: 'B2+Up = Next window / Nav: Cursor / Media: Volume up' },
  { name: 'D-pad down', event: 'volume_decrement', tap: 'Down arrow', doubleTap: 'iTerm app', hold: '—', b2Combo: 'B2+Down = Prev window / Nav: iTerm / Media: Volume down' },
  { name: 'D-pad left', event: 'scan_previous_track', tap: 'Left arrow', doubleTap: 'Chrome app', hold: '—', b2Combo: 'B2+Left = Prev pane/tab / Nav: Chrome / Media: Prev track' },
  { name: 'D-pad right', event: 'scan_next_track', tap: 'Right arrow', doubleTap: 'Tower app', hold: '—', b2Combo: 'B2+Right = Next pane/tab / Nav: Tower / Media: Next track' },
  { name: 'D-pad center', event: 'play_or_pause', tap: 'Enter', doubleTap: '—', hold: '—', b2Combo: 'Nav: B2+Center = Close tab / Media: Play/Pause' },
]

// Modifier layers — hold a button to activate a combo layer with B1/B2
const RelaconModifiers = [
  { modifier: 'B2 (right trigger)', combo: 'B2 + B3', action: 'Cycle mode (Edit→Nav→Media) / hold = Clear all' },
  { modifier: 'B2 (right trigger)', combo: 'B2 + B4', action: 'Tap: Shift+Enter / Hold: next pane/tab' },
  { modifier: 'B2 (right trigger)', combo: 'B2 + B5', action: 'Tab + Enter' },
  { modifier: 'B2 (right trigger)', combo: 'B2 + D-pad', action: 'Window/pane/tab switching (edit) or app switching (nav)' },
  { modifier: 'B4 (back)', combo: 'B4 + B1', action: 'Escape (cancel request)' },
  { modifier: 'B4 (back)', combo: 'B4 + B2', action: 'Move window to next display' },
  { modifier: 'B5 (forward)', combo: 'B5 + B1', action: '(test: types a)' },
  { modifier: 'B5 (forward)', combo: 'B5 + B2', action: '(test: types b)' },
]

// D-pad behavior per mode
const RelaconModes = [
  { button: 'D-pad up', edit: 'Up arrow', nav: 'Next window', media: 'Volume up' },
  { button: 'D-pad down', edit: 'Down arrow', nav: 'Prev window', media: 'Volume down' },
  { button: 'D-pad left', edit: 'Left arrow', nav: 'Prev tab', media: 'Prev track' },
  { button: 'D-pad right', edit: 'Right arrow', nav: 'Next tab', media: 'Next track' },
  { button: 'D-pad center', edit: 'Enter', nav: '—', media: 'Play/Pause' },
]

const RelaconButtons = [
  // ── D-pad center combos (center can only modify B1–B5, not other d-pad directions — same physical rocker)
  // TODO: map Center + B1 to a real action
  mapHeldCombo({
    description: '[RELACON] Center + B1 => type t',
    held: RELACON_CENTER_HELD,
    button: 'button1',
    to: [{ key_code: 't' }],
  }),
  // TODO: map Center + B2 to a real action
  mapHeldCombo({
    description: '[RELACON] Center + B2 => type q',
    held: RELACON_CENTER_HELD,
    button: 'button2',
    to: [{ key_code: 'q' }],
  }),

  // ── B4/B5 combo tests
  mapHeldCombo({
    description: '[RELACON] B4 + B2 => move window to next display',
    held: RELACON_B4_HELD,
    button: 'button2',
    to: MOVE_WINDOW_TO_NEXT_DISPLAY,
  }),
  // Cancel active request (e.g. stop Claude generation) + clear STT state
  mapHeldCombo({
    description: '[RELACON] B4 + B1 => Escape',
    held: RELACON_B4_HELD,
    button: 'button1',
    to: [{ key_code: 'escape' }, DICTATION_STATE_OFF],
  }),
  // TODO: map B5 + B1 to a real action
  mapHeldCombo({
    description: '[RELACON] B5 + B1 => type a',
    held: RELACON_B5_HELD,
    button: 'button1',
    to: [{ key_code: 'a' }],
  }),
  // TODO: map B5 + B2 to a real action
  mapHeldCombo({
    description: '[RELACON] B5 + B2 => type b',
    held: RELACON_B5_HELD,
    button: 'button2',
    to: [{ key_code: 'b' }],
  }),

  // ── Trackball click (button1) ── double-click => Select All
  {
    description: '[RELACON] Button 1: tap => click+copy, double => Select All',
    manipulators: [
      // Double-click detected — select all (Cmd+A)
      {
        type: 'basic',
        from: { pointing_button: 'button1' },
        to: [
          { key_code: 'escape' },
          { key_code: 'a', modifiers: ['left_command'] },
          { set_variable: { name: 'relacon_copied', value: 0 } },
        ],
        conditions: [
          RELACON_DBLCLICK,
          ...isRelacon,
        ],
      },
      // First click — copy on release only if not already armed
      {
        type: 'basic',
        from: { pointing_button: 'button1' },
        to: [
          { set_variable: { name: 'relacon_dblclick', value: 1 } },
          { pointing_button: 'button1' },
        ],
        to_after_key_up: [
          { key_code: 'c', modifiers: ['left_command'] },
          { set_variable: { name: 'relacon_copied', value: 1 } },
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: 'relacon_dblclick', value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: 'relacon_dblclick', value: 0 } },
          ],
        },
        parameters: { 'basic.to_delayed_action_delay_milliseconds': 300 },
        conditions: [
          { type: 'variable_unless', name: 'relacon_copied', value: 1 },
          ...isRelacon,
        ],
      },
      // First click — already armed, just pass through (no copy)
      {
        type: 'basic',
        from: { pointing_button: 'button1' },
        to: [
          { set_variable: { name: 'relacon_dblclick', value: 1 } },
          { pointing_button: 'button1' },
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: 'relacon_dblclick', value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: 'relacon_dblclick', value: 0 } },
          ],
        },
        parameters: { 'basic.to_delayed_action_delay_milliseconds': 300 },
        conditions: [
          RELACON_COPIED,
          ...isRelacon,
        ],
      },
    ],
  },

  // ── Right trigger (button2) ── double-tap => right-click, hold => modifier, tap-alone => paste if armed
  {
    description: '[RELACON] Right trigger: double-tap right-click/hold modifier/tap paste',
    manipulators: [
      // Double-tap — fire right-click
      {
        type: 'basic',
        from: { pointing_button: 'button2' },
        to: [{ pointing_button: 'button2' }],
        conditions: [
          RELACON_B2_DBLCLICK,
          ...isRelacon,
        ],
      },
      // First press with paste armed — hold sets modifier, release-alone pastes
      // to_if_alone fires on release only if no other button was pressed during hold
      {
        type: 'basic',
        from: { pointing_button: 'button2' },
        to: [
          { set_variable: { name: 'relacon_b2_held', value: 1 } },
          { set_variable: { name: 'relacon_b2_dblclick', value: 1 } },
        ],
        to_if_alone: [
          { key_code: 'v', modifiers: ['left_command'] },
          { set_variable: { name: 'relacon_copied', value: 0 } },
        ],
        to_after_key_up: [
          { set_variable: { name: 'relacon_b2_held', value: 0 } },
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: 'relacon_b2_dblclick', value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: 'relacon_b2_dblclick', value: 0 } },
          ],
        },
        parameters: { 'basic.to_delayed_action_delay_milliseconds': 300 },
        conditions: [
          RELACON_COPIED,
          ...isRelacon,
        ],
      },
      // First press — hold sets modifier, single tap does nothing
      {
        type: 'basic',
        from: { pointing_button: 'button2' },
        to: [
          { set_variable: { name: 'relacon_b2_held', value: 1 } },
          { set_variable: { name: 'relacon_b2_dblclick', value: 1 } },
        ],
        to_after_key_up: [
          { set_variable: { name: 'relacon_b2_held', value: 0 } },
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: 'relacon_b2_dblclick', value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: 'relacon_b2_dblclick', value: 0 } },
          ],
        },
        parameters: { 'basic.to_delayed_action_delay_milliseconds': 300 },
        conditions: [...isRelacon],
      },
    ],
  },

  // ── Middle click / scroll wheel (button3) ── tap => Delete, double/hold => Esc+Esc+SelectAll+Delete
  {
    description: '[RELACON] Middle click: tap => Delete, double/hold => clear all',
    manipulators: [
      // Tap/hold split: tap fires one action (to_if_alone), hold fires another (to_if_held_down).
      // 300ms delay before tap fires, but lets one combo do two things without conflicts.
      // B2 + button3 tap => cycle modes (edit→nav→media→edit), hold => clear all
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to_if_alone: [
          { set_variable: { name: 'relacon_mode', value: 3 } },
          { shell_command: "osascript -e 'display notification \"Media mode\" with title \"Relacon\"'" },
        ],
        to_if_held_down: CLEAR_ALL.map(k => ({ ...k, repeat: false })),
        parameters: {
          'basic.to_if_alone_timeout_milliseconds': 300,
          'basic.to_if_held_down_threshold_milliseconds': 300,
        },
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to_if_alone: [
          { set_variable: { name: 'relacon_mode', value: 1 } },
          { shell_command: "osascript -e 'display notification \"Edit mode\" with title \"Relacon\"'" },
        ],
        to_if_held_down: CLEAR_ALL.map(k => ({ ...k, repeat: false })),
        parameters: {
          'basic.to_if_alone_timeout_milliseconds': 300,
          'basic.to_if_held_down_threshold_milliseconds': 300,
        },
        conditions: [
          RELACON_B2_HELD,
          RELACON_MEDIA_MODE,
          ...isRelacon,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to_if_alone: [
          { set_variable: { name: 'relacon_mode', value: 2 } },
          { shell_command: "osascript -e 'display notification \"Nav mode\" with title \"Relacon\"'" },
        ],
        to_if_held_down: CLEAR_ALL.map(k => ({ ...k, repeat: false })),
        parameters: {
          'basic.to_if_alone_timeout_milliseconds': 300,
          'basic.to_if_held_down_threshold_milliseconds': 300,
        },
        conditions: [
          RELACON_B2_HELD,
          ...isRelacon,
        ],
      },
      // Delete repeats while held; after 2s auto-fires select all + delete
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to: [{ key_code: 'delete_or_backspace' }],
        to_if_held_down: CLEAR_ALL.map(k => ({ ...k, repeat: false })),
        parameters: {
          'basic.to_if_held_down_threshold_milliseconds': 3000,
        },
        conditions: [...isRelacon],
      },
    ],
  },

  // ── Nav mode: B2 + button4 => prev pane (iTerm) / prev tab (editor/browser)
  {
    description: '[RELACON] Nav: B2 + Back => prev pane/tab',
    manipulators: [
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [NAV.terminal.prevPane, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
          ...IS_TERMINAL_WINDOW,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [NAV.editor.prevTab, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
          ...IS_EDITOR_WINDOW,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [NAV.browser.prevTab, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
          ...IS_BROWSER_WINDOW,
        ],
      },
    ],
  },
  // ── Combo: B2 + button4 — tap = Shift+Enter, hold = next pane (iTerm) / next tab (others)
  // Shift+Enter fires immediately; hold 500ms switches pane/tab (stray newline in old pane)
  {
    description: '[RELACON] B2 + Back: tap => Shift+Enter, hold => next pane/tab',
    manipulators: [
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [{ key_code: 'return_or_enter', modifiers: ['left_shift'], repeat: false }, DICTATION_STATE_OFF],
        to_if_held_down: [{ ...NAV.terminal.nextPane, repeat: false }],
        parameters: { 'basic.to_if_held_down_threshold_milliseconds': 500 },
        conditions: [
          RELACON_B2_HELD,
          ...isRelacon,
          ...IS_TERMINAL_WINDOW,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [{ key_code: 'return_or_enter', modifiers: ['left_shift'], repeat: false }, DICTATION_STATE_OFF],
        to_if_held_down: [{ ...NAV.editor.nextTab, repeat: false }],
        parameters: { 'basic.to_if_held_down_threshold_milliseconds': 500 },
        conditions: [
          RELACON_B2_HELD,
          ...isRelacon,
          ...IS_EDITOR_WINDOW,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [{ key_code: 'return_or_enter', modifiers: ['left_shift'], repeat: false }, DICTATION_STATE_OFF],
        to_if_held_down: [{ ...NAV.browser.nextTab, repeat: false }],
        parameters: { 'basic.to_if_held_down_threshold_milliseconds': 500 },
        conditions: [
          RELACON_B2_HELD,
          ...isRelacon,
          ...IS_BROWSER_WINDOW,
        ],
      },
    ],
  },
  // ── Back / left side (button4) ── stop speech-to-text + delayed Enter if STT active
  // to_delayed_action fires Enter after 500ms, giving STT time to paste text
  {
    description: '[RELACON] Back button => stop STT + delayed Enter',
    manipulators: [{
      type: 'basic',
      from: { pointing_button: 'button4' },
      to: [
        ...OPEN_TEXT_TO_SPEECH,
        DICTATION_STATE_OFF,
      ],
      to_delayed_action: {
        to_if_invoked: [{ key_code: 'return_or_enter' }],
        to_if_canceled: [{ key_code: 'return_or_enter' }],
      },
      parameters: { 'basic.to_delayed_action_delay_milliseconds': 500 },
      conditions: [STT_ACTIVE, ...isRelacon],
    }],
  },
  // ── Back / left side (button4) ── tap => Enter, hold => modifier layer
  {
    description: '[RELACON] Back button => Enter / hold modifier',
    manipulators: [{
      type: 'basic',
      from: { pointing_button: 'button4' },
      to: [
        { set_variable: { name: 'relacon_b4_held', value: 1 } },
      ],
      to_if_alone: [{ key_code: 'return_or_enter' }],
      to_after_key_up: [
        { set_variable: { name: 'relacon_b4_held', value: 0 } },
      ],
      parameters: {
        'basic.to_if_alone_timeout_milliseconds': 300,
      },
      conditions: [...isRelacon],
    }],
  },

  // ── Forward / right side (button5) ── speech-to-text toggle
  {
    description: '[RELACON] Forward button => speech-to-text (toggle)',
    manipulators: [
      // Nav mode: button2 held + button5 => next pane (iTerm)
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [NAV.terminal.nextPane, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
          ...IS_TERMINAL_WINDOW,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [NAV.editor.nextTab, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
          ...IS_EDITOR_WINDOW,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [NAV.browser.nextTab, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          RELACON_NAV_MODE,
          ...isRelacon,
          ...IS_BROWSER_WINDOW,
        ],
      },
      // Combo: button2 held + button5 => Tab + Enter
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [{ key_code: 'tab' }, { key_code: 'return_or_enter' }, DICTATION_STATE_OFF],
        conditions: [
          RELACON_B2_HELD,
          ...isRelacon,
        ],
      },
      // Stop STT, then insert trailing space after 500ms delay (gives STT time to paste text)
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [
          ...OPEN_TEXT_TO_SPEECH,
          DICTATION_STATE_OFF,
          { set_variable: { name: 'relacon_copied', value: 0 } },
        ],
        to_delayed_action: {
          to_if_invoked: [{ key_code: 'spacebar' }],
          to_if_canceled: [{ key_code: 'spacebar' }],
        },
        parameters: { 'basic.to_delayed_action_delay_milliseconds': 500 },
        conditions: [
          STT_ACTIVE,
          ...isRelacon,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [
          { set_variable: { name: 'relacon_b5_held', value: 1 } },
        ],
        to_if_alone: [
          ...OPEN_TEXT_TO_SPEECH,
          DICTATION_STATE_ON,
          { set_variable: { name: 'relacon_copied', value: 0 } },
        ],
        to_after_key_up: [
          { set_variable: { name: 'relacon_b5_held', value: 0 } },
        ],
        parameters: {
          'basic.to_if_alone_timeout_milliseconds': 300,
        },
        conditions: [...isRelacon],
      },
    ],
  },

  // ── Nav mode: B2 + D-pad left => open Chrome
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad left => Chrome',
    consumerKey: 'scan_previous_track',
    to: [{ shell_command: "open -a 'Google Chrome.app'" }],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
    ],
  }),

  // ── Nav mode: B2 + D-pad right => open Tower
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad right => Tower',
    consumerKey: 'scan_next_track',
    to: [{ shell_command: "open -a 'Tower.app'" }],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
    ],
  }),

  // ── Nav mode: D-pad left => prev tab (per app)
  mapButton({
    description: '[RELACON] Nav: D-pad left in terminal => prev tab',
    consumerKey: 'scan_previous_track',
    to: [NAV.terminal.prevTab],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_TERMINAL_WINDOW,
    ],
  }),
  mapButton({
    description: '[RELACON] Nav: D-pad left in editor => prev tab',
    consumerKey: 'scan_previous_track',
    to: [NAV.editor.prevTab],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_EDITOR_WINDOW,
    ],
  }),
  mapButton({
    description: '[RELACON] Nav: D-pad left in browser => prev tab',
    consumerKey: 'scan_previous_track',
    to: [NAV.browser.prevTab],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_BROWSER_WINDOW,
    ],
  }),

  // ── Nav mode: B2 + D-pad up => open Cursor
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad up => Cursor',
    consumerKey: 'volume_increment',
    to: [{ shell_command: "open -a 'Cursor.app'" }],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
    ],
  }),

  // ── Nav mode: B2 + D-pad down => open iTerm
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad down => iTerm',
    consumerKey: 'volume_decrement',
    to: [{ shell_command: "open -a 'iTerm.app'" }],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
    ],
  }),

  // ── Nav mode: D-pad up => next window (Cmd+`)
  mapButton({
    description: '[RELACON] Nav: D-pad up => next window',
    consumerKey: 'volume_increment',
    to: [NAV.global.nextWindow],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
    ],
  }),

  // ── Nav mode: D-pad down => prev window (Cmd+Shift+`)
  mapButton({
    description: '[RELACON] Nav: D-pad down => prev window',
    consumerKey: 'volume_decrement',
    to: [NAV.global.prevWindow],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
    ],
  }),

  // ── Nav mode: D-pad right => next tab (per app)
  mapButton({
    description: '[RELACON] Nav: D-pad right in terminal => next tab',
    consumerKey: 'scan_next_track',
    to: [NAV.terminal.nextTab],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_TERMINAL_WINDOW,
    ],
  }),
  mapButton({
    description: '[RELACON] Nav: D-pad right in editor => next tab',
    consumerKey: 'scan_next_track',
    to: [NAV.editor.nextTab],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_EDITOR_WINDOW,
    ],
  }),
  mapButton({
    description: '[RELACON] Nav: D-pad right in browser => next tab',
    consumerKey: 'scan_next_track',
    to: [NAV.browser.nextTab],
    conditions: [
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_BROWSER_WINDOW,
    ],
  }),

  // ── Nav mode: B2 + D-pad center => close tab (per app)
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad center in terminal => close tab',
    consumerKey: 'play_or_pause',
    to: [NAV.terminal.closeTab],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_TERMINAL_WINDOW,
    ],
  }),
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad center in editor => close tab',
    consumerKey: 'play_or_pause',
    to: [NAV.editor.closeTab],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_EDITOR_WINDOW,
    ],
  }),
  mapButton({
    description: '[RELACON] Nav: B2 + D-pad center in browser => close tab',
    consumerKey: 'play_or_pause',
    to: [NAV.browser.closeTab],
    conditions: [
      RELACON_B2_HELD,
      RELACON_NAV_MODE,
      ...isRelacon,
      ...IS_BROWSER_WINDOW,
    ],
  }),

  // ── Edit mode: B2 + d-pad => window/tab/pane navigation (no mode condition, nav mode rules above take priority)
  mapButton({
    description: '[RELACON] B2 + D-pad up => next window',
    consumerKey: 'volume_increment',
    to: [NAV.global.nextWindow],
    conditions: [RELACON_B2_HELD, ...isRelacon],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad down => prev window',
    consumerKey: 'volume_decrement',
    to: [NAV.global.prevWindow],
    conditions: [RELACON_B2_HELD, ...isRelacon],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad left in terminal => prev pane',
    consumerKey: 'scan_previous_track',
    to: [NAV.terminal.prevPane],
    conditions: [RELACON_B2_HELD, ...isRelacon, ...IS_TERMINAL_WINDOW],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad left in editor => prev tab',
    consumerKey: 'scan_previous_track',
    to: [NAV.editor.prevTab],
    conditions: [RELACON_B2_HELD, ...isRelacon, ...IS_EDITOR_WINDOW],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad left in browser => prev tab',
    consumerKey: 'scan_previous_track',
    to: [NAV.browser.prevTab],
    conditions: [RELACON_B2_HELD, ...isRelacon, ...IS_BROWSER_WINDOW],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad right in terminal => next pane',
    consumerKey: 'scan_next_track',
    to: [NAV.terminal.nextPane],
    conditions: [RELACON_B2_HELD, ...isRelacon, ...IS_TERMINAL_WINDOW],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad right in editor => next tab',
    consumerKey: 'scan_next_track',
    to: [NAV.editor.nextTab],
    conditions: [RELACON_B2_HELD, ...isRelacon, ...IS_EDITOR_WINDOW],
  }),
  mapButton({
    description: '[RELACON] B2 + D-pad right in browser => next tab',
    consumerKey: 'scan_next_track',
    to: [NAV.browser.nextTab],
    conditions: [RELACON_B2_HELD, ...isRelacon, ...IS_BROWSER_WINDOW],
  }),

  // ── Edit mode: B2 + center => context menu (placeholder)
  mapButton({
    description: '[RELACON] B2 + Center => context menu',
    consumerKey: 'play_or_pause',
    to: [{ shell_command: "osascript -e 'display notification \"Context menu\" with title \"Relacon\"'" }],
    conditions: [RELACON_B2_HELD, ...isRelacon],
  }),

  // ── Media mode: d-pad passes through native consumer keys
  mapButton({
    description: '[RELACON] Media: D-pad up => volume up',
    consumerKey: 'volume_increment',
    to: [{ consumer_key_code: 'volume_increment' }],
    conditions: [RELACON_MEDIA_MODE, ...isRelacon],
  }),
  mapButton({
    description: '[RELACON] Media: D-pad down => volume down',
    consumerKey: 'volume_decrement',
    to: [{ consumer_key_code: 'volume_decrement' }],
    conditions: [RELACON_MEDIA_MODE, ...isRelacon],
  }),
  mapButton({
    description: '[RELACON] Media: D-pad left => previous track',
    consumerKey: 'scan_previous_track',
    to: [{ consumer_key_code: 'scan_previous_track' }],
    conditions: [RELACON_MEDIA_MODE, ...isRelacon],
  }),
  mapButton({
    description: '[RELACON] Media: D-pad right => next track',
    consumerKey: 'scan_next_track',
    to: [{ consumer_key_code: 'scan_next_track' }],
    conditions: [RELACON_MEDIA_MODE, ...isRelacon],
  }),
  mapButton({
    description: '[RELACON] Media: D-pad center => play/pause',
    consumerKey: 'play_or_pause',
    to: [{ consumer_key_code: 'play_or_pause' }],
    conditions: [RELACON_MEDIA_MODE, ...isRelacon],
  }),

  // ── D-pad left ── tap => Left arrow, hold => open Chrome, double => open Chrome
  doubleClickButton({
    description: '[RELACON] D-pad left: tap => Left, double => Chrome',
    consumerKey: 'scan_previous_track',
    to: [{ shell_command: "open -a 'Google Chrome.app'" }],
    singleTo: [{ key_code: 'left_arrow' }],
    conditions: [...isRelacon],
  }),

  // ── D-pad right ── tap => Right arrow, hold => open Tower, double => open Tower
  doubleClickButton({
    description: '[RELACON] D-pad right: tap => Right, double => Tower',
    consumerKey: 'scan_next_track',
    to: [{ shell_command: "open -a 'Tower.app'" }],
    singleTo: [{ key_code: 'right_arrow' }],
    conditions: [...isRelacon],
  }),

  // ── D-pad up ── tap => Up arrow, hold => open Cursor, double => open Cursor
  doubleClickButton({
    description: '[RELACON] D-pad up: tap => Up, double => Cursor',
    consumerKey: 'volume_increment',
    to: [{ shell_command: "open -a 'Cursor.app'" }],
    singleTo: [{ key_code: 'up_arrow' }],
    conditions: [...isRelacon],
  }),

  // ── D-pad down ── tap => Down arrow, hold => open iTerm, double => open iTerm
  doubleClickButton({
    description: '[RELACON] D-pad down: tap => Down, double => iTerm',
    consumerKey: 'volume_decrement',
    to: [{ shell_command: "open -a 'iTerm.app'" }],
    singleTo: [{ key_code: 'down_arrow' }],
    conditions: [...isRelacon],
  }),

  // ── D-pad center ── tap => Enter, hold => modifier layer
  {
    description: '[RELACON] D-pad center => Enter / hold modifier',
    manipulators: [{
      type: 'basic',
      from: { consumer_key_code: 'play_or_pause' },
      to: [
        { set_variable: { name: 'relacon_center_held', value: 1 } },
      ],
      to_if_alone: [{ key_code: 'return_or_enter' }],
      to_after_key_up: [
        { set_variable: { name: 'relacon_center_held', value: 0 } },
      ],
      parameters: {
        'basic.to_if_alone_timeout_milliseconds': 300,
      },
      conditions: [...isRelacon],
    }],
  },

]

const GlobalMouseButtons = [
  {
    description: '[GLOBAL] Mouse 1 - Open Cursor',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '1',
        },
        ...app('Cursor'),
        // ...app('Visual Studio Code'),
        conditions: [...isMouseButton],
      },
    ],
  },
  {
    description: '[GLOBAL] Mouse 2 - Open Terminal',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '2',
        },
        ...app('iTerm'),
        conditions: [...isMouseButton],
      },
    ],
  },
  {
    description: '[GLOBAL] Mouse 3 - Open Chrome',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '3',
        },
        ...app('Google Chrome'),
        conditions: [...isMouseButton],
      },
    ],
  },
  // Mouse 4: Tap = Text to speech (toggle with shared state), Hold = Command+U (claude voice)
  {
    description: '[GLOBAL] Mouse 4 - Stop STT + trailing space',
    manipulators: [{
      type: 'basic',
      from: { key_code: '4' },
      to_if_alone: [
        ...OPEN_TEXT_TO_SPEECH,
        DICTATION_STATE_OFF,
      ],
      to_delayed_action: {
        to_if_invoked: [{ key_code: 'spacebar' }],
        to_if_canceled: [{ key_code: 'spacebar' }],
      },
      parameters: {
        'basic.to_if_alone_timeout_milliseconds': 300,
        'basic.to_delayed_action_delay_milliseconds': 500,
      },
      conditions: [STT_ACTIVE, ...isMouseButton],
    }],
  },
  {
    description: '[GLOBAL] Mouse 4 - Tap: Start STT, Hold: Claude voice',
    manipulators: [
      {
        type: 'basic',
        from: { key_code: '4' },
        to_if_alone: [
          ...OPEN_TEXT_TO_SPEECH,
          DICTATION_STATE_ON,
        ],
        to_if_held_down: [
          {
            key_code: 'c',
            modifiers: ['left_command', 'left_option', 'left_control'],
          },
        ],
        parameters: {
          'basic.to_if_alone_timeout_milliseconds': 300,
          'basic.to_if_held_down_threshold_milliseconds': 300,
        },
        conditions: [...isMouseButton],
      },
    ],
  },
  {
    description: '[GLOBAL] Mouse 5 - Open Tower',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '5',
        },
        ...app('Tower'),
        conditions: [...isMouseButton],
      },
    ],
  },
  // Add mapping of key 7 here that maps to enter
  {
    description: '[GLOBAL] Mouse 7 - Enter key',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '7',
        },
        to: [
          {
            repeat: false,
            key_code: 'return_or_enter',
          },
        ],
        conditions: [...isMouseButton],
      },
    ],
  },
  // Delete line in terminal
  {
    description: '[iTerm] Mouse 8 - Control + C',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '8',
        },
        to: [
          {
            key_code: 'c',
            modifiers: ['control'],
          },
        ],
        conditions: [...isMouseButton, ...IS_TERMINAL_WINDOW],
      },
    ],
  },
  // Select all and delete
  {
    description: '[GLOBAL] Mouse 8 - Select all and Delete',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '8',
        },
        to: [
          {
            "key_code": "a",
            "modifiers": ["command"]
          },
          {
            "key_code": "c",
            "modifiers": ["command"]
          },
          {
            "key_code": "delete_or_backspace"
          },
        ],
        conditions: [...isMouseButton],
      },
    ],
  },
  {
    description: '[GLOBAL] Mouse 10 - Stop Recording Camtasia',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '0',
        },
        to: [
          {
            repeat: false,
            key_code: '2',
            modifiers: ['left_command'],
          },
        ],
        conditions: [...isMouseButton],
      },
    ],
  },
  {
    description: '[GLOBAL] Mouse 11 - Start Recording Camtasia',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'hyphen',
        },
        to: [
          {
            repeat: false,
            key_code: '1',
            modifiers: ['left_command'],
          },
        ],
        conditions: [...isMouseButton],
      },
    ],
  },
  // Setup mac for recording vide and restore
  {
    description: '[GLOBAL] Mouse 12 - Pre Recording Camtasia',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'equal_sign',
        },
        to: [
          {
            repeat: false,
            key_code: 'h',
            modifiers: ['left_option', 'left_command', 'left_control'],
          },
        ],
        conditions: [...isMouseButton],
      },
    ],
  },
]

const voiceToText = [
  {
    description: 'Double tap command to type x',
    manipulators: [
      {
        type: 'basic',
        from: {
          simultaneous: [
            {
              key_code: 'left_command',
            },
            {
              key_code: 'left_command',
            },
          ],
          simultaneous_options: {
            detect_key_down_unordered: true,
            key_down_order: 'strict',
            key_up_order: 'strict',
            key_up_when: 'any',
          },
        },
        to: [
          {
            key_code: 'x',
          },
        ],
      },
    ],
  },
]

const terminalPreviousCommand = [
  // !
  {
    "key_code": "1",
    "modifiers": ["shift"]
  },
  // !
  {
    "key_code": "1",
    "modifiers": ["shift"],
  },
  // {
  //   "wait_milliseconds": 100
  // },
  {
    "key_code": "return_or_enter",
  },
  {
    "key_code": "return_or_enter",
  },
]

const doubleKeyPressWIP = {
  "description": "Double escape to front arrow",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "escape",
        "modifiers": {
          "optional": ["any"]
        }
      },
      "to": [
        {
          "key_code": "escape"
        }
      ],
      "to_if_alone": [
        {
          "key_code": "escape"
        }
      ],
      "to_if_held_down": [
        {
          "key_code": "escape"
        }
      ],
      "parameters": {
        "basic.to_if_alone_timeout_milliseconds": 250,
        "basic.to_if_double_tap_timeout_milliseconds": 250
      },
      "to_after_key_up": [
        // !
        {
          "key_code": "1",
          "modifiers": ["shift"]
        },
        // !
        {
          "key_code": "1",
          "modifiers": ["shift"],
        },
        // {
        //   "wait_milliseconds": 100
        // },
        {
          "key_code": "return_or_enter",
        },
        {
          "key_code": "return_or_enter",
        },
      ],
      conditions: [
        {
          type: 'frontmost_application_if',
          bundle_identifiers: terminalIds,
        },
      ],
    }
  ]
}

const toStartOfLine = [
  {
    "key_code": "a",
    "modifiers": ["control"]
  }
]

const toEndOfLine = [
  {
    "key_code": "e",
    "modifiers": ["control"]
  }
]

const terminalLineJumpShortCuts = [
  {
    "description": "Page up global",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "up_arrow",
          "modifiers": {
            "mandatory": ["left_option"]
          }
        },
        "to": [
          {
            "key_code": "up_arrow",
            "modifiers": ["left_control", "left_option", "left_command"]
          }
        ],
        conditions: [
          ...IS_TERMINAL_WINDOW,
        ],
      }
    ]
  },
  {
    "description": "Page down global",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "down_arrow",
          "modifiers": {
            "mandatory": ["left_option"]
          }
        },
        "to": [
          {
            "key_code": "down_arrow",
            "modifiers": ["left_control", "left_option", "left_command"]
          },
          /* Scroll down in editor mode */
          // {
          //   "key_code": "f",
          //   "modifiers": ["left_control"]
          // }
        ],
        conditions: [
          ...IS_TERMINAL_WINDOW,
        ],
      }
    ]
  },
  {
    "description": "Page down cmd global",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "down_arrow",
          "modifiers": {
            "mandatory": ["left_command"]
          }
        },
        "to": [
          {
            "key_code": "down_arrow",
            "modifiers": ["left_command"]
          },
          /* Scroll down in editor mode... Causes jump to end of output... fine for now */
          {
            "key_code": "f",
            "modifiers": ["left_control"]
          }
        ],
        conditions: [
          ...IS_TERMINAL_WINDOW,
        ],
      }
    ]
  },
  {
  "description": "Go to start of line",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "z",
        "modifiers": {
          "mandatory": ["command"],
          "optional": ["any"]
        },
      },
      "to": [
        {
          "key_code": "a",
          "modifiers": ["control"]
        }
      ],
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    },
  ],
},
{
  "description": "Go to end of line",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "x",
        "modifiers": {
          "mandatory": ["left_command"],
        },
      },
      "to": toEndOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    },
  ],
},
{
  "description": "Go to start of line left arrow - option",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "left_arrow",
        "modifiers": {
          "mandatory": ["option"],
          "optional": ["any"]
        },
      },
      "to": toStartOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    },
    {
      "type": "basic",
      "from": {
        "key_code": "left_arrow",
        "modifiers": {
          "mandatory": ["left_command"],
        },
      },
      "to": toStartOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    }
  ]
},
{
  "description": "Go to start of line left arrow - control/cmd",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "left_arrow",
        "modifiers": {
          "mandatory": ["control"],
          "optional": ["any"]
        },
      },
      "to": toStartOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    },
    {
      "type": "basic",
      "from": {
        "key_code": "left_arrow",
        "modifiers": {
          "mandatory": ["left_command"],
        },
      },
      "to": toStartOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    }
  ]
},
{
  "description": "Go to end of line right arrow - option",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "right_arrow",
        "modifiers": {
          "mandatory": ["option"],
          "optional": ["any"]
        },
      },
      "to": toEndOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    },
    {
      "type": "basic",
      "from": {
        "key_code": "right_arrow",
        "modifiers": {
          "mandatory": ["left_command"],
        },
      },
      "to": toEndOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    }
  ]
},
{
  "description": "Go to end of line right arrow - control",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "right_arrow",
        "modifiers": {
          "mandatory": ["control"],
          "optional": ["any"]
        },
      },
      "to": toEndOfLine,
      conditions: [
        ...IS_TERMINAL_WINDOW,
      ],
    }
  ]
}
]
  
function mapDoublePress({ 
  title,
  from = 'grave_accent_and_tilde', 
  to,
  conditions = []
}) {
  const _title = title || `Double press ${JSON.stringify(from)} -> ${JSON.stringify(to)}`
  const _from = (typeof from === 'string') ? {
    "key_code": from,
    "modifiers": {
      "optional": [
        "any"
      ]
    }
  } : from
  const fromKeyCode = _from.key_code
  const varName = `${_from.key_code} pressed`

  const ruleConditions = [
    {
      "type": "variable_if",
      "name": varName,
      "value": 1
    }
  ]

  if (conditions.length) {
    ruleConditions.push(...conditions)
  }

  return {
    "description": title,
    "manipulators": [
      {
        "type": "basic",
        "from": _from,
        "to": terminalPreviousCommand,
        "to_after_key_up": [
          {
            "set_variable": {
              "name": varName,
              "value": 0
            }
          }
        ],
        "conditions": ruleConditions
      },
      {
        "type": "basic",
        "parameters": {
          "basic.to_delayed_action_delay_milliseconds": 250
        },
        "from": _from,
        "to": [
          {
            "set_variable": {
              "name": varName,
              "value": 1
            }
          }
        ],
        "to_delayed_action": {
          "to_if_invoked": [
            {
              "set_variable": {
                "name": varName,
                "value": 0
              }
            },
            {
              "key_code": fromKeyCode
            }
          ]
        }
      }
    ]
  }
}

const DoublePressTwo = {
  "description": "Tilde: double tap -> escape, single tap -> tilde",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "grave_accent_and_tilde",
        "modifiers": {
          "optional": [
            "any"
          ]
        }
      },
      "to": terminalPreviousCommand,
      "to_after_key_up": [
        {
          "set_variable": {
            "name": "tilde pressed",
            "value": 0
          }
        }
      ],
      "conditions": [
        {
          "type": "variable_if",
          "name": "tilde pressed",
          "value": 1
        }
      ]
    },
    {
      "type": "basic",
      "parameters": {
        "basic.to_delayed_action_delay_milliseconds": 250
      },
      "from": {
        "key_code": "grave_accent_and_tilde",
        "modifiers": {
          "optional": [
            "any"
          ]
        }
      },
      "to": [
        {
          "set_variable": {
            "name": "tilde pressed",
            "value": 1
          }
        }
      ],
      "to_delayed_action": {
        "to_if_invoked": [
          {
            "set_variable": {
              "name": "tilde pressed",
              "value": 0
            }
          },
          {
            "key_code": "grave_accent_and_tilde"
          }
        ]
      }
    }
  ]
}

const terminalMouseButtons = [
  /* If double tap Q, run previous command */
  // mapDoublePress({
  //   title: 'Double press escape -> Run last command, single press -> escape',
  //   // from: 'grave_accent_and_tilde',
  //   // from: 'left_shift',
  //   from: 'escape',
  //   // from: 'left_command',
  //   //from: 'tab',
  //   // from: {
  //   //   key_code: 'escape',
  //   //   modifiers: ['left_shift'],
  //   // },
  //   to: terminalPreviousCommand,
  //   conditions: IS_TERMINAL_WINDOW
  // }),
  // doubleKeyPressWIP,
  // Toggle back to previous App
  {
    // Must match the global mouse 2 button set to terminal (iTerm)
    description: '[Terminal] - Mouse 2 => PREVIOUS APP',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '2',
        },
        to: toggleBackToPreviousApp,
        conditions: [
          ...isMouseButton,
          ...IS_TERMINAL_WINDOW,
        ],
      },
    ],
  },
  {
    description: '[Terminal] - Mouse 5 => Back Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '5',
        },
        to: [
          {
            repeat: false,
            key_code: 'open_bracket',
            modifiers: ['left_command', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_TERMINAL_WINDOW,
        ],
      },
    ],
  },
  {
    description: '[Terminal] - Mouse 6 => Next Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '6',
        },
        to: [
          {
            repeat: false,
            key_code: 'close_bracket',
            modifiers: ['left_command', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_TERMINAL_WINDOW,
        ],
      },
    ],
  },
]

const terminalNav = [
  {
    description: '[Terminal] - Shift + Left Arrow => Back Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'left_arrow',
          modifiers: {
            mandatory: ['left_shift']
          }
        },
        to: [
          {
            repeat: false,
            key_code: 'open_bracket',
            modifiers: ['left_command', 'left_shift']
          }
        ],
        conditions: [
          ...IS_TERMINAL_WINDOW,
        ]
      }
    ]
  },
  {
    description: '[Terminal] - Shift + Right Arrow => Next Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'right_arrow',
          modifiers: {
            mandatory: ['left_shift']
          }
        },
        to: [
          {
            repeat: false,
            key_code: 'close_bracket',
            modifiers: ['left_command', 'left_shift']
          }
        ],
        conditions: [
          ...IS_TERMINAL_WINDOW,
        ]
      }
    ]
  }
]

const CursorShortcuts = [
  {
    "description": "[Cursor] Add file to chat context",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "z",
          "modifiers": {
            "mandatory": ["left_shift"]
          }
        },
        "to": [
          {
            "key_code": "a",
            "modifiers": ["left_control", "left_shift"]
          }
        ],
        conditions: [
          ...IS_EDITOR_WINDOW,
        ],
      }
    ]
  },
  // resume. @TODO verify this works
  {
    "description": "[Cursor] Resume chat",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "left_shift",
          "modifiers": {
            "optional": ["any"]
          }
        },
        "to": [
          {
            "key_code": "left_shift"
          }
        ],
        "to_if_alone": [
          {
            "key_code": "left_shift",
            "hold_down_milliseconds": 200
          }
        ],
        "to_if_held_down": [
          {
            "key_code": "left_shift"
          }
        ],
        "parameters": {
          "basic.to_if_alone_timeout_milliseconds": 200
        },
        "conditions": [
          {
            "type": "variable_if",
            "name": "left_shift_pressed",
            "value": 1
          },
          ...IS_EDITOR_WINDOW,
        ]
      },
      {
        "type": "basic",
        "from": {
          "key_code": "left_shift",
          "modifiers": {
            "optional": ["any"]
          }
        },
        "to": [
          {
            "set_variable": {
              "name": "left_shift_pressed",
              "value": 1
            }
          },
          {
            "key_code": "left_shift"
          }
        ],
        "to_delayed_action": {
          "to_if_invoked": [
            {
              "set_variable": {
                "name": "left_shift_pressed",
                "value": 0
              }
            }
          ],
          "to_if_canceled": [
            {
              "set_variable": {
                "name": "left_shift_pressed",
                "value": 0
              }
            }
          ]
        }, 
        "to_if_alone": [
          {
            "key_code": "f3",
            "modifiers": ["left_control", "left_shift", "left_option", "left_command"]
          }
        ],
        "parameters": {
          "basic.to_if_alone_timeout_milliseconds": 200,
          "basic.to_delayed_action_delay_milliseconds": 400
        },
        "conditions": [
          {
            "type": "variable_unless",
            "name": "left_shift_pressed",
            "value": 1
          },
          ...IS_EDITOR_WINDOW,
        ]
      }
    ]
  }
]

const CodeEditorMouseButtons = [
  // Toggle back to previous App. Must match the global mouse 1 button set to cursor
  {
    description: '[EDITOR] - Mouse 1 => PREVIOUS APP',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '1',
        },
        to: toggleBackToPreviousApp,
        conditions: [
          ...isMouseButton,
          ...IS_EDITOR_WINDOW,
        ],
      },
    ],
  },
  {
    description: '[EDITOR] - Mouse 5 => Back Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '5',
        },
        to: [
          { ...NAV.editor.prevTab, repeat: false },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_EDITOR_WINDOW,
        ],
      },
    ],
  },
  {
    description: '[EDITOR] - Mouse 6 => Next Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '6',
        },
        to: [
          { ...NAV.editor.nextTab, repeat: false },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_EDITOR_WINDOW,
        ],
      },
    ],
  },
  // Auto gen docs but not working
  // {
  //   description: '[EDITOR] - Mouse 4 => Copilot Doc selection',
  //   manipulators: [
  //     {
  //       type: 'basic',
  //       from: {
  //         key_code: '4',
  //       },
  //       to: [
  //         {
  //           repeat: false,
  //           key_code: 'd',
  //           modifiers: ['left_command', 'left_option', 'left_shift'],
  //         },
  //       ],
  //       conditions: [
  //         ...isMouseButton,
  //         ...IS_EDITOR_WINDOW,
  //       ],
  //     },
  //   ],
  // },
  // {
  //   description: '[EDITOR] - Mouse 7 => Copilot Explain selection',
  //   manipulators: [
  //     {
  //       type: 'basic',
  //       from: {
  //         key_code: '7',
  //       },
  //       to: [
  //         {
  //           repeat: false,
  //           key_code: 't',
  //           modifiers: ['left_command', 'left_option', 'left_shift'],
  //         },
  //       ],
  //       conditions: [
  //         ...isMouseButton,
  //         ...IS_EDITOR_WINDOW,
  //       ],
  //     },
  //   ],
  // },
  // {
  //   description: '[EDITOR] - Mouse 8 => Copilot Explain selection',
  //   manipulators: [
  //     {
  //       type: 'basic',
  //       from: {
  //         key_code: '8',
  //       },
  //       to: [
  //         {
  //           repeat: false,
  //           key_code: 'e',
  //           modifiers: ['left_command', 'left_option', 'left_shift'],
  //         },
  //       ],
  //       conditions: [
  //         ...isMouseButton,
  //         ...IS_EDITOR_WINDOW,
  //       ],
  //     },
  //   ],
  // },
  {
    description: '[EDITOR] - Mouse 9 => MD preview',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '9',
        },
        to: [
          {
            repeat: false,
            key_code: 'm',
            modifiers: ['left_command', 'left_option', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_EDITOR_WINDOW,
        ],
      },
    ],
  },
]

const CodeEditorNav = [
  {
    description: '[EDITOR] - Shift + Left Arrow => Back Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'left_arrow',
          modifiers: {
            mandatory: ['left_shift']
          }
        },
        to: [
          { ...NAV.editor.prevTab, repeat: false }
        ],
        conditions: [
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds
          }
        ]
      }
    ]
  },
  {
    description: '[EDITOR] - Shift + Right Arrow => Next Tab',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'right_arrow',
          modifiers: {
            mandatory: ['left_shift']
          }
        },
        to: [
          { ...NAV.editor.nextTab, repeat: false }
        ],
        conditions: [
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds
          }
        ]
      }
    ]
  }
]


const BrowserMouseButtons = [
  // Toggle back to previous App
  {
    description: '[BROWSER] - Mouse 3 => PREVIOUS APP',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '3',
        },
        to: toggleBackToPreviousApp,
        conditions: [
          ...isMouseButton,
          ...IS_BROWSER_WINDOW,
        ],
      },
    ],
  },
  // {
  //   "description": "[BROWSER] - Mouse 1 => Back",
  //   "manipulators": [
  //     {
  //       "type": "basic",
  //       "from": {
  //           "key_code": "1"
  //       },
  //       "to": [
  //           {
  //               "repeat": false,
  //               "key_code": "open_bracket",
  //               "modifiers": [
  //                   "left_command"
  //               ]
  //           }
  //       ],
  //       "conditions": [
  //           ...isMouseButton,
  //           {
  //             "type": "frontmost_application_if",
  //             "bundle_identifiers": browserIds
  //           }
  //       ]
  //     }
  //   ]
  // },
  // {
  //     "description": "[BROWSER] - Mouse 4 => Forward",
  //     "manipulators": [
  //         {
  //             "type": "basic",
  //             "from": {
  //               "key_code": "4"
  //             },
  //             "to": [
  //                 {
  //                     "repeat": false,
  //                     "key_code": "close_bracket",
  //                     "modifiers": [
  //                         "left_command"
  //                     ]
  //                 }
  //             ],
  //             "conditions": [
  //                 ...isMouseButton,
  //                 {
  //                   "type": "frontmost_application_if",
  //                   "bundle_identifiers": browserIds
  //                 }
  //             ]
  //         }
  //     ]
  // },
  {
    description: '[BROWSER] - Mouse 5 => Tab Left',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '5',
        },
        to: [
          { ...NAV.browser.prevTab, repeat: false },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_BROWSER_WINDOW,
        ],
      },
    ],
  },
  {
    description: '[BROWSER] - Mouse 6 => Tab Right',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '6',
        },
        to: [
          { ...NAV.browser.nextTab, repeat: false },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_BROWSER_WINDOW,
        ],
      },
    ],
  },
  // Requires vimuim https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb?hl=en
  {
    description: '[BROWSER] - Mouse 9 => Tab Toggle',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '9',
        },
        to: [
          {
            repeat: false,
            key_code: '6',
            modifiers: ['left_shift'],
          },
        ],
        conditions: [
          ...isMouseButton,
          ...IS_BROWSER_WINDOW,
        ],
      },
    ],
  },
  // {
  //   description: '[BROWSER] - Mouse 8 => Tab CLOSE',
  //   manipulators: [
  //     {
  //       type: 'basic',
  //       from: {
  //         key_code: '8',
  //       },
  //       to: [
  //         {
  //           repeat: false,
  //           key_code: 'w',
  //           modifiers: ['left_command'],
  //         },
  //       ],
  //       conditions: [
  //         ...isMouseButton,
  //         {
  //           type: 'frontmost_application_if',
  //           bundle_identifiers: browserIds,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //     "description": "[BROWSER] - Mouse 12 => Tab ReOPEN",
  //     "manipulators": [
  //         {
  //             "type": "basic",
  //             "from": {
  //               "key_code": "equal_sign" // 12
  //             },
  //             "to": [
  //                 {
  //                     "repeat": false,
  //                     "key_code": "t",
  //                     "modifiers": [
  //                         "left_command",
  //                         "left_shift",
  //                     ]
  //                 }
  //             ],
  //             "conditions": [
  //                 ...isMouseButton,
  //                 {
  //                   "type": "frontmost_application_if",
  //                   "bundle_identifiers": browserIds
  //                 }
  //             ]
  //         }
  //     ]
  // },
]

const BrowserNav = [
  {
    description: '[BROWSER] - Shift + Right Arrow => Tab Right',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'right_arrow',
          modifiers: {
            mandatory: ['left_shift']
          }
        },
        to: [
          {
            repeat: false,
            key_code: 'tab',
            modifiers: ['left_control']
          }
        ],
        conditions: [
          {
            type: 'frontmost_application_if',
            bundle_identifiers: browserIds
          }
        ]
      }
    ]
  },
  {
    description: '[BROWSER] - Shift + Left Arrow => Tab Left',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: 'left_arrow',
          modifiers: {
            mandatory: ['left_shift']
          }
        },
        to: [
          {
            repeat: false,
            key_code: 'tab',
            modifiers: ['left_control', 'left_shift']
          }
        ],
        conditions: [
          {
            type: 'frontmost_application_if',
            bundle_identifiers: browserIds
          }
        ]
      }
    ]
  }
]

const camtasiaIds = ['^com\\.techsmith\\.camtasia2023$']
const CamtasiaMouseButtons = [
  {
    description: '[CAMTASIA] Mouse 7 => Cut tracks',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '7',
        },
        to: [
          {
            repeat: false,
            key_code: 't',
            modifiers: ['left_command', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseButton,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: camtasiaIds,
          },
        ],
      },
    ],
  },
  {
    description: '[CAMTASIA] Mouse 8 => Ripple delete',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '8',
        },
        to: [
          {
            repeat: false,
            key_code: 'delete_or_backspace',
            modifiers: ['left_command'],
          },
        ],
        conditions: [
          ...isMouseButton,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: camtasiaIds,
          },
        ],
      },
    ],
  },
]

// Driven by rectangle.app
const WINDOW_FULL = {
  description: 'Window: Full Screen',
  to: [
    {
      key_code: 'm',
      modifiers: ['right_option', 'right_command'],
    },
  ],
}

const WINDOW_BOTTOM_HALF = {
  description: 'Window: Bottom half',
  to: [
    {
      key_code: 'down_arrow',
      modifiers: ['left_option', 'left_control'],
    },
  ],
}

const WINDOW_LEFT_HALF = {
  description: 'Window: Left half',
  to: [
    {
      key_code: 'left_arrow',
      modifiers: ['left_option', 'left_control'],
    },
  ],
}

const WINDOW_RIGHT = {
  description: 'Window: Right half',
  to: [
    {
      key_code: 'right_arrow',
      modifiers: ['left_option', 'left_control'],
    },
  ],
}

const MOVE_WINDOW_RIGHT = {
  description: 'Window: Move Right',
  to: MOVE_WINDOW_TO_NEXT_DISPLAY,
}

const MOVE_WINDOW_LEFT = {
  description: 'Window: Move Left',
  to: [
    {
      key_code: 'left_arrow',
      modifiers: ['left_option', 'left_control', 'left_command'],
    },
  ],
}

// STT toggle with shared state — stop adds trailing space after 500ms delay
const SPEECH_TO_TEXT = [
  {
    description: 'Stop speech-to-text + trailing space',
    to: [
      ...OPEN_TEXT_TO_SPEECH,
      DICTATION_STATE_OFF,
    ],
    to_delayed_action: {
      to_if_invoked: [{ key_code: 'spacebar' }],
      to_if_canceled: [{ key_code: 'spacebar' }],
    },
    parameters: { 'basic.to_delayed_action_delay_milliseconds': 500 },
    conditions: [STT_ACTIVE],
  },
  {
    description: 'Start speech-to-text',
    to: [
      ...OPEN_TEXT_TO_SPEECH,
      DICTATION_STATE_ON,
    ],
  },
]

const IS_MOUSE = {
  conditions: [...isMouseButton],
}

const hyperLayerKeys = {
  1: {
    type: 'basic',
    from: {
      key_code: '1',
    },
    ...app('Cursor'),
  },
  /* Remap hyper key + single key */
  3: {
    ...WINDOW_FULL,
    ...IS_MOUSE,
  },
  up_arrow: {
    ...WINDOW_FULL,
  },
  down_arrow: {
    ...WINDOW_BOTTOM_HALF,
  },
  right_arrow: {
    ...WINDOW_RIGHT,
  },
  left_arrow: {
    ...WINDOW_LEFT_HALF,
  },
  s: {
    ...MOVE_WINDOW_RIGHT,
  },
  e: {
    ...WINDOW_FULL,
  },
  d: {
    ...MOVE_WINDOW_RIGHT,
  },
  x: {
    ...WINDOW_LEFT_HALF,
  },
  c: {
    description: 'Window: Right half',
    to: [
      {
        key_code: 'right_arrow',
        modifiers: ['left_option', 'left_control'],
      },
    ],
  },
  right_shift: {
    ...MOVE_WINDOW_RIGHT,
  },
  slash: {
    ...MOVE_WINDOW_LEFT,
  },
  /* Remap o = "Open" applications */
  o: {
    1: app('1Password'),
    g: app('Google Chrome'),
    c: app('Google Chrome'),
    v: app('Visual Studio Code'),
    d: app('Discord'),
    s: app('Slack'),
    e: app('Superhuman'),
    n: app('Notion'),
    t: app('Warp'),
    z: app('zoom.us'),
    f: app('Finder'),
    r: app('Telegram'),
    // "i"Message
    i: app('Messages'),
    p: app('Spotify'),
    w: open('https://web.whatsapp.com'),
  },
  /* Shortcut window management via rectangle.app */
  // a: {
  //   description: 'Window: Move to left display',
  //   to: [
  //     {
  //       key_code: 'left_arrow',
  //       modifiers: ['left_option', 'left_command', 'left_control'],
  //     },
  //   ],
  // },

  a: SPEECH_TO_TEXT,
  w: {
    description: 'Global Jump to windows via script kit',
    to: [
      {
        key_code: 'f',
        modifiers: ['left_option'],
      },
    ],
  },
  'tab': {
    description: 'Global Jump to windows via script kit',
    to: [
      {
        key_code: 'f',
        modifiers: ['left_option'],
      },
    ],
  },
  7: {
    to: [
      {
        key_code: 'up_arrow',
      },
    ],
  },
  f1: {
    description: 'Trigger Dark-mode',
      to: [
      {
        key_code: '8',
        modifiers: ['left_command', 'left_option', 'left_control'],
      },
    ],
  },
  // q: {
  //   description: 'Trigger Claude shortcut',
  //   to: [
  //     {
  //       key_code: 'c',
  //       modifiers: ['left_command', 'left_option', 'left_control'],
  //     },
  //   ],
  // },
  left_command: {
    description: 'Trigger Voice Option + Space',
    to: [
      {
        key_code: 'u',
        modifiers: ['left_command'],
      },
    ],
  },
  z: {
    description: 'Trigger Enter',
    to: [
      {
        key_code: 'return_or_enter',
      },
    ],
  },
  // w = "Window" via rectangle.app
  // a: {
  //   semicolon: {
  //     description: "Window: Hide",
  //     to: [
  //       {
  //         key_code: "h",
  //         modifiers: ["right_command"],
  //       },
  //     ],
  //   },
  //   y: {
  //     description: "Window: First Third",
  //     to: [
  //       {
  //         key_code: "left_arrow",
  //         modifiers: ["right_option", "right_control"],
  //       },
  //     ],
  //   },
  //   k: {
  //     description: "Window: Top Half",
  //     to: [
  //       {
  //         key_code: "up_arrow",
  //         modifiers: ["right_option", "right_command"],
  //       },
  //     ],
  //   },
  //   j: {
  //     description: "Window: Bottom Half",
  //     to: [
  //       {
  //         key_code: "down_arrow",
  //         modifiers: ["right_option", "right_command"],
  //       },
  //     ],
  //   },
  //   o: {
  //     description: "Window: Last Third",
  //     to: [
  //       {
  //         key_code: "right_arrow",
  //         modifiers: ["right_option", "right_control"],
  //       },
  //     ],
  //   },
  //   h: {
  //     description: "Window: Left Half",
  //     to: [
  //       {
  //         key_code: "left_arrow",
  //         modifiers: ["right_option", "right_command"],
  //       },
  //     ],
  //   },
  //   l: {
  //     description: "Window: Right Half",
  //     to: [
  //       {
  //         key_code: "right_arrow",
  //         modifiers: ["right_option", "right_command"],
  //       },
  //     ],
  //   },
  //   s: WINDOW_FULL,
  //   u: {
  //     description: "Window: Previous Tab",
  //     to: [
  //       {
  //         key_code: "tab",
  //         modifiers: ["right_control", "right_shift"],
  //       },
  //     ],
  //   },
  //   i: {
  //     description: "Window: Next Tab",
  //     to: [
  //       {
  //         key_code: "tab",
  //         modifiers: ["right_control"],
  //       },
  //     ],
  //   },
  //   n: {
  //     description: "Window: Next Window",
  //     to: [
  //       {
  //         key_code: "grave_accent_and_tilde",
  //         modifiers: ["right_command"],
  //       },
  //     ],
  //   },
  //   b: {
  //     description: "Window: Back",
  //     to: [
  //       {
  //         key_code: "open_bracket",
  //         modifiers: ["right_command"],
  //       },
  //     ],
  //   },
  //   // Note: No literal connection. Both f and n are already taken.
  //   m: {
  //     description: "Window: Forward",
  //     to: [
  //       {
  //         key_code: "close_bracket",
  //         modifiers: ["right_command"],
  //       },
  //     ],
  //   },
  //   d: {
  //     description: "Window: Next display",
  //     to: [
  //       {
  //         key_code: "right_arrow",
  //         modifiers: ["right_control", "right_option", "right_command"],
  //       },
  //     ],
  //   },
  // },

  // z = "System"
  // z: {
  //   u: {
  //     to: [
  //       {
  //         key_code: 'volume_increment',
  //       },
  //     ],
  //   },
  //   j: {
  //     to: [
  //       {
  //         key_code: 'volume_decrement',
  //       },
  //     ],
  //   },
  //   i: {
  //     to: [
  //       {
  //         key_code: 'display_brightness_increment',
  //       },
  //     ],
  //   },
  //   k: {
  //     to: [
  //       {
  //         key_code: 'display_brightness_decrement',
  //       },
  //     ],
  //   },
  //   l: {
  //     to: [
  //       {
  //         key_code: 'q',
  //         modifiers: ['right_control', 'right_command'],
  //       },
  //     ],
  //   },
  //   p: {
  //     to: [
  //       {
  //         key_code: 'play_or_pause',
  //       },
  //     ],
  //   },
  //   semicolon: {
  //     to: [
  //       {
  //         key_code: 'fastforward',
  //       },
  //     ],
  //   },
  //   e: {
  //     to: [
  //       {
  //         // Emoji picker
  //         key_code: 'spacebar',
  //         modifiers: ['right_control', 'right_command'],
  //       },
  //     ],
  //   },
  //   // Turn on Elgato KeyLight
  //   y: {
  //     to: [
  //       {
  //         shell_command: `curl -H 'Content-Type: application/json' --request PUT --data '{ "numberOfLights": 1, "lights": [ { "on": 1, "brightness": 100, "temperature": 215 } ] }' http://192.168.8.84:9123/elgato/lights`,
  //       },
  //     ],
  //   },
  //   h: {
  //     to: [
  //       {
  //         shell_command: `curl -H 'Content-Type: application/json' --request PUT --data '{ "numberOfLights": 1, "lights": [ { "on": 0, "brightness": 100, "temperature": 215 } ] }' http://192.168.8.84:9123/elgato/lights`,
  //       },
  //     ],
  //   },
  // },

  // v = "moVe" which isn't "m" because we want it to be on the left hand
  v: {
    h: {
      to: [{ key_code: 'left_arrow' }],
    },
    j: {
      to: [{ key_code: 'down_arrow' }],
    },
    k: {
      to: [{ key_code: 'up_arrow' }],
    },
    l: {
      to: [{ key_code: 'right_arrow' }],
    },
    // Magicmove via homerow.app
    m: {
      to: [{ key_code: 'f', modifiers: ['right_control'] }],
    },
    // Scroll mode via homerow.app
    s: {
      to: [{ key_code: 'j', modifiers: ['right_control'] }],
    },
    d: {
      to: [{ key_code: 'd', modifiers: ['right_shift', 'right_command'] }],
    },
    u: {
      to: [{ key_code: 'page_down' }],
    },
    i: {
      to: [{ key_code: 'page_up' }],
    },
  },

  // c = Musi*c* which isn't "m" because we want it to be on the left hand
  // c: {
  //   p: {
  //     to: [{ key_code: 'play_or_pause' }],
  //   },
  //   n: {
  //     to: [{ key_code: 'fastforward' }],
  //   },
  //   b: {
  //     to: [{ key_code: 'rewind' }],
  //   },
  // },

  // r = "Raycast"
  r: {
    l: open('raycast://extensions/stellate/mxstbr-commands/create-mxs-is-shortlink'),
    e: open('raycast://extensions/raycast/emoji-symbols/search-emoji-symbols'),
    c: open('raycast://extensions/raycast/system/open-camera'),
    p: open('raycast://extensions/raycast/raycast/confetti'),
    a: open('raycast://extensions/raycast/raycast-ai/ai-chat'),
    s: open('raycast://extensions/peduarte/silent-mention/index'),
    h: open('raycast://extensions/raycast/clipboard-history/clipboard-history'),
    1: open('raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-1'),
    2: open('raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-2'),
  },
}

function makeHyperKey(from = 'caps_lock') {
  return {
    description: 'Hyper Key (⌃⌥⇧⌘)',
    manipulators: [
      {
        type: 'basic',
        description: 'Caps Lock -> Hyper Key',
        from: {
          key_code: from,
        },
        // 'to' is onHold caps lock
        to: [
          {
            key_code: 'left_shift',
            modifiers: ['left_command', 'left_control', 'left_option'],
          },
        ],
        // IF hyperkey tapped alone then run shift + escape
        to_if_alone: [
          {
            key_code: 'escape',
            modifiers: ['left_shift'],
          },
        ],
        "parameters": {
          "basic.to_if_alone_timeout_milliseconds": 250,
          "basic.to_delayed_action_delay_milliseconds": 500
        },
      },
      //      {
      //        type: "basic",
      //        description: "Disable CMD + Tab to force Hyper Key usage",
      //        from: {
      //          key_code: "tab",
      //          modifiers: {
      //            mandatory: ["left_command"],
      //          },
      //        },
      //        to: [
      //          {
      //            key_code: "tab",
      //          },
      //        ],
      //      },
    ],
  }
}

function makeRightHyperKey(from = 'right_command') {
  return {
    description: 'Right Hyper Key (⌃⌥⇧⌘)',
    manipulators: [
      {
        type: 'basic',
        description: 'Right Command -> Right Hyper Key',
        from: {
          key_code: from,
        },
        to: [
          {
            key_code: 'right_shift',
            modifiers: ['right_command', 'right_control', 'right_option'],
          },
        ],
        to_if_alone: [
          {
            key_code: 'escape',
            modifiers: ['right_shift'],
          },
        ],
        "parameters": {
          "basic.to_if_alone_timeout_milliseconds": 250,
          "basic.to_delayed_action_delay_milliseconds": 500
        },
      },
    ],
  }
}

const deleteTerminalLine = [
  {
    "description": "Left Cmd + Delete → Ctrl+U (delete terminal line)",
    "manipulators": [
      {
        "from": {
          "key_code": "delete_or_backspace",
          "modifiers": {
            "mandatory": ["left_command"]
          }
        },
        "to": [
          {
            "key_code": "u",
            "modifiers": ["control"]
          }
        ],
        "type": "basic",
        "conditions": [
          ...IS_TERMINAL_WINDOW,
        ]
      },
        {
      "from": {
        "key_code": "escape",
        "modifiers": {
          "mandatory": ["command"]
        }
      },
      "to": [
        {
          "key_code": "u",
          "modifiers": ["control"]
        }
      ],
      "type": "basic",
      "conditions": [
        ...IS_TERMINAL_WINDOW,
      ]
    }
    ]
  },
  
]

const HIT_ENTER = {
  to: [
    {
      key_code: 'return_or_enter',
    },
  ],
}

// Generates double-tap modifier key rules that fire `to` keys on second press
function doubleTap({
  description,
  to,
  conditions,
  keys = ['left_option', 'left_command'],
}: {
  description: string
  to: object[]
  conditions: object[]
  keys?: string[]
}) {
  return keys.map((key) => ({
    description: `${description} (${key})`,
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: key,
          modifiers: { optional: ['any'] },
        },
        to,
        conditions: [
          { type: 'variable_if', name: `${key}_pressed`, value: 1 },
          ...conditions,
        ],
      },
      {
        type: 'basic',
        from: {
          key_code: key,
          modifiers: { optional: ['any'] },
        },
        to: [
          { set_variable: { name: `${key}_pressed`, value: 1 } },
          { key_code: key },
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: `${key}_pressed`, value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: `${key}_pressed`, value: 0 } },
          ],
        },
        parameters: {
          'basic.to_delayed_action_delay_milliseconds': 250,
        },
        conditions: [...conditions],
      },
    ],
  }))
}

const COPY_LOCATION_KEYS = [
  {
    key_code: 'backslash',
    modifiers: ['left_control', 'left_option', 'left_shift', 'left_command'],
  },
]

const copyLocationShortcut = doubleTap({
  description: '[EDITOR] Double-tap => Copy file:line location',
  to: COPY_LOCATION_KEYS,
  conditions: IS_EDITOR_WINDOW,
})

const chromeDoubleTapShortcut = doubleTap({
  description: '[CHROME] Double-tap => ⌘+Option+N',
  to: [{ key_code: 'n', modifiers: ['left_command', 'left_option'] }],
  conditions: IS_CHROME_WINDOW,
})

let rules: KarabinerRules[] = [
  // Define the Hyper key itself
  makeHyperKey('caps_lock'),
  makeRightHyperKey('right_command'),
  // @ts-ignore
  // ...autoQuotes,
  // ...ejectToScreenShot,
  ...ejectKeyToDelete,
  // ...doubleShiftToEnter,
  ...deleteTerminalLine,
  // ...voiceToText,
  ...BrowserMouseButtons,
  ...BrowserNav,
  ...CodeEditorMouseButtons,
  ...CodeEditorNav,
  ...chromeDoubleTapShortcut,
  ...copyLocationShortcut,
  ...terminalMouseButtons,
  ...terminalNav,
  ...terminalLineJumpShortCuts,
  ...CursorShortcuts,
  // Clear STT state when Escape is pressed on keyboard
  {
    description: '[GLOBAL] Escape clears STT state',
    manipulators: [{
      type: 'basic',
      from: { key_code: 'escape' },
      to: [{ key_code: 'escape' }, DICTATION_STATE_OFF],
      conditions: [STT_ACTIVE],
    }],
  },
  // Make sure to load app specific config before global buttons
  ...RelaconButtons,
  ...GlobalMouseButtons,
  ...CamtasiaMouseButtons,
  /* Sub layers */
  ...createHyperSubLayers(hyperLayerKeys),
  /* Right Hyper Sub layers */
  ...createRightHyperSubLayers({
    comma: SPEECH_TO_TEXT,
    period: SPEECH_TO_TEXT,
    right_option: SPEECH_TO_TEXT,
    spacebar: HIT_ENTER,
    slash: HIT_ENTER,
    // left_shift: HIT_ENTER,
    // To enter
  }),
]

const DEBUG = false
if (DEBUG) {
  rules = []
} 

// Karabiner reads from ~/.config/karabiner, dotfiles copy is our repo version
const karabinerLive = path.join(os.homedir(), '.config', 'karabiner', 'karabiner.json')

// Read existing config to preserve devices, fn_function_keys, etc.
const existingConfig = JSON.parse(fs.readFileSync('karabiner.json', 'utf-8'))

// Update only the rules, preserve everything else
existingConfig.profiles[0].complex_modifications.rules = rules

const output = JSON.stringify(existingConfig, null, 4)
fs.writeFileSync('karabiner.json', output)
fs.writeFileSync(karabinerLive, output)

console.log('\nHyper Layer Keys and Descriptions:')
const tableData = Object.entries(hyperLayerKeys)
  .filter(([_, value]) => value.description)
  .map(([key, value]) => ({
    Key: key,
    Description: value.description
  }))
console.table(tableData)

// Standard Karabiner key codes
const standardKeys = [
  // Letters
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  // Numbers
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // Symbols
  'grave_accent_and_tilde', 'hyphen', 'equal_sign', 'open_bracket', 'close_bracket',
  'backslash', 'semicolon', 'quote', 'comma', 'period', 'slash',
  // Function keys
  'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
  // Navigation
  'return_or_enter', 'tab', 'spacebar', 'delete_or_backspace', 'delete_forward',
  'left_arrow', 'right_arrow', 'up_arrow', 'down_arrow', 'page_up', 'page_down',
  'home', 'end',
  // Modifiers
  'left_control', 'left_shift', 'left_option', 'left_command',
  'right_control', 'right_shift', 'right_option', 'right_command',
  // Media keys
  'volume_up', 'volume_down', 'mute', 'play_or_pause', 'fastforward', 'rewind',
  // Other
  'caps_lock', 'escape', 'eject'
]

console.log('\nAvailable Keys Not Used in Hyper Layer:')
const usedKeys = Object.keys(hyperLayerKeys)
const availableKeys = standardKeys
  .filter(key => !usedKeys.includes(key))
  .sort()
console.log(availableKeys.sort())

// Generate Relacon button map HTML and JSON for docs
const relaconRows = RelaconMap.map(b =>
  `  <tr><td>${b.name}</td><td><code>${b.event}</code></td><td>${b.tap}</td><td>${b.doubleTap}</td><td>${b.hold}</td><td>${b.b2Combo}</td></tr>`
).join('\n')

const relaconHtml = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<title>ELECOM Relacon Button Map</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f5f5f5; }
  code { background: #eee; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
  h1 { margin-bottom: 0.5rem; }
</style>
</head><body>
<h1>ELECOM Relacon Button Map</h1>
<table>
  <tr><th>Button</th><th>Event</th><th>Tap</th><th>Double Tap</th><th>Hold</th><th>B2 Combo</th></tr>
${relaconRows}
</table>
</body></html>`

if (!fs.existsSync('docs')) fs.mkdirSync('docs')
fs.writeFileSync('docs/relacon-map.html', relaconHtml)
fs.writeFileSync('docs/relacon-map.json', JSON.stringify({
  buttons: RelaconMap,
  modifiers: RelaconModifiers,
  modes: RelaconModes,
}, null, 2))
