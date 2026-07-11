import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { createGenerator, defineConfig, expandVariantGroup, presetWind3, presetAttributify } from "unocss";
import presetTheme from "unocss-preset-theme";
import { themeConfig } from "../src/config.ts";

const { light, dark } = themeConfig.color;
const distDir = join(process.cwd(), "dist/_astro");
const files = readdirSync(distDir).filter(f => f.startsWith("Layout.") && f.endsWith(".css"));
if (!files.length) { console.error("No Layout CSS found"); process.exit(1); }

const cssPath = join(distDir, files[0]);
const css = readFileSync(cssPath, "utf-8");
console.log("Processing", files[0]);

const config = defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTheme({ theme: { dark: { colors: { ...dark, note: "oklch(70.7% 0.165 254.624 / 0.8)", tip: "oklch(76.5% 0.177 163.223 / 0.8)", important: "oklch(71.4% 0.203 305.504 / 0.8)", warning: "oklch(82.8% 0.189 84.429 / 0.8)", caution: "oklch(70.4% 0.191 22.216 / 0.8)" } } } }),
  ],
  theme: {
    breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    colors: { ...light, note: "oklch(48.8% 0.243 264.376 / 0.8)", tip: "oklch(50.8% 0.118 165.612 / 0.8)", important: "oklch(49.6% 0.265 301.924 / 0.8)", warning: "oklch(55.5% 0.163 48.998 / 0.8)", caution: "oklch(50.5% 0.213 27.518 / 0.8)" },
    fontFamily: { title: ["Snell-Black"], navbar: ["STIX-Italic"], time: ["Snell-Bold"], serif: ["STIX"] },
  },
  shortcuts: { "uno-desktop-column": "absolute left-[min(calc(100vw-19rem),calc(50vw+21rem))] w-14rem", "c-primary": "text-primary", "text-footer": "text-2.5 leading-relaxed" }
});

async function main() {
  const gen = await createGenerator(config);
  
  // Scan src for astro files and extract tokens
  function findFiles(dir) {
    const r = [];
    try {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") r.push(...findFiles(join(dir, e.name)));
        else if (e.name.endsWith(".astro") || e.name.endsWith(".ts")) r.push(join(dir, e.name));
      }
    } catch {}
    return r;
  }
  
  const tokens = new Set();
  for (const f of findFiles(join(process.cwd(), "src"))) {
    try {
      const code = readFileSync(f, "utf-8");
      for (const t of expandVariantGroup(code).split(/[\\:]?[\s'"`;{}<>]+/g).filter(Boolean)) {
        if (t.includes(":") || t.startsWith("uno-")) tokens.add(t);
      }
    } catch {}
  }
  
  console.log("Found", tokens.size, "variant tokens");
  const result = await gen.generate(Array.from(tokens).join(" "));
  
  // Extract @media (min-width: ...) rules
  const mediaRules = [];
  let cur = "", depth = 0;
  for (const line of result.css.split("\n")) {
    if (line.startsWith("@media")) {
      if (cur && cur.includes("min-width")) mediaRules.push(cur);
      cur = line; depth = 1;
    } else if (depth > 0) {
      cur += "\n" + line;
      depth += (line.match(/\{/g)||[]).length - (line.match(/\}/g)||[]).length;
      if (depth <= 0) { if (cur.includes("min-width")) mediaRules.push(cur); cur = ""; depth = 0; }
    }
  }
  if (cur && cur.includes("min-width")) mediaRules.push(cur);
  
  console.log("Generated", mediaRules.length, "responsive @media rules");
  
  if (mediaRules.length > 0) {
    writeFileSync(cssPath, css + "\n/* unocss-responsive-injection */\n" + mediaRules.join("\n"));
    console.log("Injected into", files[0]);
  }
}

main().catch(console.error);
