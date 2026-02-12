// @ts-nocheck
import fs from 'fs'
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

// Super whisper
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

const CLEAR_ALL = [
  { key_code: 'escape' },
  { key_code: 'escape' },
  { key_code: 'a', modifiers: ['left_command'] },
  { key_code: 'delete_or_backspace' },
]

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
const RelaconButtons = [
  // ── Trackball click (button1) ── double-click => SuperWhisper + whisper mode
  {
    description: '[RELACON] Button 1 whisper mode',
    manipulators: [
      // Whisper mode active — click fires SuperWhisper and exits mode
      {
        type: 'basic',
        from: { pointing_button: 'button1' },
        to: [
          ...OPEN_TEXT_TO_SPEECH,
          { set_variable: { name: 'relacon_whisper', value: 0 } },
        ],
        conditions: [
          { type: 'variable_if', name: 'relacon_whisper', value: 1 },
          ...isRelacon,
        ],
      },
      // Double-click detected — fire SuperWhisper and enter whisper mode
      {
        type: 'basic',
        from: { pointing_button: 'button1' },
        to: [
          ...OPEN_TEXT_TO_SPEECH,
          { set_variable: { name: 'relacon_whisper', value: 1 } },
        ],
        conditions: [
          { type: 'variable_if', name: 'relacon_dblclick', value: 1 },
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
          { type: 'variable_if', name: 'relacon_copied', value: 1 },
          ...isRelacon,
        ],
      },
    ],
  },

  // ── Right trigger (button2) ── paste mode => paste + reset, otherwise passthrough
  // TODO: double-tap is a candidate for mode switcher — set a variable to remap other buttons contextually
  {
    description: '[RELACON] Left trigger: paste mode => Cmd+V, otherwise click',
    manipulators: [
      {
        type: 'basic',
        from: { pointing_button: 'button2' },
        to: [
          { key_code: 'v', modifiers: ['left_command'] },
          { set_variable: { name: 'relacon_copied', value: 0 } },
        ],
        conditions: [
          { type: 'variable_if', name: 'relacon_copied', value: 1 },
          ...isRelacon,
        ],
      },
      // Hold sets modifier variable for combos with other buttons
      {
        type: 'basic',
        from: { pointing_button: 'button2' },
        to: [
          { set_variable: { name: 'relacon_b2_held', value: 1 } },
        ],
        to_if_alone: [{ pointing_button: 'button2' }],
        to_after_key_up: [
          { set_variable: { name: 'relacon_b2_held', value: 0 } },
        ],
        conditions: [...isRelacon],
      },
    ],
  },

  // ── Middle click / scroll wheel (button3) ── tap => Delete, double/hold => Esc+Esc+SelectAll+Delete
  {
    description: '[RELACON] Middle click: tap => Delete, double/hold => clear all',
    manipulators: [
      // Combo: button2 held + button3 => clear prompt (Esc + Esc)
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to: [{ key_code: 'escape' }, { key_code: 'escape' }],
        conditions: [
          { type: 'variable_if', name: 'relacon_b2_held', value: 1 },
          ...isRelacon,
        ],
      },
      // Double-click — Esc + Esc + Select All + Delete
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to: CLEAR_ALL,
        conditions: [
          { type: 'variable_if', name: 'double_click_button3', value: 1 },
          ...isRelacon,
        ],
      },
      // First click — tap => Delete, hold => Cmd+A + Delete
      {
        type: 'basic',
        from: { pointing_button: 'button3' },
        to_if_alone: [
          { key_code: 'delete_or_backspace' },
        ],
        to_if_held_down: CLEAR_ALL.map(k => ({ ...k, repeat: false })),
        to: [
          { set_variable: { name: 'double_click_button3', value: 1 } },
        ],
        to_delayed_action: {
          to_if_invoked: [
            { set_variable: { name: 'double_click_button3', value: 0 } },
          ],
          to_if_canceled: [
            { set_variable: { name: 'double_click_button3', value: 0 } },
          ],
        },
        parameters: {
          'basic.to_delayed_action_delay_milliseconds': 300,
          'basic.to_if_alone_timeout_milliseconds': 300,
          'basic.to_if_held_down_threshold_milliseconds': 300,
        },
        conditions: [...isRelacon],
      },
    ],
  },

  // ── Combo: button2 held + button4 => Shift+Enter
  {
    description: '[RELACON] Right trigger + Back => Shift+Enter',
    manipulators: [
      {
        type: 'basic',
        from: { pointing_button: 'button4' },
        to: [{ key_code: 'return_or_enter', modifiers: ['left_shift'] }],
        conditions: [
          { type: 'variable_if', name: 'relacon_b2_held', value: 1 },
          ...isRelacon,
        ],
      },
    ],
  },
  // ── Back / left side (button4) ── tap => Enter
  mapButton({
    description: '[RELACON] Back button => Enter',
    button: 'button4',
    to: [{ key_code: 'return_or_enter' }],
    conditions: [...isRelacon],
  }),

  // ── Forward / right side (button5) ── SuperWhisper toggle (arm/disarm whisper mode)
  {
    description: '[RELACON] Forward button => SuperWhisper (toggle whisper mode)',
    manipulators: [
      // Combo: button2 held + button5 => Tab + Enter
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [{ key_code: 'tab' }, { key_code: 'return_or_enter' }],
        conditions: [
          { type: 'variable_if', name: 'relacon_b2_held', value: 1 },
          ...isRelacon,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [
          ...OPEN_TEXT_TO_SPEECH,
          { set_variable: { name: 'relacon_whisper', value: 0 } },
        ],
        conditions: [
          { type: 'variable_if', name: 'relacon_whisper', value: 1 },
          ...isRelacon,
        ],
      },
      {
        type: 'basic',
        from: { pointing_button: 'button5' },
        to: [
          ...OPEN_TEXT_TO_SPEECH,
          { set_variable: { name: 'relacon_whisper', value: 1 } },
        ],
        conditions: [...isRelacon],
      },
    ],
  },

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

  // ── D-pad center ── Enter
  mapButton({
    description: '[RELACON] D-pad center => Enter',
    consumerKey: 'play_or_pause',
    to: [{ key_code: 'return_or_enter' }],
    conditions: [...isRelacon],
  }),
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
  // Mouse 4: Tap = Text to speech, Hold = Command+U (claude voice)
  {
    description: '[GLOBAL] Mouse 4 - Tap: Text to speech, Hold: Claude voice',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '4',
        },
        to_if_alone: OPEN_TEXT_TO_SPEECH,
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
          {
            repeat: false,
            key_code: 'left_arrow',
            modifiers: ['left_command', 'left_option'],
          },
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
          {
            repeat: false,
            key_code: 'right_arrow',
            modifiers: ['left_command', 'left_option'],
          },
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
          {
            repeat: false,
            key_code: 'left_arrow',
            modifiers: ['left_command', 'left_option']
          }
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
          {
            repeat: false,
            key_code: 'right_arrow',
            modifiers: ['left_command', 'left_option']
          }
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
          {
            repeat: false,
            key_code: 'tab',
            modifiers: ['left_control', 'left_shift'],
          },
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
          {
            repeat: false,
            key_code: 'tab',
            modifiers: ['left_control'],
          },
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
  to: [
    {
      key_code: 'right_arrow',
      modifiers: ['left_option', 'left_control', 'left_command'],
    },
  ],
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

