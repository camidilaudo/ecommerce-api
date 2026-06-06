import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEYS = {
  theme:         "accessibility_theme",
  fontSize:      "accessibility_fontSize",
  highContrast:  "accessibility_highContrast",
  reduceMotion:  "accessibility_reduceMotion",
};

// ─── 2. Valores por defecto ──────────────────────────────────────────────────
const DEFAULTS = {
  theme:        "light",   // "light" | "dark"
  fontSize:     "normal",  // "small" | "normal" | "large" | "extra-large"
  highContrast: false,
  reduceMotion: false,
};

function readFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    // Los booleanos se guardan como string "true"/"false"
    if (stored === "true") return true;
    if (stored === "false") return false;
    return stored;
  } catch {
    // localStorage puede estar bloqueado (modo privado estricto, etc.)
    return fallback;
  }
}

function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
  }
}

const AccessibilityContext = createContext(null);

// ─── 5. Provider ─────────────────────────────────────────────────────────────
export function AccessibilityProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => readFromStorage(STORAGE_KEYS.theme, DEFAULTS.theme)
  );
  const [fontSize, setFontSizeState] = useState(
    () => readFromStorage(STORAGE_KEYS.fontSize, DEFAULTS.fontSize)
  );
  const [highContrast, setHighContrastState] = useState(
    () => readFromStorage(STORAGE_KEYS.highContrast, DEFAULTS.highContrast)
  );
  const [reduceMotion, setReduceMotionState] = useState(
    () => readFromStorage(STORAGE_KEYS.reduceMotion, DEFAULTS.reduceMotion)
  );

  // ── Aplicar preferencias al <body> cuando cambian ─────────────────────────
  useEffect(() => {
    const body = document.body;

    // data-theme → body[data-theme="dark"] { ... }
    body.setAttribute("data-theme", theme);

    // data-font-size → body[data-font-size="large"] { ... }
    body.setAttribute("data-font-size", fontSize);

    // data-contrast → body[data-contrast="high"] { ... }
    body.setAttribute("data-contrast", highContrast ? "high" : "normal");

    // data-motion → body[data-motion="reduced"] { ... }
    body.setAttribute("data-motion", reduceMotion ? "reduced" : "normal");
  }, [theme, fontSize, highContrast, reduceMotion]);

  function toggleTheme() {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      writeToStorage(STORAGE_KEYS.theme, next);
      return next;
    });
  }

  function setFontSize(size) {
    // Validación defensiva
    const valid = ["small", "normal", "large", "extra-large"];
    if (!valid.includes(size)) return;
    setFontSizeState(size);
    writeToStorage(STORAGE_KEYS.fontSize, size);
  }

  function toggleHighContrast() {
    setHighContrastState((prev) => {
      const next = !prev;
      writeToStorage(STORAGE_KEYS.highContrast, next);
      return next;
    });
  }

  function toggleReduceMotion() {
    setReduceMotionState((prev) => {
      const next = !prev;
      writeToStorage(STORAGE_KEYS.reduceMotion, next);
      return next;
    });
  }

  const value = {
    theme,
    toggleTheme,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (ctx === null) {
    throw new Error(
      "useAccessibility debe usarse dentro de <AccessibilityProvider>"
    );
  }
  return ctx;
}