<template>
  <div id="gamePage">
    <div class="display-flex">
      <div class="flex-1" @click="doBack">返回</div>
      <div class="flex-1 text-right">
        块数：{{ clearBlockNum }} / {{ totalBlockNum }}
      </div>
    </div>
    <!-- 胜利 -->
    <div align="center">
      <div v-if="gameStatus === 3" style="text-align: center">
        <h2>恭喜，你赢啦！🎉</h2>
        <!-- <img alt="程序员鱼皮" src="../assets/kunkun.png" /> -->
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
            }"
            @click="() => doClickBlock(block)"
          >
            {{ block.type }}
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
          @click="() => doClickBlock(randomBlock[0], index)"
        >
          {{ randomBlock[0].type }}
        </div>
        <!-- 隐藏 -->
        <div
          v-for="num in Math.max(randomBlock.length - 1, 0)"
          :key="num"
          class="block disabled"
        >
          <span v-if="canSeeRandom">
            {{ randomBlock[num].type }}
          </span>
        </div>
      </div>
    </div>
    <!-- 槽位 -->
    <div v-if="slotAreaVal.length > 0" align="center" class="slot-board">
      <div v-for="(slotBlock, index) in slotAreaVal" :key="index" class="block">
        {{ slotBlock?.type }}
      </div>
    </div>
    <!-- 技能 -->
    <div class="skill-board">
      <div class="flex-1" @click="doBroke">一键通关</div>
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
  doBroke,
} = useGame();

/**
 * 回上一页
 */
const doBack = () => {
  router.back();
};

onMounted(() => {
  doStart();
});
</script>

<style scoped>
.level-board {
  position: relative;
  margin: 20px auto;
}

.level-block {
  position: absolute;
}

.random-board {
  margin-top: 8px;
  height: 100px;
}

.random-area {
  display: flex;
  justify-content: flex-start;
}

.slot-board {
  border: 10px solid saddlebrown;
  margin: 16px auto;
  width: fit-content;
}

.skill-board {
  display: flex;
  text-align: center;
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
  height: 42px;
  line-height: 42px;
  min-width: 42px;
  border: 1px solid #eee;
  background: white;
  text-align: center;
  vertical-align: top;
  display: inline-block;
}

.disabled {
  background: grey;
  cursor: not-allowed;
}
</style>