const SUPER_WHISPER = {
  description: 'Trigger Option + Space. Superwhisper',
  to: OPEN_TEXT_TO_SPEECH,
}

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
    description: 'Window: Move to right display',
    to: [
      {
        key_code: 'right_arrow',
        modifiers: ['left_option', 'left_command', 'left_control'],
      },
    ],
  },
  e: {
    ...WINDOW_FULL,
  },
  d: {
    description: 'Window: Move to right display',
    to: [
      {
        key_code: 'right_arrow',
        modifiers: ['left_option', 'left_command', 'left_control'],
      },
    ],
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

  a: SUPER_WHISPER,
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
  // Make sure to load app specific config before global buttons
  ...RelaconButtons,
  ...GlobalMouseButtons,
  ...CamtasiaMouseButtons,
  /* Sub layers */
  ...createHyperSubLayers(hyperLayerKeys),
  /* Right Hyper Sub layers */
  ...createRightHyperSubLayers({
    comma: SUPER_WHISPER,
    period: SUPER_WHISPER,
    right_option: SUPER_WHISPER,
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

// Read existing config to preserve devices, fn_function_keys, etc.
const existingConfig = JSON.parse(fs.readFileSync('karabiner.json', 'utf-8'))

// Update only the rules, preserve everything else
existingConfig.profiles[0].complex_modifications.rules = rules

fs.writeFileSync(
  'karabiner.json',
  JSON.stringify(existingConfig, null, 4),
)

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
