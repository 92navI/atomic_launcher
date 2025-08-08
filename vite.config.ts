import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';

const alias = {
  '@main': path.resolve(__dirname, 'atomic-electron-app'),
  '@renderer': path.resolve(__dirname, 'atomic-renderer-ui'),
  '@shared': path.resolve(__dirname, 'atomic-shared'),
  '@public': path.resolve(__dirname, 'public'),
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias,
  },
  root: './atomic-react-ui',
  cacheDir: './.vite-cache',
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: path.join(__dirname, './atomic-electron-app/src/main.ts'),
        vite: {
          build: {
            outDir: path.join(__dirname, './dist-electron'),
            rollupOptions: {
              external: ['electron'],
            },
          },
          resolve: {
            alias,
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(
          __dirname,
          './atomic-electron-app/src/preload/preload.ts'
        ),
        vite: {
          build: {
            outDir: path.join(__dirname, './dist-electron/preload'),
            emptyOutDir: true,
          },
          resolve: {
            alias,
          },
        },
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {},
    }),
  ],
  build: {
    outDir: path.join(__dirname, './dist/'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.join(__dirname, './atomic-react-ui/src/index.html'),
        download: path.join(
          __dirname,
          './atomic-react-ui/src/windows/download/index.html'
        ),
        splash: path.join(
          __dirname,
          './atomic-react-ui/src/windows/splash/index.html'
        ),
      },
    },
  },
});
