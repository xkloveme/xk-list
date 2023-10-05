import { defineStore } from "pinia";

interface StateType {
  isLogin: boolean;
  editTable: object;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): StateType => ({
    isLogin: false,
    editTable: {},
  }),
  getters: {
    getIsLogin: (state): boolean => state.isLogin,
    getEditTable: (state, key?: number | string): object => {
      if (key) {
        return state.editTable[key]
      } else {
        return state.editTable
      }
    },
  },
  actions: {
    IS_LOGIN(data: boolean) {
      this.isLogin = data;
    },
    EDIT_DATA_ACTION(key: number | string, data: object) {
      this.editTable[key] = data;
    },
  },
  persist: true
});
