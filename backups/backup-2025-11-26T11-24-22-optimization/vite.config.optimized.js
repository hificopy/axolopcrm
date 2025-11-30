import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize React builds
      jsxImportSource: "@emotion/react",
    }),
  ],
  root: ".",
  base: "/",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",
    // Optimize build size
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      input: "./index.html",
      output: {
        // Enhanced code splitting for better caching
        manualChunks: {
          // React core - rarely changes
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // UI components - changes occasionally
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-accordion",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
          ],

          // Data management - changes occasionally
          "data-vendor": [
            "@tanstack/react-table",
            "@tanstack/react-query",
            "@tanstack/react-virtual",
            "zustand",
          ],

          // Drag and drop - rarely changes
          "dnd-vendor": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/utilities",
            "react-grid-layout",
          ],

          // Forms - changes occasionally
          "form-vendor": [
            "react-hook-form",
            "zod",
            "@hookform/resolvers",
            "react-hot-toast",
          ],

          // Rich text editor - rarely changes
          "editor-vendor": [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-placeholder",
          ],

          // Calendar - rarely changes
          "calendar-vendor": [
            "@fullcalendar/daygrid",
            "@fullcalendar/interaction",
            "@fullcalendar/list",
            "@fullcalendar/react",
            "@fullcalendar/timegrid",
            "react-day-picker",
          ],

          // Charts - rarely changes
          "charts-vendor": ["recharts"],

          // Animation - rarely changes
          "animation-vendor": ["framer-motion", "gsap"],

          // Email - rarely changes
          "email-vendor": ["@react-email/components", "react-email"],

          // AI/ML - rarely changes
          "ai-vendor": ["@xenova/transformers", "chromadb"],

          // Utilities - rarely changes
          "utils-vendor": [
            "date-fns",
            "luxon",
            "uuid",
            "clsx",
            "class-variance-authority",
            "tailwind-merge",
            "cmdk",
          ],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          return `js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.names?.[0]?.split(".").pop() || "asset";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|ttf|otf/i.test(extType)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|ttf|otf/i.test(extType)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend"),
      "@branding": path.resolve(__dirname, "../branding"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@components": path.resolve(__dirname, "./frontend/components"),
      "@pages": path.resolve(__dirname, "./frontend/pages"),
      "@services": path.resolve(__dirname, "./frontend/services"),
      "@utils": path.resolve(__dirname, "./frontend/lib"),
      "@/contexts": path.resolve(__dirname, "./frontend/contexts"),
      "@/hooks": path.resolve(__dirname, "./frontend/hooks"),
    },
  },
  server: {
    host: true,
    port: 3000,
    // Enable HMR overlay
    hmr: {
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        // Enable proxy WebSocket
        ws: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-table",
      "@tanstack/react-query",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "zustand",
      "date-fns",
      "lucide-react",
    ],
    // Pre-bundle dependencies for faster development
    force: true,
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // CSS optimizations
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // Add PostCSS plugins for optimization
        require("autoprefixer"),
        require("cssnano")({
          preset: "default",
        }),
      ],
    },
  },
  // Experimental features
  experimental: {
    // Enable build optimizations
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === "js") {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});
