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
            class="block level-block"
            :class="{
              disabled: !isHolyLight && block.lowerThanBlocks.length > 0,
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
          :data-id="randomBlock[0].id"
          class="block"
          :style="{
            backgroundImage: 'url(' + inlineBgImage(randomBlock[0].type) + ')',
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
    <!-- 槽位 -->
    <div v-if="slotAreaVal.length > 0" class="slot-board">
      <div
        v-for="(slotBlock, index) in slotAreaVal"
        :key="index"
        class="block"
        :style="{
          backgroundImage: 'url(' + inlineBgImage(slotBlock?.type) + ')',
        }"
      >
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
  isHolyLight,
  canSeeRandom,
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
  margin: 8px 20px 0px 20px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  height: 82px;
  width: 348px;
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
  font-size: 28px;
  width: 42px;
  height: 45px;
  line-height: 42px;
  min-width: 42px;
  /* background: white; */
  text-align: center;
  vertical-align: top;
  display: inline-block;
  background-size: 100% 100%;
}

.disabled {
  /* background: grey;
  cursor: not-allowed;
  border-radius: 5px; */
  opacity: 1;
}
.disabled::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 42px;
  height: 45px;
  background-color: rgba(0, 0, 0, 0.68);
  border-radius: 12px;
}
.random-disabled {
  opacity: 0.8;
  background: url("../assets/icon-hidden.png") no-repeat;
  background-size: cover;
  margin-left: -38px;
}
</style>
