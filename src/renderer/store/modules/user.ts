import { defineStore } from "pinia";

interface StateType {
  isLogin: boolean;
  isLock: boolean;
  editTable: object;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): StateType => ({
    isLogin: false,
    isLock: true,
    editTable: {},
  }),
  getters: {
    getIsLogin: (state): boolean => state.isLogin,
    getIsLock: (state): boolean => state.isLock,
    getEditTable: (state, key?: number | string): object => {
      if (key) {
        return state.editTable[key]
      } else {
        return state.editTable
      }
    },
  },
  actions: {
    IS_LOCK_CHANGE() {
      this.isLock = !this.isLock;
    },
    IS_LOGIN(data: boolean) {
      this.isLogin = data;
    },
    EDIT_DATA_ACTION(key: number | string, data: object) {
      this.editTable[key] = data;
    },
  },
  persist: true
});
