// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import image from '@astrojs/image';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
    site: 'https://astro.cgartlab.com',
    integrations: [mdx(), sitemap(), image(), icon()],
});