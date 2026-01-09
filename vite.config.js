import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import path from 'path';

export default defineConfig(({ mode }) => {
  const root = process.cwd();
  loadEnv(mode, root);

  return {
    plugins: [
      uni(),
      AutoImport({
        imports: ['vue', 'uni-app'],
      }),
      VueSetupExtend(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'dayjs/esm/index': 'dayjs',
      },
    },

    optimizeDeps: {
      include: ['dayjs'],
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },

    build: {
      minify: 'esbuild',
      esbuild: {
        drop: ['console', 'debugger'],
      },
    },
  };
});
