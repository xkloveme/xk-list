<!--
 * @Date: 2023-10-04
 * @LastEditTime: 2023-10-05 13:43:24
 * @LastEditors: xkloveme
 * @FileDesc 首页
 * @FilePath: /xk-list/src/renderer/views/home/index.vue
 * @Copyright © xkloveme
-->
<template>
  <div class="main">
    <el-page-header class="mx-6">
      <template #title>
        <span class="text-3xl font-600">数据收集</span>
      </template>
      <template #icon>
        <i class="i-vscode-icons-file-type-wercker text-4xl" />
      </template>
      <template #content>
        <div class="flex items-center">
          <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
            {{ description }}
          </span>
          <el-tag>{{ version }}</el-tag>
        </div>
      </template>
      <template #extra>
        <div class="flex items-center">
          <el-button>Print</el-button>
          <el-button type="primary" class="ml-2">Edit</el-button>
        </div>
      </template>
    </el-page-header>
    <el-divider>
      <div class="i-vscode-icons-file-type-tuc animate-spin"></div>
    </el-divider>
    <div class="mx-2">
      <el-container>
        <el-aside width="450px">
          <el-input v-model="query" placeholder="请输入关键词" @input="onQueryChanged" />
          <el-tree-v2 ref="treeRef" @node-click="nodeClick" @node-expand="nodeExpand" @node-collapse="nodeCollapse"
            highlight-current :data="FileList" :filter-method="filterMethod" :height="700">
            <template #default="{ node }">
              <span v-if="node.data.isFile" :class="[{
                'i-vscode-icons-file-type-twig': node.data.isFile && node.isLeaf,
                // 'i-vscode-icons-file-type-turbo animate-spin': node.data.isFile && true
              }, 'text-md']">
              </span>
              <span v-if="node.data.isDirectory"
                :class="[
                  node.data.opened ? 'i-vscode-icons-default-folder-opened' : 'i-vscode-icons-default-folder', 'text-md inline-block']">
              </span>
              <p class="truncate" :title="node.label">{{ node.label }}</p>
            </template>
          </el-tree-v2>
        </el-aside>
        <el-main>
          <div v-if="isEmpty">
            <el-empty description="暂未选择WT文件">
              <el-button type="success" plain>
                <template #icon>
                  <i class="i-vscode-icons-file-type-twig?mask"></i>
                </template>
                新建WT文件</el-button>
              <el-button type="warning" plain>
                <template #icon>
                  <i class="i-vscode-icons-default-folder?mask"></i>
                </template>
                新建文件夹</el-button>
            </el-empty>
          </div>
          <div v-else>
            <div class="flex flex-col justify-center items-center m-4">
              <el-avatar :size="80" class="hover:animate-spin">
                <div class="i-vscode-icons-file-type-twig text-6xl" />
              </el-avatar>
              <div class="mt-4 text-lg text-green-9 ">{{ currentNode.label }}</div>
            </div>
            <el-row class="text-center">
              <el-col :span="12">
                <el-statistic title="创建时间" :value="null">
                  <template #suffix>
                    {{ currentNode.createdAt }}
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="12">
                <el-statistic title="修改时间" :value="null">
                  <template #suffix>
                    {{ currentNode.updatedAt }}
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="24" class="mt-6">
                <el-button type="success" plain @click="handleEditData">
                  <template #icon>
                    <i class="i-vscode-icons-file-type-twig?mask"></i>
                  </template>
                  点击编辑文件</el-button>
                <el-button type="warning" plain @click="toggleDrawer">
                  <template #icon>
                    <i class="i-vscode-icons-file-type-log?mask"></i>
                  </template>
                  查看文件日志</el-button>
              </el-col>
            </el-row>
          </div>
        </el-main>
      </el-container>
    </div>
    <el-drawer v-model="drawer" title="WT文件完善的日志信息" :before-close="handleClose">
      <div class="flex flex-col justify-center items-center">
        <el-avatar :size="80" class="hover:animate-spin">
          <div class="i-vscode-icons-file-type-twig text-6xl" />
        </el-avatar>
        <div class="my-4 text-lg text-green-9 ">{{ currentNode.label }}</div>
      </div>
      <el-timeline>
        <el-timeline-item v-for="(activity, key) of log" :key="key" :type="activity.type" :timestamp="String(key)">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import { ElMessageBox } from 'element-plus'
import { invoke } from "@renderer/utils/ipcRenderer";
import { IpcChannel } from "@/ipc";
import type { UploadProps } from 'element-plus'
import { ElTreeV2 } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'
import { useUserStore } from "@renderer/store/modules/user";
interface TreeNodeList {
  id: string;
  label: string;
  filePath: string;
  children?: TreeNodeList[];
  isDirectory: boolean;
  isFile: boolean;
  createdAt: string;
  updatedAt: string;
}
const storeUser = useUserStore();
const route = useRoute();
let packageJson = require("./package.json")
let version = packageJson.version
let description = packageJson.description

let isEmpty = ref(true)

let FileList: any = ref<string[]>([]);
async function handleGetFileList() {
  FileList.value = await invoke(IpcChannel.FileList);
}

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
let currentNode = ref<TreeNodeList>()
function nodeClick(data, node) {
  currentNode.value = data
  isEmpty.value = data.isDirectory
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

const drawer = ref(false)
// 'primary' | 'success' | 'warning' | 'danger' | 'info'
const log = ref([])
async function toggleDrawer() {
  drawer.value = true
  const data = await invoke(IpcChannel.ReadFile, { path: currentNode.value.filePath })
  JSZip.loadAsync(data).then((zip) => {
    zip.files['log.json'].async('text').then((res) => {
      log.value = JSON.parse(res)
    })
  })
}
const handleClose = (done: () => void) => {
  ElMessageBox.confirm('您确定要关闭弹窗么？')
    .then(() => {
      done()
    })
    .catch(() => {
    })
}
async function handleEditData() {
  const data = await invoke(IpcChannel.ReadFile, { path: currentNode.value.filePath })
  JSZip.loadAsync(data).then((zip) => {
    zip.files['user.json'].async('text').then((res) => {
      console.log("===🐛=== ~ file: index.vue:219 ~ zip.files['user.json'].async ~ res:", res);
      storeUser.EDIT_DATA_ACTION(currentNode.value.id, JSON.parse(res));
      openNewWinEdit(currentNode.value.id, currentNode.value.filePath)
    })
  })
}


function openNewWinEdit(id, path) {
  let data = {
    url: `/edit?id=${id}&path=${path}`
  };
  invoke(IpcChannel.OpenWin, data);
}
onMounted(() => {
  handleGetFileList()
});
</script>

<style scoped lang="scss"></style>
