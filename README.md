# JSON to Variables Figma Plugin

A Figma plugin that allows you to convert JSON data into Figma variables and vice versa. This plugin helps you maintain design tokens and variables across your design system.

## Features

- Import JSON files and convert them into Figma variables
- Automatically detect variable types (color, text, number, boolean)
- Create nested variable collections based on JSON structure
- Edit variable values directly in the plugin UI
- Export Figma variables back to JSON format
- Support for color values in hex format

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. In Figma, go to Plugins > Development > Import plugin from manifest
5. Select the `manifest.json` file from this repository

## Development

To start development mode with hot reloading:

```bash
npm run dev
```

## Usage

1. Open the plugin in Figma
2. Click "Upload JSON File" to select your JSON file
3. Review the extracted variables in the preview
4. Click "Create Variables" to create the variables in Figma
5. Use "Export JSON" to export your Figma variables back to JSON format

## JSON Format

The plugin supports the following JSON structure:

```json
{
  "colors": {
    "primary": "#FF0000",
    "secondary": "#00FF00"
  },
  "typography": {
    "fontSize": {
      "small": 12,
      "medium": 16,
      "large": 24
    }
  },
  "spacing": {
    "small": 8,
    "medium": 16,
    "large": 24
  }
}
```

## License

MIT

Below are the steps to get your plugin running. You can also find instructions at:

https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

https://nodejs.org/en/download/

Next, install TypeScript using the command:

npm install -g typescript

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

npm install --save-dev @figma/plugin-typings

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
   then select "npm: watch". You will have to do this again every time
   you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.
