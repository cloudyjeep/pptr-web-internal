/**
 * @file Formatter for replacing placeholders in a template string with formatted values.
 * This module provides a function to format values based on specified modes and replace
 * placeholders in a template string with these formatted values.
 */
const format = {
  code: "```",
  codeBold: "*```",
  codeItalic: "_```",
  var: "`",
  varBold: "*`",
  varStrike: "~`",
  bold: "*",
  boldItalic: "_*",
  boldStrike: "~*",
  italic: "_",
  strike: "~",
};

/**
 * Regular expression to match placeholders in the format `[[key]]` or `{{key}}`.
 * It captures the key inside the brackets.
 */
const patternScope = /(?:\{\{([^}]+)\}\}|\[\[([^\]]+)\]\])/g;

/**
 * Formats a value based on the specified mode.
 * @param {keyof typeof format | (string & {})} mode - The formatting mode.
 * @param {any} value - The value to format.
 * @returns {string} - The formatted value.
 */
function formating(mode: keyof typeof format | (string & {}), value: any) {
  const code = (format as any)[mode] ?? mode;

  if (code.trim() == "") {
    return value;
  }

  return `${code}${String(value)}${code.split("").reverse().join("")}`;
}

/**
 * Replaces placeholders in a template string with formatted values from a payload.
 * The placeholders can be in the form of `[[key]]` or `{{key}}`.
 * @param {string} template - The template string containing placeholders.
 * @param {Record<string, [Parameters<typeof formating>[0], any, any?]>} payload - An object where keys are the placeholder names and values are arrays containing the formatting mode, value, and an optional default value.
 * @returns {string} - The template string with placeholders replaced by formatted values.
 */
export function replaceTemplate(
  template: string,
  payload: Record<string, [Parameters<typeof formating>[0], any, any?]>
): string {
  return template
    .replace(patternScope, (_, key1, key2) => {
      // Use key1 or key2, whichever is not undefined
      const key = String(key1 || key2).trim();

      // If key is array and empty, return an empty string
      if (!Array.isArray(payload[key])) {
        return "";
      }

      const [_mode, _value, defaultValue] = payload[key];
      const mode = _mode ?? "";
      const value = _value ?? defaultValue;

      // check if value is an array and has items
      if (Array.isArray(value) && value.length > 0) {
        let str = [];
        for (const item of value) {
          // Skip undefined, null, or empty string items
          if ([undefined, null, ""].includes(item)) {
            continue;
          }

          // Convert objects to JSON string, otherwise convert to string
          if (typeof item === "object") {
            str.push(JSON.stringify(item));
            continue;
          }

          // If it's a number, boolean, or other primitive type
          str.push(String(item));
        }

        return formating(mode, str.join(", "));
      }

      // check if value is an object
      if (typeof value === "object" && Object.keys(value).length > 0) {
        return formating(mode, JSON.stringify(value));
      }

      // just return it as a string
      return formating(mode, value);
    })
    .trim();
}

// const result = replaceTemplate(
//   `
// Nama : [[name]]
// Kelas: [[kelas]]
// Hobi : [[hobi]]

// code: {{code}}
// var: {{var}}
// varBold: {{varBold}}
// varStrike: {{var strike}}
// bold: {{bold}}
// boldItalic: {{ boldItalic}}
// boldStrike: {{boldStrike}}
// italic: {{italic}}
// strike: {{strike}}

//   `,
//   {
//     name: ["strike", "Budi"],
//     kelas: ["italic", "10A"],
//     hobi: [
//       "var",
//       ["Membaca", "Bersepeda", { hobi: "Berenang", level: "Expert" }],
//     ],
//     detail: ["var", { hobi: "Berenang", level: "Expert" }],

//     code: ["code", "razif"],
//     var: ["var", "razif"],
//     varBold: ["varBold", "razif"],
//     "var strike": ["varStrike", "razif"],
//     bold: ["bold", "razif"],
//     boldItalic: ["boldItalic", "razif"],
//     boldStrike: ["boldStrike", "razif"],
//     italic: ["italic", "razif"],
//     strike: ["strike", "razif"],
//   }
// );

// console.log("message:");
// console.log(result);
