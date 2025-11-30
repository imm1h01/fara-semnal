import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
    const isDev = mode === "development";

    return {
        server: {
            host: "::",
            port: 8080,
        },

        plugins: [react(), isDev && componentTagger()].filter(Boolean),

        // IMPORTANT: GitHub Pages fix
        // Dacă NU e development → setează /fara-semnal/
        base: isDev ? "/" : "/fara-semnal/",

        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
