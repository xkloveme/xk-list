/*
 * @Author: xkloveme
 * @Date: 2023-09-21 17:11:13
 * @LastEditTime: 2023-10-08 14:54:41
 * @LastEditors: xkloveme
 * @Description: 文件管理中心
 * @FilePath: /xk-list/src/main/services/fileManage.ts
 * @Copyright © xkloveme
 */
import JSZip from 'jszip'
import dayjs from 'dayjs'
import { diff } from 'jsondiffpatch';
import { app, BrowserWindow, dialog } from "electron";
import { IpcChannel, IpcMainHandle } from "../../ipc";
import { webContentSend } from './ipcMain'
import fs from 'fs'
import { join } from "path";
const TEMPPATH = 'xk-list' // 生成的文件夹名称
const basePath = join(app.getPath('documents'), TEMPPATH)
const zip = new JSZip();

function checkIfFolderExists(folderPath) {
  return new Promise(
    (resolve, reject) => {
      try {
        fs.statSync(folderPath);
        resolve(true);
      } catch (error) {
        fs.mkdir(basePath, { recursive: true }, err => {
          if (err) console.log(`mkdir path: ${basePath} err`)
        })
        reject(false);
      }
    })
}



const getKey = (prefix: string = 'xk-tree', id: number = 0) => {
  return `${prefix}-${id}`
}

let id = 0

interface TreeNode {
  id: string;
  label: string;
  filePath: string;
  children?: TreeNode[];
  opened: boolean;
  isDirectory: boolean;
  isFile: boolean;
  createdAt: string;
  updatedAt: string;
}
let win: BrowserWindow;

function readFolderContent(folderPath: string): TreeNode[] {
  const folderContent = fs.readdirSync(folderPath);
  const tree: TreeNode[] = folderContent.map(file => {
    const filePath = join(folderPath, file);
    const stats = fs.statSync(filePath);
    let node: TreeNode = {
      id: getKey('xk-list', ++id),
      label: file,
      filePath: filePath,
      opened: false,
      isDirectory: stats.isDirectory(), // 如果 <fs.Stats> 对象描述文件系统目录，则返回 true。
      isFile: stats.isFile(), // 如果 <fs.Stats> 对象描述常规文件，则返回 true。
      createdAt: dayjs(stats.birthtime).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs(stats.mtime).format('YYYY-MM-DD HH:mm:ss'),
    }
    if (stats.isFile() && !file.endsWith('.wt')) {
      node = undefined;
    }
    if (stats.isDirectory()) {
      node.children = readFolderContent(filePath);
    }
    return node;
  });

  return tree.filter(node => !!node);
}
let loginfo = {}
// 生成wt 文件
function setFileContentWT(loginfo: object, content: string, path: string, newPath?: string) {
  zip.file('user.json', content)
  zip.file("log.json", JSON.stringify(loginfo));
  zip.generateAsync({ type: "uint8array" }).then(function (content) {
    fs.writeFileSync(path, content);
    newPath && fs.rename(path, newPath, (err) => {
      throw err;
    });
    webContentSend(win.webContents, IpcChannel.SendDataTest, true);
    return true;
  });
}



export function useFileManageHandle(): Pick<IpcMainHandle,
  IpcChannel.AddFile
  | IpcChannel.EditFile
  | IpcChannel.DelFile
  | IpcChannel.FileList
  | IpcChannel.ReadFile> {
  return {
    [IpcChannel.AddFile]: (event, { isDir, content, log, type, name, id, path = basePath }) => {
      /**
       * @Description: 新增文件 OR 文件夹
       * @Date: 2023-09-21 17:13:23
       * ****************************************************************
      */
      try {
        if (isDir) {
          fs.mkdirSync(name ? join(path, name) : path);
        } else {
          if (id) {
            const data = fs.readFileSync(path);
            JSZip.loadAsync(data!).then((zip) => {
              zip.files['log.json'].async('text').then((res) => {
                loginfo = JSON.parse(res)
              })
              zip.files['user.json'].async('text').then((res) => {
                let diffStr = diff(JSON.parse(res), JSON.parse(content))
                loginfo = {
                  ...loginfo,
                  [dayjs().format('YYYY-MM-DD HH:mm:ss')]:
                    { type: type || 'warning', title: log || '修改文件', content: diffStr }
                }
                let newPath = path.replace(/[^\/]+(?=\.[^\/.]*$).wt/, name)
                setFileContentWT(loginfo, content, path, newPath)
              })
            })
          } else {
            let diffStr = diff({}, JSON.parse(content))
            loginfo = {
              [dayjs().format('YYYY-MM-DD HH:mm:ss')]:
                { type: 'info', title: '初始化', content: diffStr }
            }
            setFileContentWT(loginfo, content, path ? join(path, name) : join(basePath, name))
          }
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    [IpcChannel.EditFile]: (event, { isDir, name, newName, path = basePath, content }) => {
      /**
 * @Description: 修改文件
 * @Date: 2023-09-21 17:13:23
 * ****************************************************************
 */
      try {
        if (isDir) {
          fs.renameSync(name ? join(path, name) : path, newName ? join(path, newName) : path);
        } else {
          fs.writeFileSync(name ? join(path, name) : path, content);
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    [IpcChannel.DelFile]: (event, { isDir, path = basePath }) => {
      /**
 * @Description: 删除文件或文件夹
 * @Date: 2023-09-21 17:13:23
 * ****************************************************************
 */
      try {
        if (isDir) {
          fs.rmdirSync(path)
        } else {
          fs.unlinkSync(path)
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    [IpcChannel.FileList]: async (event) => {
      /**
 * @Description: 查询文件夹
 * @Date: 2023-09-21 17:13:23
 * ****************************************************************
 */
      let iswork = await checkIfFolderExists(basePath)
      if (iswork) {
        id = 0
        return readFolderContent(basePath)
      } else {
        return
      }
    },
    [IpcChannel.ReadFile]: async (event, { path = basePath }) => {
      /**
 * @Description: 读取文件
 * @Date: 2023-09-21 17:13:23
 * ****************************************************************
 */
      try {
        const file = await fs.readFileSync(path);
        return file
      } catch (err) {
        console.log(err);
      }

    }
  }
}
