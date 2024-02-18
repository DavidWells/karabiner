import fs from "fs";
import { KarabinerRules } from "./types";
import { createHyperSubLayers, app, open } from "./utils";

const autoQuotes = [
{
  "description": "(1/2) Do not auto close brackets & quotes when holding fn",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "9",
        "modifiers": {
          "mandatory": [
            "fn",
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "9",
          "modifiers": [
            "shift"
          ]
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "quote",
        "modifiers": {
          "mandatory": [
            "fn"
          ]
        }
      },
      "to": [
        {
          "key_code": "quote"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "quote",
        "modifiers": {
          "mandatory": [
            "fn",
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "quote",
          "modifiers": [
            "shift"
          ]
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "grave_accent_and_tilde",
        "modifiers": {
          "mandatory": [
            "fn"
          ]
        }
      },
      "to": [
        {
          "key_code": "grave_accent_and_tilde"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "open_bracket",
        "modifiers": {
          "mandatory": [
            "fn"
          ]
        }
      },
      "to": [
        {
          "key_code": "open_bracket"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "open_bracket",
        "modifiers": {
          "mandatory": [
            "fn",
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "open_bracket",
          "modifiers": [
            "shift"
          ]
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "open_bracket",
        "modifiers": {
          "mandatory": [
            "fn",
            "option"
          ]
        }
      },
      "to": [
        {
          "key_code": "open_bracket",
          "modifiers": [
            "option"
          ]
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "close_bracket",
        "modifiers": {
          "mandatory": [
            "fn",
            "option"
          ]
        }
      },
      "to": [
        {
          "key_code": "close_bracket",
          "modifiers": [
            "option"
          ]
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "comma",
        "modifiers": {
          "mandatory": [
            "fn",
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "comma",
          "modifiers": [
            "shift"
          ]
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    }
  ]
},
{
  "description": "(2/2) Auto close brackets & quotes ( (), '', \"\", ``, [], {}, ââ, ââ, <> )",
  "manipulators": [
    {
      "type": "basic",
      "from": {
        "key_code": "9",
        "modifiers": {
          "mandatory": [
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "9",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "0",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "quote"
      },
      "to": [
        {
          "key_code": "quote"
        },
        {
          "key_code": "quote"
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "quote",
        "modifiers": {
          "mandatory": [
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "quote",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "quote",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "grave_accent_and_tilde"
      },
      "to": [
        {
          "key_code": "grave_accent_and_tilde"
        },
        {
          "key_code": "grave_accent_and_tilde"
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "open_bracket"
      },
      "to": [
        {
          "key_code": "open_bracket"
        },
        {
          "key_code": "close_bracket"
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "open_bracket",
        "modifiers": {
          "mandatory": [
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "open_bracket",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "close_bracket",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "open_bracket",
        "modifiers": {
          "mandatory": [
            "option"
          ]
        }
      },
      "to": [
        {
          "key_code": "open_bracket",
          "modifiers": [
            "option"
          ]
        },
        {
          "key_code": "open_bracket",
          "modifiers": [
            "option",
            "shift"
          ]
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "close_bracket",
        "modifiers": {
          "mandatory": [
            "option"
          ]
        }
      },
      "to": [
        {
          "key_code": "close_bracket",
          "modifiers": [
            "option"
          ]
        },
        {
          "key_code": "close_bracket",
          "modifiers": [
            "option",
            "shift"
          ]
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    },
    {
      "type": "basic",
      "from": {
        "key_code": "comma",
        "modifiers": {
          "mandatory": [
            "shift"
          ]
        }
      },
      "to": [
        {
          "key_code": "comma",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "period",
          "modifiers": [
            "shift"
          ]
        },
        {
          "key_code": "left_arrow"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_unless",
          "bundle_identifiers": [
            "com.github.atom",
            "com.googlecode.iterm2",
            "com.jetbrains.pycharm",
            "com.microsoft.VSCode",
            "com.visualstudio.code.oss"
          ]
        }
      ]
    }
  ]
}
]

const ejectToScreenShot = [
  {
    "description": "Eject to Screenshot",
    "manipulators": [
      {
        "from": {
          "consumer_key_code": "eject"
        },
        "to": [
          {
            "key_code": "5",
            "modifiers": [
              "left_command",
              "left_shift"
            ]
          }
        ],
        "type": "basic"
      }
    ]
  }
]

const isMouseNumber = [{
  "type": "device_if",
  "identifiers": [
    {
      "product_id": 103,
      "vendor_id": 5426
    }
  ]
}]

const GlobalMouseButtons = [
  {
    "description": "[GLOBAL] Mouse 2 - Open Iterm",
    "manipulators": [
      {
        "type": "basic",
        "from": {
            "key_code": "2"
        },
        ...app("iTerm"),
        "conditions": [
          ...isMouseNumber,
        ]
      }
    ]
  },
  {
    "description": "[GLOBAL] Mouse 3 - Open VSCode",
    "manipulators": [
      {
        "type": "basic",
        "from": {
            "key_code": "3"
        },
        ...app("Visual Studio Code"),
        "conditions": [
          ...isMouseNumber,
        ]
      }
    ]
  },
  {
    "description": "[GLOBAL] Mouse 6 - Open Chrome",
    "manipulators": [
      {
        "type": "basic",
        "from": {
            "key_code": "6"
        },
        ...app("Google Chrome"),
        "conditions": [
          ...isMouseNumber,
        ]
      }
    ]
  },
  {
    "description": "[GLOBAL] Mouse 10 - Stop Recording Camtasia",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "0"
        },
        "to": [
            {
                "repeat": false,
                "key_code": "2",
                "modifiers": [
                  "left_command",
                  "left_option",
                ]
            }
        ],
        "conditions": [
          ...isMouseNumber,
        ]
      }
    ]
  },
  {
    "description": "[GLOBAL] Mouse 11 - Start Recording Camtasia",
    "manipulators": [
      {
        "type": "basic",
        "from": {
          "key_code": "hyphen"
        },
        "to": [
            {
                "repeat": false,
                "key_code": "2",
                "modifiers": [
                  "left_command",
                  "left_shift"
                ]
            }
        ],
        "conditions": [
          ...isMouseNumber,
        ]
      }
    ]
  },
]

const browserIds = [
  "^com\\.apple\\.Safari$",
  "^com\\.google\\.Chrome$"
]
const BrowserMouseButtons = [
    {
      "description": "[BROWSER] - Mouse 4 => Back",
      "manipulators": [
        {
          "type": "basic",
          "from": {
              "key_code": "4"
          },
          "to": [
              {
                  "repeat": false,
                  "key_code": "open_bracket",
                  "modifiers": [
                      "left_command"
                  ]
              }
          ],
          "conditions": [
              ...isMouseNumber,
              {
                "type": "frontmost_application_if",
                "bundle_identifiers": browserIds
              }
          ]
        }
      ]
    },
    { 
        "description": "[BROWSER] - Mouse 5 => Forward",
        "manipulators": [
            {
                "type": "basic",
                "from": {
                  "key_code": "5"
                },
                "to": [
                    {
                        "repeat": false,
                        "key_code": "close_bracket",
                        "modifiers": [
                            "left_command"
                        ]
                    }
                ],
                "conditions": [
                    ...isMouseNumber,
                    {
                      "type": "frontmost_application_if",
                      "bundle_identifiers": browserIds
                    }
                ]
            }
        ]
    }
]

const camtasiaIds = [
  "^com\\.techsmith\\.camtasia2023$",
]
const CamtasiaMouseButtons = [
    { 
        "description": "[CAMTASIA] Mouse 7 => Cut tracks",
        "manipulators": [
            {
                "type": "basic",
                "from": {
                  "key_code": "7"
                },
                "to": [
                    {
                        "repeat": false,
                        "key_code": "t",
                        "modifiers": [
                            "left_command",
                            "left_shift"
                        ]
                    }
                ],
                "conditions": [
                    ...isMouseNumber,
                    {
                        "type": "frontmost_application_if",
                        "bundle_identifiers": camtasiaIds
                    }
                ]
            }
        ]
    },
    { 
        "description": "[CAMTASIA] Mouse 8 => Ripple delete",
        "manipulators": [
            {
                "type": "basic",
                "from": {
                  "key_code": "8"
                },
                "to": [
                    {
                        "repeat": false,
                        "key_code": "delete_or_backspace",
                        "modifiers": [
                            "left_command",
                        ]
                    }
                ],
                "conditions": [
                    ...isMouseNumber,
                    {
                        "type": "frontmost_application_if",
                        "bundle_identifiers": camtasiaIds
                    }
                ]
            }
        ]
    }
]



const rules: KarabinerRules[] = [
  // Define the Hyper key itself
  {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key",
        from: {
          key_code: "caps_lock",
        },
        to: [
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_control", "left_option"],
          },
        ],
        to_if_alone: [
          {
            key_code: "escape",
          },
        ],
        type: "basic",
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
  ...autoQuotes,
  ...ejectToScreenShot,
  ...GlobalMouseButtons,
  ...BrowserMouseButtons,
  ...CamtasiaMouseButtons,
  /* Sub layers */
  ...createHyperSubLayers({
    /* Remap hyper key + single key */
    7: {
      "to": [
        {
          "key_code": "up_arrow"
        }
      ],
    },
    /* Remap o = "Open" applications */
    o: {
      1: app("1Password"),
      g: app("Google Chrome"),
      c: app("Google Chrome"),
      v: app("Visual Studio Code"),
      d: app("Discord"),
      s: app("Slack"),
      e: app("Superhuman"),
      n: app("Notion"),
      t: app("Warp"),
      // Open todo list managed via *H*ypersonic
      h: open(
        "notion://www.notion.so/stellatehq/7b33b924746647499d906c55f89d5026"
      ),
      z: app("zoom.us"),
      m: app("Mochi"),
      f: app("Finder"),
      r: app("Telegram"),
      // "i"Message
      i: app("Messages"),
      p: app("Spotify"),
      a: app("iA Presenter"),
      w: open("https://web.whatsapp.com"),
      l: open(
        "raycast://extensions/stellate/mxstbr-commands/open-mxs-is-shortlink"
      ),
    },

    // w = "Window" via rectangle.app
    w: {
      semicolon: {
        description: "Window: Hide",
        to: [
          {
            key_code: "h",
            modifiers: ["right_command"],
          },
        ],
      },
      y: {
        description: "Window: First Third",
        to: [
          {
            key_code: "left_arrow",
            modifiers: ["right_option", "right_control"],
          },
        ],
      },
      k: {
        description: "Window: Top Half",
        to: [
          {
            key_code: "up_arrow",
            modifiers: ["right_option", "right_command"],
          },
        ],
      },
      j: {
        description: "Window: Bottom Half",
        to: [
          {
            key_code: "down_arrow",
            modifiers: ["right_option", "right_command"],
          },
        ],
      },
      o: {
        description: "Window: Last Third",
        to: [
          {
            key_code: "right_arrow",
            modifiers: ["right_option", "right_control"],
          },
        ],
      },
      h: {
        description: "Window: Left Half",
        to: [
          {
            key_code: "left_arrow",
            modifiers: ["right_option", "right_command"],
          },
        ],
      },
      l: {
        description: "Window: Right Half",
        to: [
          {
            key_code: "right_arrow",
            modifiers: ["right_option", "right_command"],
          },
        ],
      },
      f: {
        description: "Window: Full Screen",
        to: [
          {
            key_code: "f",
            modifiers: ["right_option", "right_command"],
          },
        ],
      },
      u: {
        description: "Window: Previous Tab",
        to: [
          {
            key_code: "tab",
            modifiers: ["right_control", "right_shift"],
          },
        ],
      },
      i: {
        description: "Window: Next Tab",
        to: [
          {
            key_code: "tab",
            modifiers: ["right_control"],
          },
        ],
      },
      n: {
        description: "Window: Next Window",
        to: [
          {
            key_code: "grave_accent_and_tilde",
            modifiers: ["right_command"],
          },
        ],
      },
      b: {
        description: "Window: Back",
        to: [
          {
            key_code: "open_bracket",
            modifiers: ["right_command"],
          },
        ],
      },
      // Note: No literal connection. Both f and n are already taken.
      m: {
        description: "Window: Forward",
        to: [
          {
            key_code: "close_bracket",
            modifiers: ["right_command"],
          },
        ],
      },
      d: {
        description: "Window: Next display",
        to: [
          {
            key_code: "right_arrow",
            modifiers: ["right_control", "right_option", "right_command"],
          },
        ],
      },
    },

    // s = "System"
    s: {
      u: {
        to: [
          {
            key_code: "volume_increment",
          },
        ],
      },
      j: {
        to: [
          {
            key_code: "volume_decrement",
          },
        ],
      },
      i: {
        to: [
          {
            key_code: "display_brightness_increment",
          },
        ],
      },
      k: {
        to: [
          {
            key_code: "display_brightness_decrement",
          },
        ],
      },
      l: {
        to: [
          {
            key_code: "q",
            modifiers: ["right_control", "right_command"],
          },
        ],
      },
      p: {
        to: [
          {
            key_code: "play_or_pause",
          },
        ],
      },
      semicolon: {
        to: [
          {
            key_code: "fastforward",
          },
        ],
      },
      e: {
        to: [
          {
            // Emoji picker
            key_code: "spacebar",
            modifiers: ["right_control", "right_command"],
          },
        ],
      },
      // Turn on Elgato KeyLight
      y: {
        to: [
          {
            shell_command: `curl -H 'Content-Type: application/json' --request PUT --data '{ "numberOfLights": 1, "lights": [ { "on": 1, "brightness": 100, "temperature": 215 } ] }' http://192.168.8.84:9123/elgato/lights`,
          },
        ],
      },
      h: {
        to: [
          {
            shell_command: `curl -H 'Content-Type: application/json' --request PUT --data '{ "numberOfLights": 1, "lights": [ { "on": 0, "brightness": 100, "temperature": 215 } ] }' http://192.168.8.84:9123/elgato/lights`,
          },
        ],
      },
    },

    // v = "moVe" which isn't "m" because we want it to be on the left hand
    // so that hjkl work like they do in vim
    v: {
      h: {
        to: [{ key_code: "left_arrow" }],
      },
      j: {
        to: [{ key_code: "down_arrow" }],
      },
      k: {
        to: [{ key_code: "up_arrow" }],
      },
      l: {
        to: [{ key_code: "right_arrow" }],
      },
      // Magicmove via homerow.app
      m: {
        to: [{ key_code: "f", modifiers: ["right_control"] }],
      },
      // Scroll mode via homerow.app
      s: {
        to: [{ key_code: "j", modifiers: ["right_control"] }],
      },
      d: {
        to: [{ key_code: "d", modifiers: ["right_shift", "right_command"] }],
      },
      u: {
        to: [{ key_code: "page_down" }],
      },
      i: {
        to: [{ key_code: "page_up" }],
      },
    },

    // c = Musi*c* which isn't "m" because we want it to be on the left hand
    c: {
      p: {
        to: [{ key_code: "play_or_pause" }],
      },
      n: {
        to: [{ key_code: "fastforward" }],
      },
      b: {
        to: [{ key_code: "rewind" }],
      },
    },

    // r = "Raycast"
    r: {
      l: open(
        "raycast://extensions/stellate/mxstbr-commands/create-mxs-is-shortlink"
      ),
      e: open(
        "raycast://extensions/raycast/emoji-symbols/search-emoji-symbols"
      ),
      c: open("raycast://extensions/raycast/system/open-camera"),
      p: open("raycast://extensions/raycast/raycast/confetti"),
      a: open("raycast://extensions/raycast/raycast-ai/ai-chat"),
      s: open("raycast://extensions/peduarte/silent-mention/index"),
      h: open(
        "raycast://extensions/raycast/clipboard-history/clipboard-history"
      ),
      1: open(
        "raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-1"
      ),
      2: open(
        "raycast://extensions/VladCuciureanu/toothpick/connect-favorite-device-2"
      ),
    },
  }),
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: "Default",
          complex_modifications: {
            rules,
          },
        },
      ],
    },
    null,
    2
  )
);
