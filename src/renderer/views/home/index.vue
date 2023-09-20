
 * @Date: 2023-09-20
 * @LastEditTime: 2023-09-20 20:47:11
 * @LastEditors: xkloveme
 * @FileDesc: 首页
 * @FilePath:/
 * @Copyright © xkloveme

 <template>
   <el-row class="mt-10">
    <el-button>Default</el-button>
    <el-button type="primary">Primary</el-button>
    <el-button type="success">Success</el-button>
    <el-button type="info" @click="browserDemo">浏览器</el-button>
    <el-button type="warning" @click="printDemo">打印</el-button>
    <el-button type="danger" @click="handleGo('/about')">关于</el-button>
    
    <div class="i-vscode-icons-file-type-vue text-3xl"></div>
    <div class="i-vscode-icons-file-type-objidconfig?mask text-red-500"></div>
    
  </el-row>
</template>

<script lang="ts" setup>
import { invoke } from "@renderer/utils/ipcRenderer";
import { IpcChannel } from "@/ipc";
const router = useRouter();
const handleGo = (path: string) => {
  router.push({
    path:path
  })
}
function printDemo() {
  invoke(IpcChannel.OpenPrintDemoWindow);
}

function browserDemo() {
  invoke(IpcChannel.OpenBrowserDemoWindow);
}

</script>


<style scoped lang="scss"></style>


<style scoped lang="scss"></style>
