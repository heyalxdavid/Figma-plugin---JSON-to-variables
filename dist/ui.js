/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 1708:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6540);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5338);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9067);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4073);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9799);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2461);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(4545);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(126);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(538);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(6990);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(8518);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(4448);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(1641);
/* harmony import */ var _mui_material__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(3357);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(669);
/* harmony import */ var _mui_icons_material__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(7110);




const UpdateSummary = ({ updates, }) => {
    const newVars = updates.filter((u) => u.type === "new");
    const updatedVars = updates.filter((u) => u.type === "update");
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: { p: 2 } },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, { variant: "h6" }, "Variable Changes Summary"),
        newVars.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: { mt: 2 } },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, { color: "success.main" },
                "New Variables (",
                newVars.length,
                ")"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A, { dense: true }, newVars.map((v) => (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Ay, { key: v.name },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, { primary: v.name, secondary: v.collection }))))))),
        updatedVars.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: { mt: 2 } },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, { color: "warning.main" },
                "Updates (",
                updatedVars.length,
                ")"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A, { dense: true }, updatedVars.map((v) => (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Ay, { key: v.name },
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, { primary: v.name, secondary: v.collection }))))))),
        newVars.length === 0 && updatedVars.length === 0 && (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: { mt: 2 } },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, { color: "text.secondary" }, "No changes to apply")))));
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
    const [variables, setVariables] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [updates, setUpdates] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [showSummary, setShowSummary] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [windowSize, setWindowSize] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({ width: 400, height: 600 });
    // Handle window resize
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .A, { maxWidth: "sm", sx: {
            height: windowSize.height,
            width: windowSize.width,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            p: 0,
        } },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: {
                flex: 1,
                overflow: "auto",
                my: 4,
                px: 2,
            } },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, { variant: "h5", component: "h1", gutterBottom: true }, "Import JSON Tokens to Variables"),
            showSummary ? (react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(UpdateSummary, { updates: updates }))) : (react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .A, { sx: { p: 2, mb: 2 } },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .A, { variant: "contained", component: "label", startIcon: react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_icons_material__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .A, null), fullWidth: true, sx: {
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                boxShadow: "none",
                            },
                        } },
                        "Upload JSON File",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("input", { type: "file", hidden: true, accept: ".json", onChange: handleFileUpload }))),
                error && (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .A, { severity: "error", sx: { mb: 2 } }, error)),
                variables.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .A, { sx: { p: 2 } },
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A, { variant: "h6", gutterBottom: true },
                        "Variables Preview (",
                        variables.length,
                        " variables)"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A, null, variables.map((variable) => (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Ay, { key: variable.name },
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, { primary: variable.name, secondary: `Type: ${variable.type}, Value: ${JSON.stringify(variable.value)}` }),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .A, null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .A, { edge: "end", onClick: () => handleDeleteVariable(variable) },
                                react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_icons_material__WEBPACK_IMPORTED_MODULE_14__/* ["default"] */ .A, null)))))))))))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: {
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
            } }, showSummary ? (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, { sx: { display: "flex", justifyContent: "flex-end", gap: 1 } },
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .A, { onClick: handleCancel, color: "inherit", sx: {
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                } }, "Cancel"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .A, { onClick: handleConfirm, variant: "contained", color: "primary", sx: {
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "none",
                    },
                } }, "Confirm Changes"))) : (react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .A, { variant: "contained", onClick: handleCreateVariables, disabled: loading || variables.length === 0, fullWidth: true, sx: {
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                    boxShadow: "none",
                },
            } }, loading ? react__WEBPACK_IMPORTED_MODULE_0__.createElement(_mui_material__WEBPACK_IMPORTED_MODULE_15__/* ["default"] */ .A, { size: 24 }) : "Create Variables")))));
};
const container = document.getElementById("react-page");
const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__/* .createRoot */ .H)(container);
root.render(react__WEBPACK_IMPORTED_MODULE_0__.createElement(App, null));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			209: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkJson_to_Variables"] = self["webpackChunkJson_to_Variables"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [96], () => (__webpack_require__(1708)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;