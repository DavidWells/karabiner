// @ts-nocheck
import { To, KeyCode, Manipulator, KarabinerRules } from "./types";

/**
 * Custom way to describe a command in a layer
 */
export interface LayerCommand {
  to: To[];
  description?: string;
}

type HyperKeySublayer = {
  // The ? is necessary, otherwise we'd have to define something for _every_ key code
  [key_code in KeyCode]?: LayerCommand;
};

/**
 * Create a Hyper Key sublayer, where every command is prefixed with a key
 * e.g. Hyper + O ("Open") is the "open applications" layer, I can press
 * e.g. Hyper + O + G ("Google Chrome") to open Chrome
 */
export function createHyperSubLayer(
  sublayer_key: KeyCode,
  commands: HyperKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Hyper + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
    {
      description: `Toggle Hyper sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          mandatory: [
            "left_command",
            "left_control",
            "left_shift",
            "left_option",
          ],
        },
      },
      to_after_key_up: [
        {
          set_variable: {
            name: subLayerVariableName,
            // The default value of a variable is 0: https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/variable/
            // That means by using 0 and 1 we can filter for "0" in the conditions below and it'll work on startup
            value: 0,
          },
        },
      ],
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
      ],
      // This enables us to press other sublayer keys in the current sublayer
      // (e.g. Hyper + O > M even though Hyper + M is also a sublayer)
      // basically, only trigger a sublayer if no other sublayer is active
      conditions: allSubLayerVariables
        .filter((subLayerVariable) => subLayerVariable !== subLayerVariableName)
        .map((subLayerVariable) => ({
          type: "variable_if",
          name: subLayerVariable,
          value: 0,
        })),
    },
    // Define the individual commands that are meant to trigger in the sublayer
    // Supports arrays for conditional entries (first match wins)
    ...(Object.keys(commands) as (keyof typeof commands)[]).flatMap(
      (command_key) => {
        const cmd = commands[command_key]
        const entries = Array.isArray(cmd) ? cmd : [cmd]
        const sublayerCondition = {
          type: "variable_if" as const,
          name: subLayerVariableName,
          value: 1,
        }
        return entries.map((entry): Manipulator => ({
          ...entry,
          type: "basic" as const,
          from: {
            key_code: command_key,
            modifiers: {
              mandatory: ["any"],
            },
          },
          conditions: [sublayerCondition, ...(entry.conditions || [])],
        }))
      }
    ),
  ];
}

/**
 * Create all hyper sublayers. This needs to be a single function, as well need to
 * have all the hyper variable names in order to filter them and make sure only one
 * activates at a time
 */
export function createHyperSubLayers(subLayers: {
  [key_code in KeyCode]?: HyperKeySublayer | LayerCommand;
}): KarabinerRules[] {
  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  // console.log('subLayers', subLayers)
  return Object.entries(subLayers).map(([key, value]) => {
    console.log('───────────────────────────────')
    console.log('key', key)
    console.log('value', value)
    // Direct key mapping (not a sublayer) — supports arrays for conditional entries
    if ("to" in value || Array.isArray(value)) {
      const entries = Array.isArray(value) ? value : [value]
      const hyperFrom = {
        key_code: key as KeyCode,
        modifiers: {
          mandatory: [
            "left_command" as const,
            "left_control" as const,
            "left_shift" as const,
            "left_option" as const,
          ],
        },
      }
      return {
        description: `Hyper Key + ${key}`,
        manipulators: entries.map((entry) => ({
          ...entry,
          type: "basic" as const,
          from: hyperFrom,
          ...(entry.conditions ? { conditions: entry.conditions } : {}),
        })),
      }
    }

    return {
      description: `Hyper Key sublayer "${key}"`,
      manipulators: createHyperSubLayer(
        key as KeyCode,
        value,
        allSubLayerVariables
      ),
    }

  });
}

function generateSubLayerVariableName(key: KeyCode) {
  return `hyper_sublayer_${key}`;
}

/**
 * Shortcut for "open" shell command
 */
export function open(what: string): LayerCommand {
  return {
    to: [
      {
        shell_command: `open ${what}`,
      },
    ],
    description: `Open ${what}`,
  };
}


/**
 * Shortcut for "Open an app" command (of which there are a bunch)
 * @param {string} name - The name of the application.
 * @returns A LayerCommand object representing the command to open the application.
 */
export function app(name: string): LayerCommand {
  return open(`-a '${name}.app'`);
}

export function createRightHyperSubLayer(
  sublayer_key: KeyCode,
  commands: HyperKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Right Hyper + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
    {
      description: `Toggle Right Hyper sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          mandatory: [
            "right_command",
            "right_control",
            "right_shift",
            "right_option",
          ],
        },
      },
      to_after_key_up: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 0,
          },
        },
      ],
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
      ],
      conditions: allSubLayerVariables
        .filter((subLayerVariable) => subLayerVariable !== subLayerVariableName)
        .map((subLayerVariable) => ({
          type: "variable_if",
          name: subLayerVariable,
          value: 0,
        })),
    },
    // Define the individual commands that are meant to trigger in the sublayer
    // Supports arrays for conditional entries (first match wins)
    ...(Object.keys(commands) as (keyof typeof commands)[]).flatMap(
      (command_key) => {
        const cmd = commands[command_key]
        const entries = Array.isArray(cmd) ? cmd : [cmd]
        const sublayerCondition = {
          type: "variable_if" as const,
          name: subLayerVariableName,
          value: 1,
        }
        return entries.map((entry): Manipulator => ({
          ...entry,
          type: "basic" as const,
          from: {
            key_code: command_key,
            modifiers: {
              mandatory: ["any"],
            },
          },
          conditions: [sublayerCondition, ...(entry.conditions || [])],
        }))
      }
    ),
  ];
}

export function createRightHyperSubLayers(subLayers: {
  [key_code in KeyCode]?: HyperKeySublayer | LayerCommand;
}): KarabinerRules[] {
  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  return Object.entries(subLayers).map(([key, value]) => {
    // Direct key mapping (not a sublayer) — supports arrays for conditional entries
    if ("to" in value || Array.isArray(value)) {
      const entries = Array.isArray(value) ? value : [value]
      const rightHyperFrom = {
        key_code: key as KeyCode,
        modifiers: {
          mandatory: [
            "right_command" as const,
            "right_control" as const,
            "right_shift" as const,
            "right_option" as const,
          ],
        },
      }
      return {
        description: `Right Hyper Key + ${key}`,
        manipulators: entries.map((entry) => ({
          ...entry,
          type: "basic" as const,
          from: rightHyperFrom,
          ...(entry.conditions ? { conditions: entry.conditions } : {}),
        })),
      }
    }

    return {
      description: `Right Hyper Key sublayer "${key}"`,
      manipulators: createRightHyperSubLayer(
        key as KeyCode,
        value,
        allSubLayerVariables
      ),
    }
  });
}
