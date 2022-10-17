/**
 * 游戏逻辑
 *
 * @author tbabzhao
 */
import { defaultGameConfig } from "../config/index";
import { shuffle, remove } from "lodash";
import { ref } from "vue";

/**
 * 异步控制
 */
let sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

/**
 * 游戏初始化
 */
const gameConfig = defaultGameConfig;
// 游戏状态：0 - 初始化, 1 - 进行中, 2 - 失败结束, 3 - 胜利
const gameStatus = ref(0);

// 各层块
const levelBlocksVal = ref([]);
// 随机区块
const randomBlocksVal = ref([]);
// 插槽区
const slotAreaVal = ref([]);
// 当前槽占用数
const currSlotNum = ref(0);
// 爆破次数
const doRemoveNum = ref(0);

// 保存所有块（包括随机块）
const allBlocks = [];
const blockData = {};

// 总块数
let totalBlockNum = ref(0);
// 已消除块数
let clearBlockNum = ref(0);
// 格子数
const boxWidthNum = 24;
const boxHeightNum = 24;
// 间隔
let reBrokeTime = 300;
// 每个格子的宽高
const widthUnit = 14;
const heightUnit = 14;
// 消除中
let clickWorking = false;
//  正在执行金手指
let broked = false;
// 保存整个 "棋盘" 的每个格子状态（下标为格子起始点横纵坐标）
let chessBoard = [];
// 金手指动画容器
let animSkill = null;

/**
 * 初始化指定大小的棋盘
 * @param width
 * @param height
 */
const initChessBoard = (width, height) => {
  for (let i = 0; i < width; i++) {
    chessBoard[i] = new Array(height);
    for (let j = 0; j < height; j++) {
      chessBoard[i][j] = {
        blocks: [],
      };
    }
  }
};
// 初始化棋盘
initChessBoard(boxWidthNum, boxHeightNum);

/**
 * 游戏初始化
 */
const initGame = () => {
  // 0. 设置父容器宽高
  const levelBoardDom = document.getElementsByClassName("level-board");
  levelBoardDom[0].style.width = widthUnit * boxWidthNum + "px";
  levelBoardDom[0].style.height = heightUnit * boxHeightNum + "px";

  // 规划块数
  // 块数单位（总块数必须是该值的倍数）
  const blockNumUnit = gameConfig.composeNum * gameConfig.typeNum;
  console.log("块数单位", blockNumUnit);

  // 随机生成的总块数
  const totalRandomBlockNum = gameConfig.randomBlocks.reduce((pre, curr) => {
    return pre + curr;
  }, 0);
  console.log("随机生成的总块数", totalRandomBlockNum);

  // 需要的最小块数
  const minBlockNum =
    gameConfig.levelNum * gameConfig.levelBlockNum + totalRandomBlockNum;
  console.log("需要的最小块数", minBlockNum);

  // 补齐到 blockNumUnit 的倍数
  // e.g. minBlockNum = 14, blockNumUnit = 6, 补到 18
  totalBlockNum.value = minBlockNum;
  if (totalBlockNum.value % blockNumUnit !== 0) {
    totalBlockNum.value =
      (Math.floor(minBlockNum / blockNumUnit) + 1) * blockNumUnit;
  }
  console.log("总块数", totalBlockNum.value);

  // 初始化块，随机生成块的内容
  // 保存所有块的数组
  const iconBlocks = [];
  // 需要用到的图标数组
  const needIcons = [];
  let ranAniArr = gameConfig.icons.concat([]);
  for (let i = 0; i < gameConfig.typeNum; i++) {
    const ranIdx = Math.floor(Math.random() * ranAniArr.length);
    needIcons.push(ranAniArr[ranIdx]);
    ranAniArr.splice(ranIdx, 1);
  }
  console.log("需要用到的图标数组", needIcons);
  // 依次把块塞到数组里
  for (let i = 0; i < totalBlockNum.value; i++) {
    iconBlocks.push(needIcons[i % gameConfig.typeNum]);
  }
  // 打乱数组
  const randomIconBlocks = shuffle(iconBlocks);
  // 初始化
  for (let i = 0; i < totalBlockNum.value; i++) {
    const newBlock = {
      id: i,
      status: 0,
      level: 0,
      type: randomIconBlocks[i],
      higherThanBlocks: [],
      lowerThanBlocks: [],
    };
    allBlocks.push(newBlock);
  }

  // 下一个要塞入的块
  let pos = 0;

  // 3. 计算随机生成的块
  const randomBlocks = [];

  gameConfig.randomBlocks.forEach((randomBlock, idx) => {
    randomBlocks[idx] = [];
    for (let i = 0; i < randomBlock; i++) {
      randomBlocks[idx].push(allBlocks[pos]);
      blockData[pos] = allBlocks[pos];
      pos++;
    }
  });
  // 剩余块数
  let leftBlockNum = totalBlockNum.value - totalRandomBlockNum;

  // 4. 计算有层级关系的块
  const levelBlocks = [];
  let minX = 0;
  let maxX = 22;
  let minY = 0;
  let maxY = 22;
  // 分为 gameConfig.levelNum 批，依次生成，每批的边界不同
  for (let i = 0; i < gameConfig.levelNum; i++) {
    let nextBlockNum = Math.min(gameConfig.levelBlockNum, leftBlockNum);
    // 最后一批，分配所有 leftBlockNum
    if (i == gameConfig.levelNum - 1) {
      nextBlockNum = leftBlockNum;
    }
    // 边界收缩
    if (gameConfig.borderStep > 0) {
      const dir = i % 4;
      if (i > 0) {
        if (dir === 0) {
          minX += gameConfig.borderStep;
        } else if (dir === 1) {
          maxY -= gameConfig.borderStep;
        } else if (dir === 2) {
          minY += gameConfig.borderStep;
        } else {
          maxX -= gameConfig.borderStep;
        }
      }
    }
    const nextGenBlocks = allBlocks.slice(pos, pos + nextBlockNum);
    // 生成块的坐标
    genLevelBlockPos(nextGenBlocks, minX, minY, maxX, maxY);
    levelBlocks.push(...nextGenBlocks);

    pos = pos + nextBlockNum;
    leftBlockNum -= nextBlockNum;
    if (leftBlockNum <= 0) {
      break;
    }
  }
  console.log("最终剩余块数", leftBlockNum);

  // 4. 初始化空插槽
  const slotArea = new Array(gameConfig.slotNum).fill(null);
  console.log("块情况", levelBlocks);
  console.log("随机块情况", randomBlocks);

  return {
    levelBlocks,
    randomBlocks,
    slotArea,
  };
};

