import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LANGUAGE,
  RTL_LANGUAGES,
  SUPPORTED_LANGUAGES,
  getDictionary,
  type TranslationKey,
} from "./translations";

const STORAGE_KEY = "mos.language";

export type Direction = "ltr" | "rtl";

interface LanguageContextValue {
  language: string;
  setLanguage: (language: string) => void;
  dir: Direction;
  /** Translate a key, interpolating `{placeholders}`. Falls back to English. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  detected: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const isRtlLanguage = (language: string): boolean =>
  (RTL_LANGUAGES as readonly string[]).includes(language.split("-")[0]);

/** Detects the visitor language from storage, then browser preferences. */
export const detectLanguage = (): { language: string; detected: boolean } => {
  if (typeof window === "undefined") return { language: DEFAULT_LANGUAGE, detected: false };

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return { language: stored, detected: false };

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const base = candidate.split("-")[0];
    if (SUPPORTED_LANGUAGES.includes(candidate) || SUPPORTED_LANGUAGES.includes(base)) {
      return { language: SUPPORTED_LANGUAGES.includes(candidate) ? candidate : base, detected: true };
    }
  }

  // Unknown language: keep the visitor's tag so dates/numbers stay localized,
  // while copy falls back to English.
  const first = candidates[0];
  return first ? { language: first, detected: true } : { language: DEFAULT_LANGUAGE, detected: false };
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const initial = useMemo(detectLanguage, []);
  const [language, setLanguageState] = useState(initial.language);
  const [detected, setDetected] = useState(initial.detected);

  const dir: Direction = isRtlLanguage(language) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const setLanguage = useCallback((next: string) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
    setDetected(false);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const template = getDictionary(language)[key] ?? key;
      if (!vars) return template;
      return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.split(`{${name}}`).join(String(value)),
        template,
      );
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, dir, t, detected }),
    [language, setLanguage, dir, t, detected],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
