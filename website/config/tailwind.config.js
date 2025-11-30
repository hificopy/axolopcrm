/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./frontend/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // New Axolop Magenta/Plum Color Palette
        // Primary - Hot Pink/Magenta for CTAs and primary actions
        primary: {
          DEFAULT: "hsl(var(--primary))", // #E92C92 - Hot Pink/Magenta
          foreground: "hsl(var(--primary-foreground))",
          hover: "#C81E78", // Darker magenta for hover states
          light: "#F472B6", // Lighter pink for glows/borders
          // Category colors (updated for new palette)
          blue: "hsl(var(--primary-blue))", // #5BB9F5 - Bright Sky Blue
          green: "hsl(var(--primary-green))", // #2DCE89 - Emerald Green
          yellow: "hsl(var(--primary-yellow))", // #F5A623 - Bright Saffron
          black: "hsl(var(--primary-black))", // #1E1B24 - Dark Surface
          accent: "hsl(var(--primary-accent))", // #E92C92 - Hot Pink
        },

        // Brand colors - Plum/Purple theme
        brand: {
          pink: "#E92C92", // Hot pink primary
          purple: "#5B1046", // Brand purple for gradients
          dark: "#0A030B", // Deepest void color
          plum: "#140516", // Deep plum background
        },

        // Accent colors
        accent1: {
          DEFAULT: "#140516", // Deep plum background
          light: "#2E0F2F", // Lighter purple gradient
        },
        accent2: {
          DEFAULT: "#E2E8F0", // Metallic silver text
          dim: "#94A3B8", // Muted silver subtext
        },
        accent3: {
          DEFAULT: "#F59E0B", // Gold/amber for notifications
          soft: "#FCD34D", // Soft gold accents
        },

        // Surface colors
        surface: {
          light: "#FFFFFF", // Dashboard/card backgrounds
          dark: "#1E1B24", // Sidebar/dark UI
        },

        // Neutral palette
        neutral: {
          50: "#fafafa",
          100: "#f5f5f7",
          200: "#e5e5e7",
          300: "#d2d2d7",
          400: "#a1a1a6",
          500: "#86868b",
          600: "#636366",
          700: "#48484a",
          800: "#3a3a3c",
          900: "#1d1d1f",
        },

        // Semantic colors
        success: "#30d158",
        warning: "#ff9f0a",
        error: "#ff453a",
        info: "#007aff",

        // CSS Variable-based colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // CRM specific colors (updated for plum theme)
        "crm-sidebar": "#1E1B24", // Dark surface
        "crm-sidebar-hover": "#2E0F2F", // Plum hover
        "crm-sidebar-active": "#E92C92", // Magenta active
        "crm-bg-light": "#F8F9FA",
        "crm-bg-dark": "#140516", // Deep plum
        "crm-text-primary": "#1F2937", // Dark gray for light backgrounds
        "crm-text-secondary": "#94A3B8", // Muted silver
        "crm-border": "#2E0F2F", // Plum border
        "crm-accent": "#E92C92", // Hot pink

        // Text colors for accessibility
        "text-primary": "hsl(var(--text-on-light-primary))",
        "text-secondary": "hsl(var(--text-on-light-secondary))",
        "text-interactive": {
          DEFAULT: "hsl(var(--text-on-dark-interactive))",
          hover: "hsl(var(--text-on-dark-interactive-hover))",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "var-radius": "var(--radius)",
        "var-radius-md": "calc(var(--radius) - 2px)",
        "var-radius-sm": "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["Plus Jakarta Sans", "Inter", "-apple-system", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "Fira Code", "monospace"],
      },
      fontSize: {
        hero: [
          "48px",
          { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        display: [
          "36px",
          { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        headline: [
          "24px",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        title: [
          "18px",
          { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        body: [
          "14px",
          { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" },
        ],
        caption: [
          "12px",
          {
            lineHeight: "1.4",
            letterSpacing: "0.05em",
            fontWeight: "500",
            textTransform: "uppercase",
          },
        ],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-to-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(233, 44, 146, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(233, 44, 146, 0.6)" },
        },
        "spring-bounce": {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "50%": { transform: "scale(1.02)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "spring-slide": {
          "0%": { transform: "translateX(-10px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "spring-rotate": {
          "0%": { transform: "rotate(-5deg)", opacity: 0 },
          "100%": { transform: "rotate(0deg)", opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in-from-right 0.2s ease-out",
        "slide-out": "slide-out-to-right 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "spring-bounce": "spring-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-slide": "spring-slide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring-rotate": "spring-rotate 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        // Neon glow shadows for buttons
        neon: "0 0 25px -5px rgba(233, 44, 146, 0.6)",
        "neon-hover": "0 0 35px -5px rgba(233, 44, 146, 0.8)",
        "neon-active": "0 0 15px -5px rgba(233, 44, 146, 0.9)",
        // Card and modal shadows
        "crm-card": "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        "crm-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "crm-modal": "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        // Glass morphism
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        // Metallic silver text gradient
        "silver-text": "linear-gradient(to bottom, #FFFFFF 30%, #94A3B8 100%)",
        // Purple radial glow
        "glow-radial":
          "radial-gradient(circle at 50% 0%, #5B1046 0%, #140516 60%)",
        // Primary button gradient
        "primary-gradient": "linear-gradient(to right, #D92683, #F43F5E)",
        // Plum sidebar gradient
        "sidebar-gradient":
          "linear-gradient(180deg, #1E1B24 0%, #140516 50%, #0A030B 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