/**
 * 生成一批层级块（坐标、层级关系）
 * @param blocks
 * @param minX
 * @param minY
 * @param maxX
 * @param maxY
 */
const genLevelBlockPos = (blocks, minX, minY, maxX, maxY) => {
  // 记录这批块的坐标，用于保证同批次元素不能完全重叠
  const currentPosSet = new Set();
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    // 随机生成坐标
    let newPosX;
    let newPosY;
    let key;
    while (true) {
      newPosX = Math.floor(Math.random() * maxX + minX);
      newPosY = Math.floor(Math.random() * maxY + minY);
      key = newPosX + "," + newPosY;
      // 同批次元素不能完全重叠
      if (!currentPosSet.has(key)) {
        break;
      }
    }
    chessBoard[newPosX][newPosY].blocks.push(block);
    currentPosSet.add(key);
    block.x = newPosX;
    block.y = newPosY;
    // 填充层级关系
    genLevelRelation(block);
  }
};

/**
 * 给块绑定层级关系（用于确认哪些元素是当前可点击的）
 * 核心逻辑：每个块压住和其坐标有交集棋盘格内所有 level 大于它的点，双向建立联系
 * @param block
 */
const genLevelRelation = (block) => {
  // 确定该块附近的格子坐标范围
  const minX = Math.max(block.x - 2, 0);
  const minY = Math.max(block.y - 2, 0);
  const maxX = Math.min(block.x + 3, boxWidthNum - 2);
  const maxY = Math.min(block.y + 3, boxHeightNum - 2);
  // 遍历该块附近的格子
  let maxLevel = 0;
  for (let i = minX; i < maxX; i++) {
    for (let j = minY; j < maxY; j++) {
      const relationBlocks = chessBoard[i][j].blocks;
      if (relationBlocks.length > 0) {
        // 取当前位置最高层的块
        const maxLevelRelationBlock = relationBlocks[relationBlocks.length - 1];
        // 排除自己
        if (maxLevelRelationBlock.id === block.id) {
          continue;
        }
        maxLevel = Math.max(maxLevel, maxLevelRelationBlock.level);
        block.higherThanBlocks.push(maxLevelRelationBlock);
        maxLevelRelationBlock.lowerThanBlocks.push(block);
      }
    }
  }
  // 比最高层的块再高一层（初始为 1）
  block.level = maxLevel + 1;
};

