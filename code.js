"use strict";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
    width: 400,
    height: 600,
    themeColors: true
});
figma.ui.onmessage = async (msg) => {
    if (msg.type === "create-variables") {
        const { variables } = msg;
        const updates = await analyzeVariables(variables);
        figma.ui.postMessage({ type: "variable-updates", updates });
    }
    else if (msg.type === "confirm-updates") {
        if (msg.confirm) {
            await createVariables(msg.variables);
        }
    }
    else if (msg.type === "resize") {
        figma.ui.resize(msg.width, msg.height);
    }
};
// Handle window resize
figma.ui.on("message", (msg) => {
    if (msg.type === "resize") {
        figma.ui.resize(msg.width, msg.height);
    }
});
async function analyzeVariables(variables) {
    var _a, _b;
    const updates = [];
    const existingVariables = await figma.variables.getLocalVariablesAsync();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    for (const variable of variables) {
        const existingVariable = existingVariables.find((v) => v.name === variable.name);
        if (!existingVariable) {
            // New variable
            updates.push({
                name: variable.name,
                type: "new",
                collection: variable.type === "COLOR" ? "Color Tokens" : "Design Tokens",
            });
        }
        else {
            // Check if value has changed
            const currentValue = existingVariable.valuesByMode[Object.keys(existingVariable.valuesByMode)[0]];
            let hasValueChanged = false;
            if (variable.type === "COLOR" && typeof variable.value === "string") {
                // For colors, convert both values to RGB for comparison
                const newColorValue = convertHexToRGB(variable.value);
                hasValueChanged = JSON.stringify(currentValue) !== JSON.stringify(newColorValue);
            }
            else {
                hasValueChanged = JSON.stringify(currentValue) !== JSON.stringify(variable.value);
            }
            if (hasValueChanged) {
                updates.push({
                    name: variable.name,
                    type: "update",
                    collection: existingVariable.variableCollectionId
                        ? ((_a = collections.find((c) => c.id === existingVariable.variableCollectionId)) === null || _a === void 0 ? void 0 : _a.name) || "Design Tokens"
                        : "Design Tokens",
                });
            }
            else {
                updates.push({
                    name: variable.name,
                    type: "unchanged",
                    collection: existingVariable.variableCollectionId
                        ? ((_b = collections.find((c) => c.id === existingVariable.variableCollectionId)) === null || _b === void 0 ? void 0 : _b.name) || "Design Tokens"
                        : "Design Tokens",
                });
            }
        }
    }
    return updates;
}
async function createVariables(variables = []) {
    try {
        // Analyze what will change
        const updates = await analyzeVariables(variables);
        // Filter out unchanged variables
        const changedVariables = variables.filter(variable => {
            const update = updates.find(u => u.name === variable.name);
            return update && update.type !== 'unchanged';
        });
        if (changedVariables.length === 0) {
            figma.notify('No changes to apply');
            return;
        }
        // Create collections for different types
        const colorCollection = await getOrCreateCollection("Color Tokens");
        const otherCollection = await getOrCreateCollection("Design Tokens");
        // Get existing variables
        const existingVariables = await figma.variables.getLocalVariablesAsync();
        // Create or update variables
        for (const variable of changedVariables) {
            try {
                // Choose collection based on variable type
                const collection = variable.type === 'COLOR' ? colorCollection : otherCollection;
                let newVariable;
                const existingVariable = existingVariables.find(v => v.name === variable.name);
                if (existingVariable) {
                    // Update existing variable
                    newVariable = existingVariable;
                }
                else {
                    // Create new variable
                    newVariable = figma.variables.createVariable(variable.name, collection, variable.type);
                }
                // Convert value based on type
                let variableValue;
                switch (variable.type) {
                    case 'COLOR':
                        if (typeof variable.value === 'string' && variable.value.startsWith('#')) {
                            variableValue = convertHexToRGB(variable.value);
                        }
                        else {
                            throw new Error(`Invalid color value: ${variable.value}`);
                        }
                        break;
                    case 'FLOAT':
                        if (typeof variable.value === 'string') {
                            variableValue = parseFloat(variable.value);
                            if (isNaN(variableValue)) {
                                throw new Error(`Invalid number value: ${variable.value}`);
                            }
                        }
                        else {
                            variableValue = variable.value;
                        }
                        break;
                    case 'BOOLEAN':
                        if (typeof variable.value === 'string') {
                            variableValue = variable.value.toLowerCase() === 'true';
                        }
                        else {
                            variableValue = Boolean(variable.value);
                        }
                        break;
                    default:
                        variableValue = String(variable.value);
                }
                // Set the value for the default mode
                await newVariable.setValueForMode(collection.modes[0].modeId, variableValue);
            }
            catch (err) {
                console.error(`Error processing variable ${variable.name}:`, err);
                throw new Error(`Error processing variable ${variable.name}: ${err}`);
            }
        }
        figma.notify('Variables updated successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        figma.notify('Error updating variables: ' + errorMessage, { error: true });
        throw error;
    }
}
async function getOrCreateCollection(name) {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    let collection = collections.find(c => c.name === name);
    if (!collection) {
        collection = figma.variables.createVariableCollection(name);
    }
    return collection;
}
function convertHexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
}
