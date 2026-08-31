/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F46E5",
          light: "#EEF2FF",
          dark: "#4338CA",
          soft: "#F5F3FF",
        },
        shell: {
          sidebar: "#EDEEF2",
          content: "#F7F8FA",
          "topbar": "#FFFFFF",
        },
        line: {
          DEFAULT: "#E5E7EB",
          light: "#F0F1F4",
        },
        ink: {
          DEFAULT: "#111827",
          soft: "#6B7280",
          faint: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
        mono: ["Roboto Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        card: "10px",
        input: "8px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
      },
      fontSize: {
        badge: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
      },
    },
  },
  plugins: [],
}
