/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        muted: "hsl(var(--muted))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))"
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Inter", "sans-serif"]
      },
      boxShadow: {
        glow: "0 4px 24px rgba(10,102,255,0.15)"
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        shimmer: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "100% 50%" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        ring: { "0%": { transform: "scale(0.9)", opacity: "0.4" }, "100%": { transform: "scale(1.25)", opacity: "0" } }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 12s ease infinite",
        marquee: "marquee 35s linear infinite",
        ring: "ring 3s ease-out infinite"
      }
    }
  },
  plugins: []
};