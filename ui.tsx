import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";

type VariableResolvedDataType = "COLOR" | "FLOAT" | "BOOLEAN" | "STRING";

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface Variable {
  name: string;
  value: string | number | boolean | RGBColor;
  type: VariableResolvedDataType;
  mode?: string;
}

interface VariableUpdate {
  name: string;
  type: "new" | "update";
  collection: string;
  modes?: Record<string, string | number | boolean | RGBColor>;
}

interface TokenValue {
  value: string | number | boolean;
  type: string;
}

const UpdateSummary: React.FC<{ updates: VariableUpdate[] }> = ({
  updates,
}) => {
  const newVars = updates.filter((u) => u.type === "new");
  const updatedVars = updates.filter((u) => u.type === "update");

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Variable Changes Summary</Typography>

      {newVars.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography color="success.main">
            New Variables ({newVars.length})
          </Typography>
          <List dense>
            {newVars.map((v) => (
              <ListItem key={v.name}>
                <ListItemText primary={v.name} secondary={v.collection} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {updatedVars.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography color="warning.main">
            Updates ({updatedVars.length})
          </Typography>
          <List dense>
            {updatedVars.map((v) => (
              <ListItem key={v.name}>
                <ListItemText primary={v.name} secondary={v.collection} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {newVars.length === 0 && updatedVars.length === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary">No changes to apply</Typography>
        </Box>
      )}
    </Box>
  );
};

const mapTypeToFigma = (type: string): VariableResolvedDataType => {
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

const isTokenValue = (value: unknown): value is TokenValue => {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "type" in value
  );
};

const sanitizeVariableName = (name: string): string => {
  // Split by path separator
  const parts = name.split("/");

  // Process each part
  const processedParts = parts.map((part) => {
    // Replace any non-alphanumeric characters with underscores
    return part.replace(/[^a-zA-Z0-9]/g, "_");
  });

  return processedParts.join("/");
};

const extractVariables = (
  obj: Record<string, TokenValue | Record<string, unknown>>,
  prefix: string = "",
  mode?: string
): Variable[] => {
  const vars: Variable[] = [];
  const errors: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}/${key}` : key;
    const sanitizedKey = sanitizeVariableName(fullKey);

    if (isTokenValue(value)) {
      try {
        // Handle token value objects
        const figmaType = mapTypeToFigma(value.type);
        let figmaValue: string | number | boolean = value.value;

        // Validate and convert values based on type
        switch (figmaType) {
          case "COLOR":
            if (typeof figmaValue !== "string") {
              throw new Error(`Invalid color value type: ${typeof figmaValue}`);
            }
            if (figmaValue === "transparent") {
              figmaValue = "#00000000";
            } else if (!figmaValue.startsWith("#")) {
              throw new Error(`Invalid color format: ${figmaValue}`);
            }
            break;

          case "FLOAT":
            if (typeof figmaValue === "string") {
              if (figmaValue.endsWith("rem")) {
                figmaValue = parseFloat(figmaValue) * 16;
              } else {
                figmaValue = parseFloat(figmaValue);
              }
              if (isNaN(figmaValue)) {
                throw new Error(`Invalid number value: ${value.value}`);
              }
            } else if (typeof figmaValue !== "number") {
              throw new Error(
                `Invalid number value type: ${typeof figmaValue}`
              );
            }
            break;

          case "BOOLEAN":
            if (typeof figmaValue === "string") {
              figmaValue = figmaValue.toLowerCase() === "true";
            } else if (typeof figmaValue !== "boolean") {
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
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        errors.push(`Error processing ${fullKey}: ${errorMessage}`);
      }
    } else if (typeof value === "object") {
      // Check for light/dark modes
      if (key === "light" || key === "dark") {
        // Process the mode-specific values while maintaining the parent path
        vars.push(
          ...extractVariables(
            value as Record<string, TokenValue | Record<string, unknown>>,
            prefix,
            key
          )
        );
      } else {
        // Regular nested object processing
        vars.push(
          ...extractVariables(
            value as Record<string, TokenValue | Record<string, unknown>>,
            fullKey,
            mode
          )
        );
      }
    }
  }

  if (errors.length > 0) {
    console.warn("Errors during variable extraction:", errors);
  }

  return vars;
};

const App: React.FC = () => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<VariableUpdate[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      parent.postMessage(
        { pluginMessage: { type: "resize", width, height } },
        "*"
      );
    };

    // Initial resize
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const extractedVars = extractVariables(json);
      setVariables(extractedVars);
      setError("");
    } catch (err) {
      setError("Invalid JSON file");
      setVariables([]);
    }
  };

  const handleCreateVariables = async () => {
    setLoading(true);
    try {
      parent.postMessage(
        { pluginMessage: { type: "create-variables", variables } },
        "*"
      );
      setError("");
    } catch (err) {
      setError("Failed to create variables");
    }
    setLoading(false);
  };

  const handleDeleteVariable = (variable: Variable) => {
    setVariables(variables.filter((v) => v.name !== variable.name));
  };

  useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      if (message.type === "variable-updates") {
        setUpdates(message.updates);
        setShowSummary(true);
      } else if (message.type === "resize") {
        setWindowSize({ width: message.width, height: message.height });
      }
    };
  }, []);

  const handleConfirm = () => {
    // Send confirm message to plugin
    parent.postMessage(
      { pluginMessage: { type: "confirm-updates", confirm: true, variables } },
      "*"
    );
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
    parent.postMessage(
      { pluginMessage: { type: "confirm-updates", confirm: false } },
      "*"
    );
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: windowSize.height,
        width: windowSize.width,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          my: 4,
          px: 2,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Import JSON Tokens to Variables
        </Typography>

        {showSummary ? (
          <>
            <UpdateSummary updates={updates} />
          </>
        ) : (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Upload JSON File
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleFileUpload}
                />
              </Button>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {variables.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Variables Preview ({variables.length} variables)
                </Typography>
                <List>
                  {variables.map((variable) => (
                    <ListItem key={variable.name}>
                      <ListItemText
                        primary={variable.name}
                        secondary={`Type: ${
                          variable.type
                        }, Value: ${JSON.stringify(variable.value)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteVariable(variable)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}
      </Box>

      <Box
        sx={{
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
        }}
      >
        {showSummary ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={handleCancel}
              color="inherit"
              sx={{
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              Confirm Changes
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={handleCreateVariables}
            disabled={loading || variables.length === 0}
            fullWidth
            sx={{
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Variables"}
          </Button>
        )}
      </Box>
    </Container>
  );
};

const container = document.getElementById("react-page");
const root = createRoot(container!);
root.render(<App />);
