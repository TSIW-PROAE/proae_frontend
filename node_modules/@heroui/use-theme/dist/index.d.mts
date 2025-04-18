declare const ThemeProps: {
    readonly KEY: "heroui-theme";
    readonly LIGHT: "light";
    readonly DARK: "dark";
    readonly SYSTEM: "system";
};
type customTheme = string;
type Theme = typeof ThemeProps.LIGHT | typeof ThemeProps.DARK | typeof ThemeProps.SYSTEM | customTheme;
/**
 * React hook to switch between themes
 *
 * @param defaultTheme the default theme name (e.g. light, dark, purple-dark and etc)
 * @returns An object containing the current theme and theme manipulation functions
 */
declare function useTheme(defaultTheme?: Theme): {
    theme: string;
    setTheme: (newTheme: Theme) => void;
};

export { type Theme, ThemeProps, type customTheme, useTheme };
