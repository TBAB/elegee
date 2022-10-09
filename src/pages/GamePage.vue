<template>
  <div id="gamePage">
    <div class="display-flex">
      <div class="flex-1 text-white">
        块数：{{ clearBlockNum }} / {{ totalBlockNum }}
      </div>
    </div>
    <!-- 技能 -->
    <div class="skill-board" @click="goldenFinger"></div>
    <!-- 胜利 -->
    <div>
      <div v-if="gameStatus === 3" style="text-align: center">
        <h2>恭喜，你赢啦！🎉</h2>
        <h3 @click="reload">再来一局</h3>
      </div>
    </div>
    <!-- 分层选块 -->
    <div>
      <div v-show="gameStatus > 0" class="level-board">
        <div v-for="(block, idx) in levelBlocksVal" :key="idx">
          <div
            v-if="block.status === 0"
            :ref="
              (el) => {
                // @ts-ignore
                refNodes[block.id] = el;
              }
            "
            class="block level-block"
            :class="{
              disabled: block.lowerThanBlocks.length > 0,
            }"
            :data-id="block.id"
            :style="{
              zIndex: 100 + block.level,
              left: block.x * widthUnit + 'px',
              top: block.y * heightUnit + 'px',
              backgroundImage: 'url(' + inlineBgImage(block.type) + ')',
            }"
            @click="() => doClickBlock(block)"
          >
            <!-- <img class="block-img" :src="inlineBgImage(block.type)" alt="" /> -->
          </div>
        </div>
      </div>
      <!-- 随机选块 -->
      <div class="random-board">
        <div
          v-for="(randomBlock, index) in randomBlocksVal"
          :key="index"
          class="random-area"
        >
          <div
            v-if="randomBlock.length > 0"
            :ref="
              (el) => {
                // @ts-ignore
                refNodes[randomBlock[0].id] = el;
              }
            "
            :data-id="randomBlock[0].id"
            class="block"
            :style="{
              backgroundImage:
                'url(' + inlineBgImage(randomBlock[0].type) + ')',
              zIndex: 100,
            }"
            @click="() => doClickBlock(randomBlock[0], index)"
          >
            <!-- {{ randomBlock[0].type }} -->
          </div>
          <!-- 隐藏 -->
          <div
            v-for="num in Math.max(randomBlock.length - 1, 0)"
            :key="num"
            class="block random-disabled"
            :style="{
              zIndex: 100 - num,
            }"
          >
            <!-- {{ randomBlock[num].type }} -->
            <!-- <img
            v-if=""
            class="block-img"
            :src="inlineBgImage(randomBlock[num].type)"
            alt=""
          /> -->
          </div>
        </div>
      </div>
    </div>
    <!-- 槽位 -->
    <div class="slot-board">
      <div v-for="(slotBlock, index) in slotAreaVal" :key="index">
        <transition name="why">
          <div
            v-if="slotBlock?.status !== 2"
            class="block slot-block"
            :style="{
              backgroundImage: 'url(' + inlineBgImage(slotBlock?.type) + ')',
            }"
          ></div>
        </transition>

        <!-- {{ slotBlock?.type }} -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useGame from "../core/game";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const {
  gameStatus,
  levelBlocksVal,
  randomBlocksVal,
  slotAreaVal,
  widthUnit,
  heightUnit,
  totalBlockNum,
  clearBlockNum,
  refNodes,
  doClickBlock,
  doStart,
  goldenFinger,
  reload,
} = useGame();

/**
 * 获取图片背景
 */
const inlineBgImage = (src: string) => {
  return new URL(`../assets/${src}.png`, import.meta.url).href;
};
onMounted(() => {
  doStart();
});
</script>

<style scoped>
.text-white {
  color: #fff;
}
.level-board {
  position: relative;
  margin: 80px auto 20px;
}

.level-block {
  position: absolute;
}

.random-board {
  margin-top: 8px;
  margin-left: 16px;
  height: 100px;
}

.random-area {
  display: flex;
  justify-content: flex-start;
}

.slot-board {
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("../assets/bg-bar.png") no-repeat;
  background-size: contain;
  height: 80px;
  width: 330px;
  margin: 10px auto;
  /* margin-right: 0px; */
  /* width: fit-content; */
}

.skill-board {
  width: 80px;
  height: 80px;
  background: url("../assets/icon-magic.png") no-repeat;
  background-size: cover;
  position: absolute;
  right: 10px;
  top: 20px;
}
.display-flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}

.text-right {
  text-align: right;
}

.block {
  /* font-size: 28px; */
  width: 50px;
  height: 50px;
  /* background: white; */
  text-align: center;
  vertical-align: top;
  display: inline-block;
  background-size: cover;
}

.disabled {
  /* background: grey;
  cursor: not-allowed;
  border-radius: 5px; */
  opacity: 0.5;
}
.random-disabled {
  opacity: 0.8;
  background: url("../assets/icon-hidden.png") no-repeat;
  background-size: cover;
  margin-left: -15px;
}
.slot-block {
  margin: 0px -4px;
}
.why-enter-from,
.why-leave-to {
  opacity: 0;
}

.why-enter-to,
.why-leave-from {
  opacity: 1;
}

.why-leave-active {
  transition: opacity 0.1s ease;
}
</style>
