<!--
 * @Date: 2023-10-04
 * @LastEditTime: 2023-10-09 10:44:46
 * @LastEditors: xkloveme
 * @FileDesc 首页
 * @FilePath: /xk-list/src/renderer/views/home/index.vue
 * @Copyright © xkloveme
-->
<template>
  <div class="main">
    <el-page-header class="mx-6" style="-webkit-app-region: drag">
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
        <div class="flex items-center" style="-webkit-app-region: no-drag">
          <el-button circle plain type="primary" @click="handleLockPage">
            <template #icon>
              <i class="i-vscode-icons-file-type-light-codeowners?mask text-4xl" />
            </template>
          </el-button>
          <el-button @click="handleGo('/about')" circle plain type="warning" class="ml-2"><template #icon>
              <i class="i-vscode-icons-file-type-config?mask text-4xl" />
            </template></el-button>
        </div>
      </template>
    </el-page-header>
    <el-divider style="-webkit-app-region: drag">
      <div class="i-vscode-icons-file-type-tuc animate-spin"></div>
    </el-divider>
    <div class="mx-2">
      <el-container>
        <el-aside width="450px">
          <div class="flex justify-between items-center text-md mb-1">
            <h2>文件资源</h2>
            <div class="flex items-center">
              <el-tooltip class="box-item" effect="dark" content="新增文件" placement="top">
                <el-button type="success" @click="openNewWinEdit('', null)" plain circle>
                  <template #icon>
                    <i class="i-vscode-icons-file-type-twig?mask"></i>
                  </template>
                </el-button>
              </el-tooltip>
              <el-tooltip class="box-item" effect="dark" content="新增文件夹" placement="top">
                <el-button type="warning" @click="handleAddFolder" plain circle>
                  <template #icon>
                    <i class="i-vscode-icons-default-folder?mask"></i>
                  </template>
                </el-button>
              </el-tooltip>
              <el-tooltip class="box-item" effect="dark" content="刷新" placement="top">
                <el-button type="primary" @click="refreshTree" plain circle>
                  <template #icon>
                    <i class="i-vscode-icons-file-type-codacy?mask"></i>
                  </template>
                </el-button>
              </el-tooltip>
              <el-tooltip class="box-item" effect="dark" content="删除" placement="top">
                <el-button type="danger" :disabled="!currentNode" @click="delTree" plain circle>
                  <template #icon>
                    <i class="i-vscode-icons-file-type-xib?mask"></i>
                  </template>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <el-input v-model="query" placeholder="请输入关键词" @input="onQueryChanged" />
          <el-tree-v2 ref="treeRef" @node-click="nodeClick" @node-expand="nodeExpand" @node-collapse="nodeCollapse"
            highlight-current :data="FileList" :filter-method="filterMethod" :height="treeHeight">
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
              <el-button type="success" plain @click="openNewWinEdit('', null)">
                <template #icon>
                  <i class="i-vscode-icons-file-type-twig?mask"></i>
                </template>
                新建WT文件</el-button>
              <el-button type="warning" plain @click="handleAddFolder">
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
    <el-drawer v-model="drawer" size="50%" title="WT文件完善的日志信息" :before-close="handleClose">
      <div class="flex flex-col justify-center items-center">
        <el-avatar :size="80" class="hover:animate-spin">
          <div class="i-vscode-icons-file-type-twig text-6xl" />
        </el-avatar>
        <div class="my-4 mx-2 text-lg text-green-9 ">{{ currentNode.label }}</div>
      </div>
      <el-timeline>
        <el-timeline-item v-for="(activity, key) of log" :key="key" :type="activity.type" :timestamp="String(key)">
          {{ activity.title }}:
          <el-button @click="handleOpenLog(activity)" type="primary" size="small" plain round>日志详情</el-button>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
    <el-dialog v-model="dialogVisible" title="日志详情" width="80%">
      <el-switch v-model="showCodeAll" @change="handleShowChangeCode" active-text="展示全部" inactive-text="仅展示不同"
        active-color="#13ce66" />
      <div id="terminal" class="bg-black text-indigo rounded py-2 min-h-md" v-html="diffString"></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">
            关闭
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import "jsondiffpatch/dist/formatters-styles/html.css";
import { formatters } from 'jsondiffpatch';
import JSZip from 'jszip'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { invoke, vueListen } from "@renderer/utils/ipcRenderer";
import { IpcChannel } from "@/ipc";
import { ElTreeV2 } from 'element-plus'
import type { TreeNode } from 'element-plus/es/components/tree-v2/src/types'
import { useUserStore } from "@renderer/store/modules/user";
import { version, description } from "../../../../package.json";
interface TreeNodeList {
  id: string;
  label: string;
  filePath: string;
  children?: TreeNodeList[];
  opened: boolean;
  isDirectory: boolean;
  isFile: boolean;
  createdAt: string;
  updatedAt: string;
}



