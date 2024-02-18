const textEditorIds = [
  "^com\\.microsoft\\.VSCode$",
  "^com\\.sublimetext\\.4$",
  "^com\\.github\\.atom$",
  "^com\\.googlecode\\.iterm2$",
  "^com\\.jetbrains\\.pycharm$",
  "^com\\.visualstudio\\.code\\.oss$"
]

/**
 * Represents an array of objects that define the autoQuotes rules.
 */
export const autoQuotes = [
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
          "type": "frontmost_application_if", // "frontmost_application_unless" if NOT editor
          "bundle_identifiers": textEditorIds
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
          ],
        }
      },
      "to": [
        {
          "key_code": "quote"
        }
      ],
      "conditions": [
        {
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
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
          "type": "frontmost_application_if",
          "bundle_identifiers": textEditorIds
        }
      ]
    }
  ]
}
]
