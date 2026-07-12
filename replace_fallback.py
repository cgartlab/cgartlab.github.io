import re

with open(r'D:\github-repos\cgartlab.github.io\scripts\inject-desktop-layout.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'const fallback = "\\n\\n/* desktop-layout-injected */\\n@media (min-width: 1024px) {\\n[class*="lg:uno-desktop-column"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\\n[class*="lg:fixed"]{position:fixed}\\n[class*="lg:top-20"]{top:5rem}\\n[class*="lg:bottom-16.5rem"]{bottom:16.5rem}\\n[class*="lg:bottom-28"]{bottom:7rem}\\n[class*="lg:leading-2.45em"]{line-height:2.45em}\\n[lg~="uno-desktop-column"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\\n[lg~="fixed"]{position:fixed}\\n[lg~="bottom-28"]{bottom:7rem}\\n}\\n"'

new = 'const fallback = "\\n\\n/* desktop-layout-injected */\\n@media (min-width: 1024px) {\\n[class*="lg:flex-col"]{flex-direction:column}\\n[class*="lg:gap-0"]{gap:0}\\n[class*="lg:text-4"]{font-size:1rem}\\n[class*="lg:p-0"]{padding:0}\\n[class*="lg:my-20"]{margin-top:5rem;margin-bottom:5rem}\\n[class*="lg:min-h-full"]{min-height:100%}\\n[class*="lg:mx-[max(5.75rem,calc(50vw-34.25rem))]"]{margin-left:max(5.75rem,calc(50vw - 34.25rem));margin-right:max(5.75rem,calc(50vw - 34.25rem))}\\n[class*="lg:max-w-[min(calc(75vw-16rem),44rem)]"]{max-width:min(calc(75vw - 16rem),44rem)}\\n[class*="lg:hidden"]{display:none}\\n[class*="lg:w-full"]{width:100%}\\n[class*="lg:w-14rem"]{width:14rem}\\n[class*="lg:text-4.5"]{font-size:1.125rem}\\n[class*="lg:font-medium"]{font-weight:500}\\n[class*="lg:bottom-17rem"]{bottom:17rem}\\n[class*="lg:left-[min(calc(100vw-19rem),calc(50vw+21rem))]"]{left:min(calc(100vw - 19rem),calc(50vw + 21rem))}\\n[class*="lg:right-auto"]{right:auto}\\n[class*="lg:top-auto"]{top:auto}\\n[class*="lg:mt-4"]{margin-top:1rem}\\n[class*="lg:text-9"]{font-size:2.25rem}\\n[class*="lg:uno-desktop-column"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\\n[class*="lg:fixed"]{position:fixed}\\n[class*="lg:top-20"]{top:5rem}\\n[class*="lg:bottom-16.5rem"]{bottom:16.5rem}\\n[class*="lg:bottom-28"]{bottom:7rem}\\n[class*="lg:leading-2.45em"]{line-height:2.45em}\\n[lg~="uno-desktop-column"]{position:absolute;left:min(calc(100vw - 19rem),calc(50vw + 21rem));width:14rem}\\n[lg~="fixed"]{position:fixed}\\n[lg~="bottom-28"]{bottom:7rem}\\n}\\n"'

assert old in content, 'OLD STRING NOT FOUND IN FILE!'
content = content.replace(old, new)
with open(r'D:\github-repos\cgartlab.github.io\scripts\inject-desktop-layout.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Replacement successful')
