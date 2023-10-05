<!--
 * @Date: 2023-10-04
 * @LastEditTime: 2023-10-05 13:41:14
 * @LastEditors: xkloveme
 * @FileDesc 编辑页
 * @FilePath: /xk-list/src/renderer/views/edit/index.vue
 * @Copyright © xkloveme
-->
<template>
  <div class="main">
    {{ route.query.id}}
    {{ user }}
    <el-input v-model="user.name" />
    <el-input v-model="user.sex" />
    el-button
    <el-button type="primary" @click="submit">提交</el-button>
    <el-button type="primary" @click="Close">关闭</el-button>
  </div>
</template>

<script setup>
import { useUserStore } from "@renderer/store/modules/user";
const storeUser = useUserStore();
const props = defineProps({})
const route = useRoute();
let user = storeUser.$state.editTable[route.query.id]

function submit() {

}

console.log("===🐛=== ~ file: index.vue:17 ~ route:",route,route.query.id,user,storeUser.$state.editTable);
const Close = () => {
  invoke(IpcChannel.WindowClose);
};
onMounted(() => {});
</script>

<style scoped lang="scss"></style>
