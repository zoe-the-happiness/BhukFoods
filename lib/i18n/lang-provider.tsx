"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "bn";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

const COOKIE_NAME = "bhuk-lang";

function readCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=(en|bn)`));
  return match ? (match[1] as Lang) : null;
}

function writeCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LangProvider({
  children,
  initial = "en",
}: {
  children: React.ReactNode;
  initial?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    const stored = readCookie();
    if (stored && stored !== lang) setLangState(stored);
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Toggle the html lang attribute so screen readers + browsers pick it up.
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "bn" ? "bn" : "en";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    writeCookie(l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  // Accept any matching shape so callers can pass JSX fragments, not just
  // strings — useful for inline <b> highlights inside translated copy.
  return function t<T>(en: T, bn: T): T {
    return lang === "bn" ? bn : en;
  };
}