let dialogVisible = ref(false)
let showCodeAll = ref(false)
let diffString = ref('')
let zipUserJson = ref({})
function handleOpenLog(activity) {
  dialogVisible.value = true
  showCodeAll.value = false
  nextTick(() => {
    diffString.value = formatters.html.format(activity.content, zipUserJson.value)
    formatters.html.hideUnchanged()
  })
}
function handleShowChangeCode(value) {
  if (value) {
    formatters.html.showUnchanged(true)
  } else {
    formatters.html.hideUnchanged()
  }
}

const storeUser = useUserStore();
const route = useRoute();
const router = useRouter();
let treeHeight = computed(() => document.documentElement.clientHeight - 225)
const handleGo = (path: string) => {
  router.push({
    path: path
  })
}
let isEmpty = ref(true)

let FileList: any = ref<string[]>([]);

const query = ref('')
let currentNode = ref<TreeNodeList>()
const treeRef = ref<InstanceType<typeof ElTreeV2>>()

async function handleGetFileList() {
  FileList.value = await invoke(IpcChannel.FileList);
}
async function refreshTree() {
  isEmpty.value = true
  treeRef.value!.setCurrentKey(null)
  currentNode.value = null
  await handleGetFileList()
}
async function delTree() {
  const success = await invoke(IpcChannel.DelFile, { isDir: currentNode.value?.isDirectory, path: currentNode.value?.filePath });
  if (success) {
    ElMessage.success('删除成功')
    refreshTree()
  } else {
    ElMessage.error('删除失败，请检查文件夹下是否有内容')
  }
}
const onQueryChanged = (query: string) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  treeRef.value!.filter(query)
}
const filterMethod = (query: string, node: TreeNode) => {
  return node.label!.includes(query)
}

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
function handleAddFolder() {
  ElMessageBox.prompt('请输入文件名', '添加文件名', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: `[${dayjs().format('YYYY-MM-DD')}]`,
    inputPattern:
      /^.{1,20}$/,
    inputErrorMessage: '1-20位长度',
  })
    .then(async ({ value }) => {
      const success = await invoke(IpcChannel.AddFile, { isDir: true, path: currentNode.value?.filePath, name: value })
      success && handleGetFileList()
      ElMessage({
        type: 'success',
        message: `文件夹新建成功:${value}`,
      })
    })
}



const drawer = ref(false)
// 'primary' | 'success' | 'warning' | 'danger' | 'info'
const log = ref([])
async function toggleDrawer() {
  drawer.value = true
  const data = await invoke(IpcChannel.ReadFile, { path: currentNode.value.filePath })
  JSZip.loadAsync(data).then((zip) => {
    zip.files['user.json'].async('text').then((res) => {
      zipUserJson.value = JSON.parse(res)
    })
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
  JSZip.loadAsync(data!).then((zip) => {
    zip.files['user.json'].async('text').then((res) => {
      storeUser.EDIT_DATA_ACTION(currentNode.value.id, JSON.parse(res));
      openNewWinEdit(currentNode.value.id, currentNode.value.filePath, false)
    })
  })
}
function handleLockPage() {
  storeUser.IS_LOCK_CHANGE()
  handleGo('/lock')
}

function openNewWinEdit(id, path, isAdd = true) {
  let newPath = path || currentNode.value?.filePath || ''
  if (isAdd && currentNode.value?.isFile) {
    newPath = currentNode.value?.filePath.replace(currentNode.value?.label, "")
  }
  let data = {
    url: `/edit?id=${id}&path=${newPath}`
  };
  invoke(IpcChannel.OpenWin, data);
}
onMounted(() => {
  refreshTree()
});
// 从主程传递过来关闭子页面
vueListen(IpcChannel.SendDataTest, (event, data) => {
  console.log(11, event)
  console.log(22, data)
  data && refreshTree()
})
</script>

<style scoped lang="scss">
:deep(.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content) {
  border: 0.1px var(--el-color-error) dashed !important;
  border-radius: 10px;
}
</style>
