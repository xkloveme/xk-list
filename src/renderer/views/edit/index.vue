<!--
 * @Date: 2023-10-04
 * @LastEditTime: 2023-10-09 11:09:52
 * @LastEditors: xkloveme
 * @FileDesc 编辑页
 * @FilePath: /xk-list/src/renderer/views/edit/index.vue
 * @Copyright © xkloveme
-->
<template>
  <div class="main">
    {{ route.query }}


    {{ user }}
    <el-input v-model="user.name" />
    <el-input v-model="user.sex" />
    <el-button type="primary" @click="submit(null,null)">提交</el-button>
    <el-button type="primary" @click="Close">关闭</el-button>

    <el-input v-model="user.desc" type="textarea" />
    <el-button type="primary" @click="AddLog(true)">同意</el-button>
    <el-button type="primary" @click="AddLog(false)">不同意</el-button>

  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { invoke, vueListen } from "@renderer/utils/ipcRenderer";
import { IpcChannel } from "@/ipc";
import { useUserStore } from "@renderer/store/modules/user";
const storeUser = useUserStore();
const props = defineProps({})
const route = useRoute();


vueListen(IpcChannel.SendDataTest, (event, data) => {
  console.log(222, event)
  console.log(2222, data)
})
let user = ref(storeUser.$state.editTable[route.query.id] || {})

async function submit (logStr = '', type = 'warning') {
  const success = await invoke(IpcChannel.AddFile, { isDir: false, name: `${dayjs().format('YYYYMMDDHHmmss')}${user.value.name}.wt`, log: logStr, type: type, path: route.query.path, id: route.query.id, content: JSON.stringify(user.value) })
  if (success) {
    ElMessage({
      type: 'success',
      message: route.query.id ? "文件修改成功" : `文件新建成功`,
    })
    storeUser.DEL_DATA_ACTION(route.query.id)
    Close()
  } else {
    ElMessage({
      type: 'error',
      message: route.query.id ? "文件修改失败" : `文件新建失败`,
    })
  }
}

function AddLog (isAgree) {
  if (isAgree) {
    submit('同意', 'success')
  } else {
    submit('不同意', 'error')
  }

}


console.log("===🐛=== ~ file: index.vue:17 ~ route:", route, route.query.id, user, storeUser.$state.editTable);
const Close = () => {
  invoke(IpcChannel.WindowClose);
};
onMounted(() => { });
</script>

<style scoped lang="scss"></style>
