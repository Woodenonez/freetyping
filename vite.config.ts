import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubPagesBase = process.env.GITHUB_PAGES_BASE;

export default defineConfig({
  base: githubPagesBase && githubPagesBase.length > 0 ? githubPagesBase : '/',
  plugins: [react()],
});
