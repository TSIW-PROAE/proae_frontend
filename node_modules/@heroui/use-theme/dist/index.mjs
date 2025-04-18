// src/index.ts
import { useCallback, useEffect, useState } from "react";
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
  const [theme, setThemeState] = useState(() => {
    var _a;
    const storedTheme = localStorage.getItem(ThemeProps.KEY);
    if (storedTheme) return storedTheme;
    if (defaultTheme === ThemeProps.SYSTEM) {
      return ((_a = window.matchMedia) == null ? void 0 : _a.call(window, MEDIA).matches) ? ThemeProps.DARK : ThemeProps.LIGHT;
    }
    return defaultTheme;
  });
  const setTheme = useCallback(
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
  const handleMediaQuery = useCallback(
    (e) => {
      if (defaultTheme === ThemeProps.SYSTEM) {
        setTheme(e.matches ? ThemeProps.DARK : ThemeProps.LIGHT);
      }
    },
    [setTheme]
  );
  useEffect(() => setTheme(theme), [theme, setTheme]);
  useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener("change", handleMediaQuery);
    return () => media.removeEventListener("change", handleMediaQuery);
  }, [handleMediaQuery]);
  return { theme, setTheme };
}
export {
  ThemeProps,
  useTheme
};
