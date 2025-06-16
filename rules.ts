// @ts-nocheck
import fs from 'fs'
import { KarabinerRules } from './types'
import { createHyperSubLayers, app, open } from './utils'
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

const terminalIds = ['^com\\.googlecode\\.iterm2$']

// Super whisper
const OPEN_TEXT_TO_SPEECH = [
  {
    key_code: 'spacebar',
    modifiers: ['left_option'],
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

const ejectToDelete = [
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

/* Razer mouse */
const isMouseNumber = [
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
        conditions: [...isMouseNumber],
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
        conditions: [...isMouseNumber],
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
        conditions: [...isMouseNumber],
      },
    ],
  },
    {
    description: '[GLOBAL] Mouse 4 - Open Text to speech',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '4',
        },
        to: OPEN_TEXT_TO_SPEECH,
        // ...app('Asana'),

        conditions: [...isMouseNumber],
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
        conditions: [...isMouseNumber],
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
        conditions: [...isMouseNumber],
      },
    ],
  },
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
          }
        ],
        conditions: [...isMouseNumber],
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
            modifiers: ['left_command', 'left_option'],
          },
        ],
        conditions: [...isMouseNumber],
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
            key_code: '2',
            modifiers: ['left_command', 'left_shift'],
          },
        ],
        conditions: [...isMouseNumber],
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
        conditions: [...isMouseNumber],
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds,
          },
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds,
          },
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds,
          },
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
        {
          type: 'frontmost_application_if',
          bundle_identifiers: terminalIds,
        },
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
          "mandatory": ["command"],
          "optional": ["any"]
        },
      },
      "to": [
        {
          "key_code": "e",
          "modifiers": ["control"]
        }
      ],
      conditions: [
        {
          type: 'frontmost_application_if',
          bundle_identifiers: terminalIds,
        },
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
      "to": [
        {
          "key_code": "a",
          "modifiers": ["control"]
        }
      ],
      conditions: [
        {
          type: 'frontmost_application_if',
          bundle_identifiers: terminalIds,
        },
      ],
    }
  ]
},
{
  "description": "Go to start of line left arrow - control",
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
      "to": [
        {
          "key_code": "a",
          "modifiers": ["control"]
        }
      ],
      conditions: [
        {
          type: 'frontmost_application_if',
          bundle_identifiers: terminalIds,
        },
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
      "to": [
        {
          "key_code": "e",
          "modifiers": ["control"]
        }
      ],
      conditions: [
        {
          type: 'frontmost_application_if',
          bundle_identifiers: terminalIds,
        },
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
      "to": [
        {
          "key_code": "e",
          "modifiers": ["control"]
        }
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
]

const IS_TERMINAL_WINDOW = [
  {
    type: 'frontmost_application_if',
    bundle_identifiers: terminalIds,
  },
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
    description: '[Terminal] - Mouse 2 => PREVIOUS APP',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '2',
        },
        to: toggleBackToPreviousApp,
        conditions: [
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds,
          },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds,
          },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds,
          },
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds
          }
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: terminalIds
          }
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
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
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
        ]
      }
    ]
  }
]

const CodeEditorMouseButtons = [
  // Toggle back to previous App
  {
    description: '[EDITOR] - Mouse 3 => PREVIOUS APP',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '3',
        },
        to: toggleBackToPreviousApp,
        conditions: [
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
        ],
      },
    ],
  },
  {
    description: '[EDITOR] - Mouse 4 => Copilot Doc selection',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '4',
        },
        to: [
          {
            repeat: false,
            key_code: 'd',
            modifiers: ['left_command', 'left_option', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
        ],
      },
    ],
  },
  {
    description: '[EDITOR] - Mouse 7 => Copilot Explain selection',
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
            modifiers: ['left_command', 'left_option', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
        ],
      },
    ],
  },
  {
    description: '[EDITOR] - Mouse 8 => Copilot Explain selection',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '8',
        },
        to: [
          {
            repeat: false,
            key_code: 'e',
            modifiers: ['left_command', 'left_option', 'left_shift'],
          },
        ],
        conditions: [
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
        ],
      },
    ],
  },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: editorIds,
          },
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

const browserIds = [
  '^com\\.apple\\.Safari$',
  '^com\\.google\\.Chrome$',
  '^com\\.google\\.Chrome\\.canary$',
  '^com\\.opera\\.Opera$',
  '^com\\.brave\\.Browser$',
]
const BrowserMouseButtons = [
  // Toggle back to previous App
  {
    description: '[BROWSER] - Mouse 1 => PREVIOUS APP',
    manipulators: [
      {
        type: 'basic',
        from: {
          key_code: '1',
        },
        to: toggleBackToPreviousApp,
        conditions: [
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: browserIds,
          },
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
  //           ...isMouseNumber,
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
  //                 ...isMouseNumber,
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: browserIds,
          },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: browserIds,
          },
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
          ...isMouseNumber,
          {
            type: 'frontmost_application_if',
            bundle_identifiers: browserIds,
          },
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
  //         ...isMouseNumber,
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
  //                 ...isMouseNumber,
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
          ...isMouseNumber,
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
          ...isMouseNumber,
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

const WINDOW_LEFT = {
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

const IS_MOUSE = {
  conditions: [...isMouseNumber],
}

const rules: KarabinerRules[] = [
  // Define the Hyper key itself
  {
    description: 'Hyper Key (⌃⌥⇧⌘)',
    manipulators: [
      {
        description: 'Caps Lock -> Hyper Key',
        from: {
          key_code: 'caps_lock',
        },
        // 'to' is onHold caps lock
        to: [
          {
            key_code: 'left_shift',
            modifiers: ['left_command', 'left_control', 'left_option'],
          },
        ],
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
        type: 'basic',
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
  },
  // @ts-ignore
  // ...autoQuotes,
  // ...ejectToScreenShot,
  ...ejectToDelete,
  // ...voiceToText,
  ...BrowserMouseButtons,
  ...BrowserNav,
  ...CodeEditorMouseButtons,
  ...CodeEditorNav,
  ...terminalMouseButtons,
  ...terminalNav,
  ...terminalLineJumpShortCuts,
  ...CursorShortcuts,
  // Make sure to load app specific config before global buttons
  ...GlobalMouseButtons,
  ...CamtasiaMouseButtons,
  /* Sub layers */
  ...createHyperSubLayers({
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
      ...WINDOW_LEFT,
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

    a: {
      description: 'Trigger Option + Space. Superwhisper',
      to: OPEN_TEXT_TO_SPEECH,
    },
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
    d: {
      description: 'Trigger Dark-mode',
        to: [
        {
          key_code: '8',
          modifiers: ['left_command', 'left_option', 'left_control'],
        },
      ],
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
    q: {
      description: 'Trigger Claude shortcut',
      to: [
        {
          key_code: 'u',
          modifiers: ['left_command'],
        },
      ],
    },
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
    c: {
      p: {
        to: [{ key_code: 'play_or_pause' }],
      },
      n: {
        to: [{ key_code: 'fastforward' }],
      },
      b: {
        to: [{ key_code: 'rewind' }],
      },
    },

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
  }),
]

fs.writeFileSync(
  'karabiner.json',
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: 'Default',
          complex_modifications: {
            rules,
          },
        },
      ],
    },
    null,
    2,
  ),
)
