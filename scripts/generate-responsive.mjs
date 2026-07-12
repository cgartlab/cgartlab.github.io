import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { createGenerator, expandVariantGroup } from "unocss";
import { defineConfig, presetWind3, presetAttributify } from "unocss";
import presetTheme from "unocss-preset-theme";
import { themeConfig } from "../src/config.ts";

const { light, dark } = themeConfig.color;
const respPrefixes = ["sm:", "md:", "lg:", "xl:", "2xl:"];

async function main() {
  console.log("\n  \u{1F504} 正在生成响应式 CSS...\n");

  // 1. Locate Layout CSS
  const distDir = join(process.cwd(), "dist/_astro");
  const files = readdirSync(distDir).filter(f => f.startsWith("Layout.") && f.endsWith(".css"));
  if (!files.length) { console.error("  \u2717 在 dist/_astro 中未找到布局 CSS 文件"); process.exit(1); }

  const cssPath = join(distDir, files[0]);
 let css = readFileSync(cssPath, "utf-8");
  console.log("  \u{1F4C4}  布局 CSS: " + files[0] + " (" + (css.length / 1024).toFixed(1) + " KB)");
 // 1.5 Dedup: remove any previous responsive CSS injection before regenerating
 const dedupCSS = css.replace(/\/\* unocss-responsive-injection \*\/[\s\S]*?$/, '');
 if (dedupCSS !== css) {
    writeFileSync(cssPath, dedupCSS);
    console.log("  \u{1F9F9}  移除了上一次注入的响应式 CSS (" + (css.length - dedupCSS.length) + " 字节)");
    css = dedupCSS;
}
 const dlCSS = css.replace(/\/\* desktop-layout-injected \*\/[\s\S]*?$/, '');
 if (dlCSS !== css) {
    writeFileSync(cssPath, dlCSS);
    console.log("  \u{1F9F9}  移除了上一次的 desktop-layout 注入");
    css = dlCSS;
  }

  // 2. Setup UnoCSS generator
  // WARNING: Config duplicated from uno.config.ts — keep colors, fonts, shortcuts in sync!
  const config = defineConfig({
    presets: [
      presetWind3(), presetAttributify(),
      presetTheme({ theme: { dark: { colors: { ...dark,
        note: "oklch(70.7% 0.165 254.624 / 0.8)", tip: "oklch(76.5% 0.177 163.223 / 0.8)",
        important: "oklch(71.4% 0.203 305.504 / 0.8)", warning: "oklch(82.8% 0.189 84.429 / 0.8)",
        caution: "oklch(70.4% 0.191 22.216 / 0.8)" } } } }),
    ],
    theme: {
      breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
      colors: { ...light,
        note: "oklch(48.8% 0.243 264.376 / 0.8)", tip: "oklch(50.8% 0.118 165.612 / 0.8)",
        important: "oklch(49.6% 0.265 301.924 / 0.8)", warning: "oklch(55.5% 0.163 48.998 / 0.8)",
        caution: "oklch(50.5% 0.213 27.518 / 0.8)" },
      fontFamily: { title: ["Snell-Black","EarlySummer-Subset","EarlySummer","ui-serif","Georgia","Cambria","Times New Roman","Times","serif"], navbar: ["STIX-Italic","EarlySummer-Subset","EarlySummer","ui-serif","Georgia","Cambria","Times New Roman","Times","serif"], time: ["Snell-Bold","ui-serif","Georgia","Cambria","Times New Roman","Times","serif"], serif: ["STIX","EarlySummer","ui-serif","Georgia","Cambria","Times New Roman","Times","serif"] },
    },
    shortcuts: {
      "uno-desktop-column": "absolute left-[min(calc(100vw-19rem),calc(50vw+21rem))] w-14rem",
      "c-primary": "text-primary", "text-footer": "text-2.5 leading-relaxed"
    }
  });
  const gen = await createGenerator(config);

  // 3a. Collect tokens from source files
  function findFiles(dir) {
    const r = [];
    try {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules")
          r.push(...findFiles(join(dir, e.name)));
        else if (e.name.endsWith(".astro") || e.name.endsWith(".ts"))
          r.push(join(dir, e.name));
      }
   } catch (err) { console.warn("  \u26A0  \u65E0\u6CD5\u8BFB\u53D6\u76EE\u5F55:", err.message); }
   return r;
 }
  // Attributify patterns to extract: responsive variants like lg="xxx yyy"
  const attrPatternRE = /\b(lg|md|sm|xl|2xl)\s*=\s*"([^"]+)"/g;

  const tokens = new Set();
  const splitRE = new RegExp('[\\\\:]?[\\s\'"`;{}<>]+', "g");
  
  let srcFiles = 0;
  for (const f of findFiles(join(process.cwd(), "src"))) {
    srcFiles++;
    try {
    const code = readFileSync(f, "utf-8");
      // Extract tokens from Attributify patterns like lg="mx-4 p-0"
      attrPatternRE.lastIndex = 0;
      let attrMatch;
      while ((attrMatch = attrPatternRE.exec(code)) !== null) {
        const attrVariant = attrMatch[1];
        const attrValues = attrMatch[2].split(/\s+/).filter(Boolean);
        for (const attrVal of attrValues) {
          tokens.add(attrVariant + ':' + attrVal);
        }
      }
      const expanded = code.replace(/[\w-]+:\([^)]*\)/g, function(m) {
        const idx = m.indexOf(":(");
        const variant = m.slice(0, idx);
        const group = m.slice(idx + 2, -1);
        return group.split(/\s+/).map(function(c) { return variant + ":" + c; }).join(" ");
      });
      const rawTokens = expanded.split(/\s+/).filter(Boolean);
      for (const raw of rawTokens) {
        if (raw.includes(":") || raw.startsWith("uno-") || raw.startsWith("op-")) {
          for (const t of raw.split(splitRE).filter(Boolean)) {
            if (t) tokens.add(t);
          }
        }
      }
    } catch (err) { console.warn("  \u26A0  \u8DF3\u8FC7\u6587\u4EF6:", err.message); }
  }
  console.log("  \u{1F4DA}  扫描了 " + srcFiles + " 个源文件，提取到 " + tokens.size + " 个变体标记");

  // 3b. Extract base class names from existing CSS and add responsive variants
  const baseClasses = new Set();
  const classRE = /\.([a-zA-Z0-9_-]+)(?=[{.,\s\\:])/g;
  let m;
  while ((m = classRE.exec(css)) !== null) {
    const cls = m[1];
    if (!cls.includes(":") && !cls.includes("\\") && cls.length > 0) {
      baseClasses.add(cls);
    }
  }
  for (const cls of baseClasses) {
    for (const bp of respPrefixes) {
      tokens.add(bp + cls);
    }
  }
  console.log("  \u{1F3AF}  为基础类添加了 " + baseClasses.size + " 个响应式变体标记");
  console.log("  \u26A1  总计 " + tokens.size + " 个标记");

  // 4. Generate CSS
  const result = await gen.generate(Array.from(tokens).join(" "));
  console.log("  \u{1F4DD}  生成了 " + (result.css.length / 1024).toFixed(1) + " KB）");

  
  // Safety net: fix malformed calc inside min/max with multiple calc calls
  // UnoCSS may generate calc(A,calc(B)) with missing paren, breaking CSS parser
  // This fixes calc(...,calc( to calc(...), calc( for balanced parens
  const resultCSS = result.css.replace(/calc\(([^,]+),calc\(/g, 'calc($1), calc(');

  // 5. Extract @media (min-width: ...) 条
  const mediaRules = [];
  let cur = "", depth = 0;
  for (const line of resultCSS.split("\n")) {
    if (line.startsWith("@media")) {
      if (cur && cur.includes("min-width")) mediaRules.push(cur);
      cur = line; depth = 1;
    } else if (depth > 0) {
      cur += "\n" + line;
      depth += (line.match(/\{/g)||[]).length - (line.match(/\}/g)||[]).length;
      if (depth <= 0) {
        if (cur.includes("min-width")) mediaRules.push(cur);
        cur = ""; depth = 0;
      }
    }
  }
  if (cur && cur.includes("min-width")) mediaRules.push(cur);

  // Count by breakpoint
  const byBP = {};
  for (const r of mediaRules) {
    const bp = r.match(/min-width:\s*(\d+)/);
    if (bp) {
      const key = bp[1] + "px";
      byBP[key] = (byBP[key] || 0) + 1;
    }
  }
  const bpSummary = Object.entries(byBP)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(function(e) { return e[0] + ": " + e[1] + " 条"; })
    .join(", ");

  // 6. Inject into CSS
  if (mediaRules.length > 0) {
    writeFileSync(cssPath, css + "\n/* unocss-responsive-injection */\n" + mediaRules.join("\n"));
    console.log("\n  \u2705  完成！注入了 " + mediaRules.length + " 条响应式 @media 规则");
    console.log("     断点分布：" + bpSummary);
  } else {
    console.log("\n  \u26A0  未生成任何响应式规则");
  }
  console.log("  \u{1F4C1}  输出文件：" + files[0] + "\n");
}

main().catch(function(e) { console.error("  \u2717 错误：", e.message); process.exit(1); });


