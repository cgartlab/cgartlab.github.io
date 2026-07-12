import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = 'dist/_astro'
const files = readdirSync(distDir).filter(f => f.startsWith('Layout.') && f.endsWith('.css'))
if (files.length === 0) {
  console.error('No Layout CSS file found in', distDir)
  process.exit(1)
}

 const cssPath = join(distDir, files[0])
 let css = readFileSync(cssPath, 'utf-8')
 // Dedup: remove previous desktop-layout injection before appending
 const cleaned = css.replace(/\/\* desktop-layout-injected \*\/[\s\S]*$/, '')
if (cleaned !== css) {
  writeFileSync(cssPath, cleaned)
  console.log('  Removed previous desktop-layout injection')
  css = cleaned
}

// Strip broken UnoCSS-responsive .lg\: classes that lack @media wrapping
// These are correctly handled by the attribute-selector rules inside @media below
css = css.replace(/\.lg\\:uno-desktop-column\{[^}]*\}\s*/g, '');
css = css.replace(/\.lg\\:left-\[min\([^;]*;[^}]*\}\s*/g, '');
// Strip other responsive .lg\: classes that would cascade outside @media (breaks mobile)
css = css.replace(/\.lg\\:(?:container|pointer-events-none|visible|absolute|fixed|relative|bottom-16\.5rem|bottom-17rem|bottom-28|bottom-6|left--10|right-6|right-7|top-14|top-3|top-20|z-50|grid|flex|inline-flex|flex-col|flex-wrap|items-center|justify-center|h-30|w-full|w-14rem|gap-0|gap-6|gap-x-3|gap-y-2|hidden|block|inline-block|text-4|text-4\.5|text-9|text-3\.5|text-3\.6|leading-1\.4em|leading-2\.45em|font-bold|font-medium|font-navbar|mb-10\.5|mb-17\.2|mb-7\.5|mt-12\.6|mt-2|mt-4|mt-5|mt-3|p-0|my-20|min-h-full|max-w-205\.848|max-w-\[min\([^\]]*\]|mx-\[max\([^\]]*\]|top-auto|right-auto|ml-8|hover\:c-primary)\{[^}]*\}\s*/g, '');
 
const fallback = "\n\n/* desktop-layout-injected */\n@media (min-width: 1024px) {\n[class*=\"lg:flex-col\"]{flex-direction:column}\n[class*=\"lg:gap-0\"]{gap:0}\n[class*=\"lg:text-4\"]{font-size:1rem}\n[class*=\"lg:p-0\"]{padding:0}\n[class*=\"lg:my-20\"]{margin-top:5rem;margin-bottom:5rem}\n[class*=\"lg:min-h-full\"]{min-height:100%}\n[class*=\"lg:mx-[max(5.75rem,calc(50vw-34.25rem))]\"]{margin-left:max(5.75rem,calc(50vw - 34.25rem));margin-right:max(5.75rem,calc(50vw - 34.25rem))}\n[class*=\"lg:max-w-[min(calc(75vw-16rem),44rem)]\"]{max-width:min(calc(75vw - 16rem),44rem)}\n[class*=\"lg:hidden\"]{display:none}\n[class*=\"lg:w-full\"]{width:100%}\n[class*=\"lg:w-14rem\"]{width:14rem}\n[class*=\"lg:text-4.5\"]{font-size:1.125rem}\n[class*=\"lg:font-medium\"]{font-weight:500}\n[class*=\"lg:bottom-17rem\"]{bottom:17rem}\n[class*=\"lg:left-[min(calc(100vw-19rem),calc(50vw+21rem))]\"]{left:min(calc(100vw - 19rem),calc(50vw + 21rem))}\n[class*=\"lg:right-auto\"]{right:auto}\n[class*=\"lg:top-auto\"]{top:auto}\n[class*=\"lg:mt-4\"]{margin-top:1rem}\n[class*=\"lg:text-9\"]{font-size:2.25rem}\n[class*=\"lg:uno-desktop-column\"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\n[class*=\"lg:fixed\"]{position:fixed}\n[class*=\"lg:top-20\"]{top:5rem}\n[class*=\"lg:bottom-16.5rem\"]{bottom:16.5rem}\n[class*=\"lg:bottom-28\"]{bottom:7rem}\n[class*=\"lg:leading-2.45em\"]{line-height:2.45em}\n[lg~=\"uno-desktop-column\"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\n[lg~=\"fixed\"]{position:fixed}\n[lg~=\"bottom-28\"]{bottom:7rem}\n}\n"

writeFileSync(cssPath, css + fallback)
console.log('Injected desktop layout CSS into', files[0])