/**
 * 点击块事件
 * @param block
 * @param randomIdx 随机区域下标，>= 0 表示点击的是随机块
 */
const doClickBlock = (block, randomIdx = -1) => {
  return new Promise(async (resove, reject) => {
    // 已经输了 / 已经被点击 / 有上层块（且非强制），不能再点击
    // @ts-ignore
    if (
      currSlotNum.value >= gameConfig.slotNum ||
      block.status !== 0 ||
      block.lowerThanBlocks.length > 0 ||
      clickWorking
    ) {
      return;
    }
    clickWorking = !clickWorking;
    // 修改元素状态为已点击
    block.status = 1;
    // 移除当前元素
    if (randomIdx >= 0) {
      // 移除所点击的随机区域的第一个元素
      randomBlocksVal.value[randomIdx] = randomBlocksVal.value[randomIdx].slice(
        1,
        randomBlocksVal.value[randomIdx].length
      );
    } else {
      // 移除覆盖关系
      block.higherThanBlocks.forEach((higherThanBlock) => {
        remove(higherThanBlock.lowerThanBlocks, (lowerThanBlock) => {
          return lowerThanBlock.id === block.id;
        });
      });
    }
    // 新元素加入插槽
    let tempSlotNum = currSlotNum.value;
    slotAreaVal.value[tempSlotNum] = block;
    await sleep(0);
    // 检查是否有可消除的
    // block => 出现次数
    const map = {};
    // 去除空槽
    const tempSlotAreaVal = slotAreaVal.value.filter(
      (slotBlock) => !!slotBlock
    );
    tempSlotAreaVal.forEach((slotBlock) => {
      const type = slotBlock.type;
      if (!map[type]) {
        map[type] = 1;
      } else {
        map[type]++;
      }
    });
    // 得到新数组
    const newSlotAreaVal = new Array(gameConfig.slotNum).fill(null);
    tempSlotNum = 0;
    tempSlotAreaVal.forEach((slotBlock) => {
      // 成功消除（不添加到新数组中）
      if (map[slotBlock.type] >= gameConfig.composeNum) {
        playAudio("audio-remove", 0.13);
        // 块状态改为已消除
        slotBlock.status = 2;
        // 已消除块数 +1
        clearBlockNum.value++;
        doRemoveNum.value = 0;
        return;
      }
      newSlotAreaVal[tempSlotNum++] = slotBlock;
    });
    sleep(reBrokeTime - 100).then(() => {
      slotAreaVal.value = newSlotAreaVal;
      currSlotNum.value = tempSlotNum;
      clickWorking = false;
      // 游戏结束
      if (tempSlotNum >= gameConfig.slotNum) {
        gameStatus.value = 2;
        setTimeout(() => {
          alert("马失前蹄，请重新来过"), reload();
        }, 500);
        return;
      }
      if (clearBlockNum.value >= totalBlockNum.value) {
        gameStatus.value = 3;
        broked = !broked;
        return;
      }
      resove();
    });
  });
};

/**
 * 开始游戏
 */
const doStart = (refAnim) => {
  animSkill = refAnim;
  gameStatus.value = 0;
  const { levelBlocks, randomBlocks, slotArea } = initGame();
  levelBlocksVal.value = levelBlocks;
  randomBlocksVal.value = randomBlocks;
  slotAreaVal.value = slotArea;
  gameStatus.value = 1;
};

/**
 * 一键通关
 */
const goldenFinger = () => {
  if (broked) {
    return;
  }
  broked = !broked;
  // 加速
  reBrokeTime = 50;
  playAudio("audio-magic", 0.5);
  // 开始爆破
  sleep(200).then(() => {
    doBroke();
  });
};

/**
 * 消除
 */
