<template>
  <el-row class="mt-10">
    <el-button>Default</el-button>
    <el-button type="primary" @click="saveZip({})">生成压缩文件</el-button>

    <el-upload class="avatar-uploader" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
      :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
      <el-button type="success">上传WT</el-button>
    </el-upload>
    <el-button type="info" @click="openNewWinEdit">打开编辑表单</el-button>
    <el-button type="info" @click="browserDemo">浏览器</el-button>
    <el-button type="warning" @click="printDemo">打印</el-button>
    <el-button type="danger" @click="handleGo('/about')">关于</el-button>

    <div class="i-vscode-icons-file-type-vue text-5xl"></div>
    <div class="i-vscode-icons-file-type-objidconfig?mask text-red-500"></div>

  </el-row>
  <div class="mt-10">
    <el-input v-model="input" placeholder="Please input" />
    <el-button type="info" @click="addLog">添加日志</el-button>
  </div>
  {{ log }}

  <el-button type="info" @click="addFile">新增文件</el-button>
  <el-button type="info" @click="addFolder">新增文件夹</el-button>
  <el-button type="warning" @click="printDemo">编辑文件</el-button>
  <el-button type="danger" @click="handleGetFileList">文件列表</el-button>
  <el-input v-model="query" placeholder="Please enter keyword" @input="onQueryChanged" />
  <el-tree-v2 ref="treeRef" @node-expand="nodeExpand" @node-collapse="nodeCollapse" highlight-current :data="FileList"
    :filter-method="filterMethod" :height="508">
    <template #default="{ node }">
      <span :class="[{
        // 'i-vscode-icons-file-type-twig': node.data.isFile && node.isLeaf,
    'i-vscode-icons-file-type-turbo animate-spin': node.data.isFile && true
      },
      node.data.opened ? 'i-vscode-icons-default-folder-opened' : 'i-vscode-icons-default-folder']"></span>
      <span>{{ node.label }}</span>
    </template>
  </el-tree-v2>
</template>

<script lang="ts" setup>
import JSZip from 'jszip'
import { useI18n } from "vue-i18n";
import { invoke } from "@renderer/utils/ipcRenderer";
import { IpcChannel } from "@/ipc";
import type { UploadProps } from 'element-plus'
import { ElTreeV2 } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'
const router = useRouter();
const { t } = useI18n();
const handleGo = (path: string) => {
  router.push({
    path: path
  })
}
function printDemo() {
  invoke(IpcChannel.OpenPrintDemoWindow);
}

function browserDemo() {
  invoke(IpcChannel.OpenBrowserDemoWindow);
}
let FileList: any = ref<string[]>([]);
async function handleGetFileList() {
  FileList.value = await invoke(IpcChannel.FileList);
}
handleGetFileList()
const query = ref('')
const treeRef = ref<InstanceType<typeof ElTreeV2>>()

const onQueryChanged = (query: string) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  treeRef.value!.filter(query)
}
const filterMethod = (query: string, node: TreeNode) => {
  return node.label!.includes(query)
}

function nodeExpand(data, node) {
  node.data.opened = true
}
function nodeCollapse(data, node) {
  node.data.opened = false
}

async function addFolder() {
  let currentNode = treeRef.value!.getCurrentNode()
  const success = await invoke(IpcChannel.AddFile, { isDir: true, path: currentNode?.filePath, name: `newFolder${new Date()}` })
  success && handleGetFileList()
}
async function addFile() {
  let currentNode = treeRef.value!.getCurrentNode()
  console.log("===🐛=== ~ file: index.vue:94 ~ addFile ~ currentNode:", currentNode);
  const success = await invoke(IpcChannel.AddFile, { isDir: false, path: currentNode?.filePath, name: `newFolder${new Date()}.wt`, content: '11' })
  success && handleGetFileList()
  console.log("===🐛=== ~ file: index.vue:96 ~ addFile ~ success:", success);
}


function openNewWinEdit() {
  let data = {
    url: "/edit",
  };
  invoke(IpcChannel.OpenWin, data);
}
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  console.log("===🐛=== ~ file: index.vue:47 ~ rawFile:", rawFile);
  if (rawFile.type !== '') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
let input = ref('')
let log = ref({})
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  console.log("===🐛=== ~ file: index.vue:60 ~ uploadFile:", uploadFile);
  JSZip.loadAsync(uploadFile.raw!).then((zip) => {
    console.log("===🐛=== ~ file: index.vue:64 ~ JSZip.loadAsync ~ zip:", zip);
    zip.files['log.json'].async('text').then((res) => {
      console.log("===🐛=== ~ file: index.vue:61 ~ zip.files['log.json'].async ~ res:", res);
      log.value = JSON.parse(res)
    })
  })
}
function addLog() {
  log.value[new Date().getTime()] =
    { type: 'info', title: input.value }
  saveZip(log.value)
}
function saveZip(loginfo: object) {
  const zip = new JSZip();
  let user = {
    name: '小康2',
    sex: '男'
  }
  zip.file('user.json', JSON.stringify(user))
  zip.file("log.json", JSON.stringify(loginfo));
  zip.generateAsync({ type: "blob", comment: `${user.name},${user.sex}` }).then(function (content) {
    // see FileSaver.js
    var filename = user.name + '.wt'
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a')
    eleLink.download = filename
    eleLink.style.display = 'none'
    // 下载内容转变成blob地址
    eleLink.href = URL.createObjectURL(content)
    // 触发点击
    document.body.appendChild(eleLink)
    eleLink.click()
    // 然后移除
    document.body.removeChild(eleLink)
  });
}
</script>


<style scoped lang="scss"></style>
