"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ThemeProps: () => ThemeProps,
  useTheme: () => useTheme
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var ThemeProps = {
  // localStorage key for storing the current theme
  KEY: "heroui-theme",
  // light theme
  LIGHT: "light",
  // dark theme
  DARK: "dark",
  // system theme
  SYSTEM: "system"
};
function useTheme(defaultTheme = ThemeProps.SYSTEM) {
  const MEDIA = "(prefers-color-scheme: dark)";
  const [theme, setThemeState] = (0, import_react.useState)(() => {
    var _a;
    const storedTheme = localStorage.getItem(ThemeProps.KEY);
    if (storedTheme) return storedTheme;
    if (defaultTheme === ThemeProps.SYSTEM) {
      return ((_a = window.matchMedia) == null ? void 0 : _a.call(window, MEDIA).matches) ? ThemeProps.DARK : ThemeProps.LIGHT;
    }
    return defaultTheme;
  });
  const setTheme = (0, import_react.useCallback)(
    (newTheme) => {
      var _a;
      const targetTheme = newTheme === ThemeProps.SYSTEM ? ((_a = window.matchMedia) == null ? void 0 : _a.call(window, MEDIA).matches) ? ThemeProps.DARK : ThemeProps.LIGHT : newTheme;
      localStorage.setItem(ThemeProps.KEY, newTheme);
      document.documentElement.classList.remove(theme);
      document.documentElement.classList.add(targetTheme);
      setThemeState(newTheme);
    },
    [theme]
  );
  const handleMediaQuery = (0, import_react.useCallback)(
    (e) => {
      if (defaultTheme === ThemeProps.SYSTEM) {
        setTheme(e.matches ? ThemeProps.DARK : ThemeProps.LIGHT);
      }
    },
    [setTheme]
  );
  (0, import_react.useEffect)(() => setTheme(theme), [theme, setTheme]);
  (0, import_react.useEffect)(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener("change", handleMediaQuery);
    return () => media.removeEventListener("change", handleMediaQuery);
  }, [handleMediaQuery]);
  return { theme, setTheme };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ThemeProps,
  useTheme
});
