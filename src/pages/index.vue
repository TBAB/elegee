<template>
  <div id="gamePage">
    <div class="display-flex">
      <div class="flex-1 text-white">
        块数：{{ clearBlockNum }} / {{ totalBlockNum }}
      </div>
    </div>
    <!-- 技能 -->
    <div ref="animSkill" class="skill-board" @click="animationStyle"></div>
    <!-- 胜利 -->
    <div>
      <div v-if="gameStatus === 3" class="success-board">
        <div class="success-animation">
          <img
            class="icon-monkey"
            src="../assets/img-monkey.png"
            width="184"
            height="166"
            alt=""
          />
          <img
            class="icon-light"
            src="../assets/bg-light.png"
            width="372"
            height="374"
            alt=""
          />
          <div class="bg-black">
            <img
              src="../assets/text-congrats.png"
              width="50"
              height="16"
              alt=""
            />
            <img src="../assets/text-desc.png" width="236" height="20" alt="" />
          </div>
          <img
            class="btn-again"
            src="../assets/btn-again.png"
            width="170"
            height="48"
            alt=""
            @click="reload"
          />
        </div>
      </div>
    </div>
    <!-- 分层选块 -->
    <div>
      <div v-show="gameStatus > 0" class="level-board">
        <div v-for="(block, idx) in levelBlocksVal" :key="idx">
          <transition name="icon">
            <div
              v-if="block.status === 0"
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
          </transition>
        </div>
      </div>
      <!-- 随机选块 -->
      <div class="random-board">
        <div
          v-for="(randomBlock, index) in randomBlocksVal"
          :key="index"
          class="random-area"
        >
          <transition name="icon">
            <div
              v-if="randomBlock.length > 0"
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
          </transition>
          <!-- 隐藏 -->
          <div
            v-for="num in Math.max(randomBlock.length - 1, 0)"
            :key="num"
            class="block random-disabled"
            :style="{
              zIndex: 100 - num,
            }"
          ></div>
        </div>
      </div>
    </div>
    <!-- 槽位 -->
    <div class="slot-board">
      <div v-for="(slotBlock, index) in slotAreaVal" :key="index">
        <transition name="remove">
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
    <div class="audio-board">
      <audio class="audio-remove">
        <source src="../assets/remove.mp3" type="audio/mpeg" />
      </audio>
      <audio class="audio-magic">
        <source src="../assets/magic.mp3" type="audio/mpeg" />
      </audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import useGame from "../service/gameSerice";
import { onMounted, ref } from "vue";
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
  doClickBlock,
  doStart,
  goldenFinger,
  reload,
  animationStyle,
} = useGame;

/**
 * 获取图片背景
 */
const inlineBgImage = (src: string) => {
  return new URL(`../assets/${src}.png`, import.meta.url).href;
};
const animSkill = ref<any>(null);

onMounted(() => {
  doStart(animSkill);
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
  background: url("/src/assets/icon-magic.png") no-repeat center;
  background-size: contain;
  position: absolute;
  right: 10px;
  /* background-position: center; */
  top: 10px;
}
.skill-board-0 {
  background: url("../assets/icon-magic.png") no-repeat center;
  background-size: contain;
}
.skill-board-1 {
  background: url("../assets/anim-1.png") no-repeat center;
  background-size: contain;
}
.skill-board-2 {
  background: url("../assets/anim-2.png") no-repeat center;
  background-size: contain;
}
.skill-board-3 {
  background: url("../assets/anim-3.png") no-repeat center;
  background-size: contain;
}
.skill-board-4 {
  background: url("../assets/anim-4.png") no-repeat center;
  background-size: contain;
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

.success-board {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.success-animation {
  position: relative;
  width: 374px;
  height: 374px;
  overflow: visible;
}

.icon-monkey {
  position: absolute;
  top: 60px;
  left: 50%;
  margin-left: -92px;
  z-index: 998;
}

.icon-light {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 997;
  animation: rotate 3s ease infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes scale {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  25% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.bg-black {
  position: absolute;
  top: 200px;
  left: 50%;
  margin-left: -150px;
  width: 300px;
  height: 103px;
  background-color: black;
  border-radius: 16px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bg-black img {
  animation: scale 2s ease;
}

.bg-black img:first-of-type {
  margin-bottom: 20px;
}

.btn-again {
  position: absolute;
  top: 320px;
  left: 50%;
  margin-left: -85px;
  z-index: 1000;
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
.slot-block {
  margin: 0px 0px;
  position: relative;
}

.audio-board {
  display: none;
}

.remove-enter-from,
.remove-leave-to {
  opacity: 0;
  bottom: 10px;
}

.remove-enter-to,
.remove-leave-from {
  opacity: 1;
  bottom: 0px;
}

.remove-leave-active {
  transition: all 0.3s ease;
}
.icon-enter-to,
.icon-leave-from {
  transform: scale(1.2);
}

.icon-leave-active {
  transition: all 0.1s ease;
}
</style>
