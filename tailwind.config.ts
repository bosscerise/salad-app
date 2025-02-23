// tailwind.config.ts
import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          100: "hsl(var(--emerald-100))",
          200: "hsl(var(--emerald-200))",
          300: "hsl(var(--emerald-300))",
          400: "hsl(var(--emerald-400))",
          800: "hsl(var(--emerald-800))",
          900: "hsl(var(--emerald-900))",
          950: "hsl(var(--emerald-950))",
        },
        teal: {
          900: "hsl(var(--teal-900))",
        },
        cyan: {
          950: "hsl(var(--cyan-950))",
        },
      },
    },
  },
});