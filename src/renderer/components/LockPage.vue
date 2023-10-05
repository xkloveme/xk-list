<!--
 * @Date: 2023-10-05
 * @LastEditTime: 2023-10-05 17:58:51
 * @LastEditors: xkloveme
 * @FileDesc:锁屏页面
 * @FilePath: /xk-list/src/renderer/components/LockPage.vue
 * @Copyright © xkloveme
-->
<template>
  <div class="relative isolate text-center min-h-screen m-auto overflow-hidden bg-gray-900 py-16 sm:py-24 lg:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="max-w-xl lg:max-w-lg m-auto">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">您已锁定屏幕</h2>
        <p class="mt-4 text-lg leading-8 text-gray-300">需要输入密码解锁.</p>
        <div class="mt-6 flex flex-col">
          <input id="email-address" name="password" type="password" autocomplete="email" required
            class="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            placeholder="请输入密码">
          <button type="submit" @click="handleLockPage"
            class="flex-none my-4 rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">解锁</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
import { useUserStore } from "@renderer/store/modules/user";
const storeUser = useUserStore();
const handleGo = (path: string) => {
  router.push({
    path: path
  })
}
function handleLockPage () {
  console.log("===🐛=== ~ file: LockPage.vue:30 ~ storeUser:", storeUser);
  storeUser.IS_LOCK_CHANGE()
  handleGo('/')
}
onMounted(() => { });
</script>

<style scoped lang="scss"></style>
