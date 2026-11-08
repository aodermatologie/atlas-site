// Atlas, ouvert de dermatologie — configuration Astro.
// Les pages sont générées à l'avance (statiques) ; seules les routes /api/* tournent sur le serveur.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { unified } from '@astrojs/markdown-remark';
import rehypeFiche from './src/plugins/rehype-fiche.mjs';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://aodermatologie.org',
  output: 'static',
  adapter: node({ mode: 'middleware' }), // servi par server.mjs (Express), qui ajoute les en-têtes de sécurité
  integrations: [react()],
  // Fiches : sections repliables et encadrés (voir src/plugins/rehype-fiche.mjs)
  markdown: { processor: unified({ rehypePlugins: [rehypeFiche] }) },
  build: { format: 'directory' },
  security: { checkOrigin: true },
  devToolbar: { enabled: false },
});
