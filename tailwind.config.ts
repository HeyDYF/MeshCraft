import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#0f1726",
        panelElevated: "#162033",
        accent: "#6ee7f9",
        accentStrong: "#22d3ee",
        grid: "#243043",
      },
      boxShadow: {
        panel: "0 20px 50px rgba(8, 15, 29, 0.35)",
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.18), transparent 30%), radial-gradient(circle at 80% 0%, rgba(59, 130, 246, 0.18), transparent 24%), linear-gradient(180deg, rgba(9, 13, 22, 0.98), rgba(7, 10, 18, 1))",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
