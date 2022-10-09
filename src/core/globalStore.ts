import { defineStore } from "pinia";
import { defaultGameConfig } from "./gameConfig";

/**
 * 状态存储
 *
 * @author tbabzhao
 */
export const useGlobalStore = defineStore("global", {
  state: () => ({
    customConfig: { ...defaultGameConfig },
    gameConfig: { ...defaultGameConfig },
  }),
  getters: {},
  actions: {
    setGameConfig(gameConfig: GameConfigType) {
      this.gameConfig = gameConfig;
    },
    setCustomConfig(customConfig: GameConfigType) {
      this.customConfig = customConfig;
    },
    reset() {
      this.$reset();
    },
  },
});