const doBroke = async () => {
  // 非可游戏状态，中断
  if (gameStatus.value !== 1) {
    return;
  }
  // 得到可点击块
  const blocks = levelBlocksVal.value.filter(
    (block) => block.status === 0 && block.lowerThanBlocks.length === 0
  );
  let randomBlocks = randomBlocksVal.value.map((randomBlock) => {
    return randomBlock[0] || [];
  });
  // 得到已选用槽中数据
  const tempSlotAreaVal = slotAreaVal.value.filter((slotBlock) => !!slotBlock);
  const map = {};
  tempSlotAreaVal.forEach((slotBlock) => {
    const type = slotBlock.type;
    if (!map[type]) {
      map[type] = 1;
    } else {
      map[type]++;
    }
  });
  // 边界爆破
  if (tempSlotAreaVal?.length > gameConfig.slotNum - 2) {
    doRemove(1 + doRemoveNum.value);
    // 逐步增加爆破数量
    doRemoveNum.value++;
    reBroke();
    return;
  }
  let composeNum = gameConfig.composeNum;
  // 可点击模块筛选算法
  while (composeNum > 0) {
    for (let type in map) {
      // 优先块级
      if (map[type] === composeNum - 1) {
        for (let j = 0; j < blocks.length; j++) {
          if (blocks[j]?.type === type) {
            await doClickBlock(blocks[j], -1);
            reBroke();
            return;
          }
        }
        // 次级随机
        for (let j = 0; j < randomBlocks.length; j++) {
          if (randomBlocks[j]?.type === type) {
            await doClickBlock(randomBlocks[j], j);
            reBroke();
            return;
          }
        }
      }
    }
    composeNum--;
  }

  // 随机点击一块
  let ranClickBlock = [];
  let ranClickIdx = 0;
  let ranArrNum;
  let working = false;
  // 避免随机到已消除完毕的空数组[]
  while (!working) {
    ranArrNum = Math.random() > 0.5;
    ranClickBlock = ranArrNum ? blocks : randomBlocks;
    ranClickIdx = Math.floor(Math.random() * ranClickBlock.length);
    working = ranClickBlock[ranClickIdx].status === 0;
  }
  await doClickBlock(ranClickBlock[ranClickIdx], ranArrNum ? -1 : ranClickIdx);
  reBroke();
  return;
};

/**
 *  持续消除
 */
const reBroke = () => {
  sleep(reBrokeTime).then(() => {
    doBroke();
  });
};

/**
 * 移出块
 */
const doRemove = (num = 1) => {
  while (num > 0) {
    // 移除槽中第一个块
    const block = slotAreaVal.value[0];
    if (!block) {
      return;
    }
    // 槽移除块
    for (let i = 0; i < slotAreaVal.value.length - 1; i++) {
      slotAreaVal.value[i] = slotAreaVal.value[i + 1];
    }
    slotAreaVal.value[slotAreaVal.value.length - 1] = null;
    // 改变新块的坐标
    block.x = Math.floor(Math.random() * (boxWidthNum - 2));
    block.y = Math.floor(Math.random() * (boxHeightNum - 2));
    block.status = 0;
    // 移除的是随机块的元素，移到层级区域
    if (block.level < 1) {
      block.level = 10000;
      levelBlocksVal.value.push(block);
    }
    num--;
  }
};

/**
 * 播放音频
 @param className audio类名
 */
const playAudio = (className, currentTime) => {
  var audio = document.getElementsByClassName(className)[0];
  audio.currentTime = currentTime;
  // 保护兼容性问题`
  try {
    audio.play();
    if (/iPhone/i.test(navigator.userAgent)) {
      //监听客户端抛出事件"WeixinJSBridgeReady"
      if (document.addEventListener) {
        document.addEventListener(
          "WeixinJSBridgeReady",
          function () {
            audio.play();
          },
          false
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
};

/**
 * 再来一局
 */
const reload = () => {
  window.location.reload();
};

const animationStyle = () => {
  let timer = null;
  let count = 0;
  function interval(func, delay) {
    console.log(count, "count");
    let interFunc = function () {
      timer = setTimeout(interFunc, delay); // 递归调用
      func.call(null);
      count++;
      if (count >= 5) {
        count = 4;
      }
      animSkill.value.className = `skill-board-${count} skill-board `;
    };
    timer = setTimeout(interFunc, 300); // 触发递归
  }
  interval(() => {
    console.log(count, "interval count");
    if (count >= 4) {
      // 清除定时器
      window.clearTimeout(timer);
      goldenFinger();
      return;
    }
  }, 100);
};

export default {
  gameStatus,
  levelBlocksVal,
  randomBlocksVal,
  slotAreaVal,
  widthUnit,
  heightUnit,
  currSlotNum,
  totalBlockNum,
  clearBlockNum,
  doClickBlock,
  doStart,
  goldenFinger,
  reload,
  animationStyle,
};
