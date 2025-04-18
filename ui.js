import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Box, Button, Container, Paper, Typography, Alert, CircularProgress, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, } from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";
const UpdateSummary = ({ updates, }) => {
    const newVars = updates.filter((u) => u.type === "new");
    const updatedVars = updates.filter((u) => u.type === "update");
    return (React.createElement(Box, { sx: { p: 2 } },
        React.createElement(Typography, { variant: "h6" }, "Variable Changes Summary"),
        newVars.length > 0 && (React.createElement(Box, { sx: { mt: 2 } },
            React.createElement(Typography, { color: "success.main" },
                "New Variables (",
                newVars.length,
                ")"),
            React.createElement(List, { dense: true }, newVars.map((v) => (React.createElement(ListItem, { key: v.name },
                React.createElement(ListItemText, { primary: v.name, secondary: v.collection }))))))),
        updatedVars.length > 0 && (React.createElement(Box, { sx: { mt: 2 } },
            React.createElement(Typography, { color: "warning.main" },
                "Updates (",
                updatedVars.length,
                ")"),
            React.createElement(List, { dense: true }, updatedVars.map((v) => (React.createElement(ListItem, { key: v.name },
                React.createElement(ListItemText, { primary: v.name, secondary: v.collection }))))))),
        newVars.length === 0 && updatedVars.length === 0 && (React.createElement(Box, { sx: { mt: 2 } },
            React.createElement(Typography, { color: "text.secondary" }, "No changes to apply")))));
};
const mapTypeToFigma = (type) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
        case "color":
            return "COLOR";
        case "sizing":
        case "spacing":
        case "fontsize":
        case "lineheight":
        case "letterspacing":
        case "dimension":
        case "number":
            return "FLOAT";
        case "boolean":
            return "BOOLEAN";
        case "string":
        case "fontfamily":
        case "fontweight":
        case "text":
            return "STRING";
        default:
            console.warn(`Unknown type: ${lowerType}, defaulting to STRING`);
            return "STRING";
    }
};
const isTokenValue = (value) => {
    return (Boolean(value) &&
        typeof value === "object" &&
        value !== null &&
        "value" in value &&
        "type" in value);
};
const sanitizeVariableName = (name) => {
    // Split by path separator
    const parts = name.split("/");
    // Process each part
    const processedParts = parts.map((part) => {
        // Replace any non-alphanumeric characters with underscores
        return part.replace(/[^a-zA-Z0-9]/g, "_");
    });
    return processedParts.join("/");
};
const extractVariables = (obj, prefix = "", mode) => {
    const vars = [];
    const errors = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}/${key}` : key;
        const sanitizedKey = sanitizeVariableName(fullKey);
        if (isTokenValue(value)) {
            try {
                // Handle token value objects
                const figmaType = mapTypeToFigma(value.type);
                let figmaValue = value.value;
                // Validate and convert values based on type
                switch (figmaType) {
                    case "COLOR":
                        if (typeof figmaValue !== "string") {
                            throw new Error(`Invalid color value type: ${typeof figmaValue}`);
                        }
                        if (figmaValue === "transparent") {
                            figmaValue = "#00000000";
                        }
                        else if (!figmaValue.startsWith("#")) {
                            throw new Error(`Invalid color format: ${figmaValue}`);
                        }
                        break;
                    case "FLOAT":
                        if (typeof figmaValue === "string") {
                            if (figmaValue.endsWith("rem")) {
                                figmaValue = parseFloat(figmaValue) * 16;
                            }
                            else {
                                figmaValue = parseFloat(figmaValue);
                            }
                            if (isNaN(figmaValue)) {
                                throw new Error(`Invalid number value: ${value.value}`);
                            }
                        }
                        else if (typeof figmaValue !== "number") {
                            throw new Error(`Invalid number value type: ${typeof figmaValue}`);
                        }
                        break;
                    case "BOOLEAN":
                        if (typeof figmaValue === "string") {
                            figmaValue = figmaValue.toLowerCase() === "true";
                        }
                        else if (typeof figmaValue !== "boolean") {
                            throw new Error(`Invalid boolean value: ${value.value}`);
                        }
                        break;
                }
                vars.push({
                    name: sanitizedKey,
                    value: figmaValue,
                    type: figmaType,
                    mode,
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
                errors.push(`Error processing ${fullKey}: ${errorMessage}`);
            }
        }
        else if (typeof value === "object") {
            // Check for light/dark modes
            if (key === "light" || key === "dark") {
                // Process the mode-specific values while maintaining the parent path
                vars.push(...extractVariables(value, prefix, key));
            }
            else {
                // Regular nested object processing
                vars.push(...extractVariables(value, fullKey, mode));
            }
        }
    }
    if (errors.length > 0) {
        console.warn("Errors during variable extraction:", errors);
    }
    return vars;
};
const App = () => {
    const [variables, setVariables] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [updates, setUpdates] = useState([]);
    const [showSummary, setShowSummary] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setWindowSize({ width, height });
            parent.postMessage({ pluginMessage: { type: "resize", width, height } }, "*");
        };
        // Initial resize
        handleResize();
        // Add resize listener
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const handleFileUpload = async (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const extractedVars = extractVariables(json);
            setVariables(extractedVars);
            setError("");
        }
        catch (err) {
            setError("Invalid JSON file");
            setVariables([]);
        }
    };
    const handleCreateVariables = async () => {
        setLoading(true);
        try {
            parent.postMessage({ pluginMessage: { type: "create-variables", variables } }, "*");
            setError("");
        }
        catch (err) {
            setError("Failed to create variables");
        }
        setLoading(false);
    };
    const handleDeleteVariable = (variable) => {
        setVariables(variables.filter((v) => v.name !== variable.name));
    };
    useEffect(() => {
        window.onmessage = (event) => {
            const message = event.data.pluginMessage;
            if (message.type === "variable-updates") {
                setUpdates(message.updates);
                setShowSummary(true);
            }
            else if (message.type === "resize") {
                setWindowSize({ width: message.width, height: message.height });
            }
        };
    }, []);
    const handleConfirm = () => {
        // Send confirm message to plugin
        parent.postMessage({ pluginMessage: { type: "confirm-updates", confirm: true, variables } }, "*");
        // Reset UI state to show home page
        setUpdates([]);
        setShowSummary(false);
        setVariables([]);
        setError("");
    };
    const handleCancel = () => {
        // Reset the UI state
        setUpdates([]);
        setShowSummary(false);
        // Send cancel message to plugin
        parent.postMessage({ pluginMessage: { type: "confirm-updates", confirm: false } }, "*");
    };
    return (React.createElement(Container, { maxWidth: "sm", sx: {
            height: windowSize.height,
            width: windowSize.width,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: 0,
        } },
        React.createElement(Box, { sx: {
                flex: 1,
                overflow: "auto",
                my: 4,
                px: 2,
            } },
            React.createElement(Typography, { variant: "h5", component: "h1", gutterBottom: true }, "Import JSON Tokens to Variables"),
            showSummary ? (React.createElement(React.Fragment, null,
                React.createElement(UpdateSummary, { updates: updates }))) : (React.createElement(React.Fragment, null,
                React.createElement(Paper, { sx: { p: 2, mb: 2 } },
                    React.createElement(Button, { variant: "contained", component: "label", startIcon: React.createElement(CloudUpload, null), fullWidth: true, sx: {
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                boxShadow: "none",
                            },
                        } },
                        "Upload JSON File",
                        React.createElement("input", { type: "file", hidden: true, accept: ".json", onChange: handleFileUpload }))),
                error && (React.createElement(Alert, { severity: "error", sx: { mb: 2 } }, error)),
                variables.length > 0 && (React.createElement(Paper, { sx: { p: 2 } },
                    React.createElement(Typography, { variant: "h6", gutterBottom: true },
                        "Variables Preview (",
                        variables.length,
                        " variables)"),
                    React.createElement(List, null, variables.map((variable) => (React.createElement(ListItem, { key: variable.name },
                        React.createElement(ListItemText, { primary: variable.name, secondary: `Type: ${variable.type}, Value: ${JSON.stringify(variable.value)}` }),
                        React.createElement(ListItemSecondaryAction, null,
                            React.createElement(IconButton, { edge: "end", onClick: () => handleDeleteVariable(variable) },
                                React.createElement(Delete, null)))))))))))),
        React.createElement(Box, { sx: {
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: "background.paper",
                borderTop: 1,
                borderColor: "divider",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            } }, showSummary ? (React.createElement(Box, { sx: { display: "flex", justifyContent: "flex-end", gap: 1 } },
            React.createElement(Button, { onClick: handleCancel, color: "inherit", sx: {
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                } }, "Cancel"),
            React.createElement(Button, { onClick: handleConfirm, variant: "contained", color: "primary", sx: {
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                } }, "Confirm Changes"))) : (React.createElement(Button, { variant: "contained", onClick: handleCreateVariables, disabled: loading || variables.length === 0, fullWidth: true, sx: {
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                    boxShadow: "none",
                },
            } }, loading ? React.createElement(CircularProgress, { size: 24 }) : "Create Variables")))));
};
const container = document.getElementById("react-page");
const root = createRoot(container);
root.render(React.createElement(App, null));
