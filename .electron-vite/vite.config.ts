import { join } from "path";
import { defineConfig } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { getConfig } from "./utils";
import viteIkarosTools from "./plugin/vite-ikaros-tools";
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

function resolve(dir: string) {
  return join(__dirname, "..", dir);
}
const config = getConfig();

const root = resolve("src/renderer");

export default defineConfig({
  mode: config && config.NODE_ENV,
  root,
  define: {
    __CONFIG__: config,
  },
  resolve: {
    alias: {
      "@": resolve("src"),
      "@renderer": resolve("src/renderer"),
    },
  },
  base: "./",
  build: {
    outDir:
      config && config.target
        ? resolve("dist/web")
        : resolve("dist/electron/renderer"),
    emptyOutDir: true,
    target: "esnext",
    cssCodeSplit: false,
  },
  server: {},
  plugins: [UnoCSS(), vueJsx(), vuePlugin(), viteIkarosTools(),
  AutoImport({
    resolvers: [ElementPlusResolver()],
    include: [
      /\.[tj]sx?$/,
      /\.vue$/,
      /\.vue\?vue/,
      /\.md$/,
    ],

    // global imports to register
    imports: [
      // 插件预设支持导入的api
      'vue',
      'vue-router',
      'pinia'
      // 自定义导入的api
    ],
    dts: './../../customTypes/auto-imports.d.ts',
  }),
  Components({
    resolvers: [ElementPlusResolver()],
    dts: './../../customTypes/components.d.ts',
  }),],
  optimizeDeps: {},
});
