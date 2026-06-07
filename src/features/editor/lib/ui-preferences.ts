import type { Locale, ThemeMode } from "../types";

const LOCALE_STORAGE_KEY = "meshcraft-locale";
const THEME_STORAGE_KEY = "meshcraft-theme";

export const LOCALES: Locale[] = ["en", "zh-CN"];
export const THEMES: ThemeMode[] = ["dark", "light"];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && THEMES.includes(value as ThemeMode);
}

export function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : "en";
}

export function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (isThemeMode(stored)) {
    return stored;
  }

  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function persistLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

export function persistTheme(theme: ThemeMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
