import type { Config } from "tailwindcss";

/**
 * Bhuk Foods palette — taken verbatim from the owner's design paste
 * (design/bhuk_foods_app.jsx, const C). DO NOT drift these values without
 * the owner's sign-off; the entire screen system depends on them.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-figtree)", "Figtree", "system-ui", "sans-serif"],
        bn: [
          "var(--font-noto-bn)",
          "Noto Sans Bengali",
          "var(--font-figtree)",
          "sans-serif",
        ],
      },
      colors: {
        bhuk: {
          cream: "#FBF1DE",
          paper: "#FFFFFF",
          ink: "#2A1E16",
          ink2: "#5C4632",
          maroon: "#8B2415",
          terra: "#C3471E",
          saffron: "#F4C66A",
          green: "#4F9A52",
          "green-bg": "#E4F0DD",
          "green-ink": "#2F6A35",
          amber: "#D9961E",
          "amber-bg": "#FBE6BD",
          "amber-ink": "#8A5A12",
          off: "#E7E0CF",
          "off-ink": "#9A917E",
          line: "#E3C68E",
        },
      },
      borderRadius: {
        card: "18px",
        pill: "99px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        toast: "0 10px 30px rgba(0,0,0,.3)",
      },
    },
  },
  plugins: [],
};

export default config;
