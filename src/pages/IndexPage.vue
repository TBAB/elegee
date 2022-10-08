<template>
  <div id="indexPage">
    <h1>🐧了个🐧</h1>
    <div style="margin-bottom: 16px">消除小游戏</div>
    <button
      block
      style="margin-bottom: 16px"
      @click="toGamePage(easyGameConfig)"
    >
      简单模式
    </button>
    <button
      block
      style="margin-bottom: 16px"
      @click="toGamePage(yangGameConfig)"
    >
      羊了个羊模式
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { easyGameConfig, yangGameConfig } from "../core/gameConfig";
import { useGlobalStore } from "../core/globalStore";

const router = useRouter();

const { setGameConfig } = useGlobalStore();

const toGamePage = (config?: GameConfigType) => {
  if (config) {
    setGameConfig(config);
    router.push("/game");
  } else {
    router.push("/config");
  }
};
</script>

<style scoped>
#indexPage {
  text-align: center;
}

.footer {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 12px;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
