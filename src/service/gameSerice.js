/**
 * 游戏逻辑
 * @author tbabzhao
 */
import { defaultGameConfig } from "../config/index";
import { shuffle, remove } from "lodash";
import { sleep, findType } from "./utils";
import { ref } from "vue";

// 关联dom的变量定义
// 游戏状态：0 - 初始化, 1 - 进行中, 2 - 失败结束, 3 - 胜利
const gameStatus = ref(0);
// 层级块集合（主区域叠加的块）
const levelBlocksVal = ref([]);
// 随机块集合（底部两列遮盖的块）
const randomBlocksVal = ref([]);
// 已选择块槽位集合
const slotAreaVal = ref([]);
// 当前槽占用数
const currSlotNum = ref(0);
// 本局游戏可交互块总数
let totalBlockNum = ref(0);
// 已消除块数
let clearBlockNum = ref(0);
// 金手指容器
let animSkill = ref(null);
// 爆破次数
const doRemoveNum = ref(0);


// 计算使用的变量定义
// 配置参数(槽容量、同类型消除所需块数、图标类别数、每层块数、边界收缩步长、总层数、随机区块数、图标数组)
const gameConfig = defaultGameConfig;
// 所有块合集（包括随机块）
const allBlocks = [];
// 棋盘（二维数组，包含每个格子状态，下标为格子起始点横纵坐标）
let chessBoard = [];
// 棋盘经纬划分(横24竖24)
const boxWidthNum = 24;
const boxHeightNum = 24;
// 每个格子的宽高
const widthUnit = 14;
const heightUnit = 14;
// 点击间隔
let clickIntervalTime = 200;
// 消除中标识
let clickWorking = false;
//  正在执行金手指，持续施法中
let channeling = false;


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
// 初始化棋盘（24*24）
initChessBoard(boxWidthNum, boxHeightNum);

/**
 * 游戏初始化,生成随机块组、层级块组、空储存槽
 */
const initGame = () => {
  // 设置棋盘宽高
  const levelBoardDom = document.getElementsByClassName("level-board");
  levelBoardDom[0].style.width = widthUnit * boxWidthNum + "px";
  levelBoardDom[0].style.height = heightUnit * boxHeightNum + "px";

  // 规划块数
  // 块数单位（总块数必须是此单位的整数倍）
  const blockNumUnit = gameConfig.composeNum * gameConfig.typeNum;

  // 计算随即区域需要的总块数
  const totalRandomBlockNum = gameConfig.randomBlocks.reduce((pre, curr) => {
    return pre + curr;
  }, 0);

  // 计算需要的最小块数（随机块数+层级块数*层级数）
  const minBlockNum = gameConfig.levelNum * gameConfig.levelBlockNum + totalRandomBlockNum;

  // 补齐到 blockNumUnit 的整数倍数，以保证生成的块可被完全消除
  totalBlockNum.value = minBlockNum;
  if (totalBlockNum.value % blockNumUnit !== 0) {
    totalBlockNum.value = (Math.floor(minBlockNum / blockNumUnit) + 1) * blockNumUnit;
  }

  // 初始化块，随机生成块的内容
  // 临时保存所有块的数组（此集合中块关联icon图片，未关联层级）
  const iconBlocks = [];
  // 此局游戏需要用到的图标数组
  const needIcons = [];
  // 从图标库中随机取出typeNum个图标用于此局游戏
  let ranAniArr = gameConfig.icons.concat([]);
  for (let i = 0; i < gameConfig.typeNum; i++) {
    const ranIdx = Math.floor(Math.random() * ranAniArr.length);
    needIcons.push(ranAniArr[ranIdx]);
    ranAniArr.splice(ranIdx, 1);
  }
  // 依次把图标数组中的内容放入iconBlocks，每个图标放入的次数一定是composeNum的整数倍
  for (let i = 0; i < totalBlockNum.value; i++) {
    iconBlocks.push(needIcons[i % gameConfig.typeNum]);
  }
  // 打乱iconBlocks数组
  const randomIconBlocks = shuffle(iconBlocks);
  // 初始化每一个可交互块
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

  // 下一个要分配的块的索引（allBlocks下标）
  let pos = 0;
  // 计算随机区域要分配的块（随机区域的块不需要层级关系）
  const randomBlocks = [];
  gameConfig.randomBlocks.forEach((randomBlock, idx) => {
    randomBlocks[idx] = [];
    for (let i = 0; i < randomBlock; i++) {
      randomBlocks[idx].push(allBlocks[pos]);
      pos++;
    }
  });
  // 剩余块数
  let leftBlockNum = totalBlockNum.value - totalRandomBlockNum;

  // 计算层级块（主区域叠加的块）
  const levelBlocks = [];
  let minX = 0;
  let maxX = 22;
  let minY = 0;
  let maxY = 22;
  // 分 levelNum 批依次生成层级，每批生成后收缩棋盘边界
  for (let i = 0; i < gameConfig.levelNum; i++) {
    // 剩余块数小于配置的每层标准块数时，实际数量取剩余块数
    let nextBlockNum = Math.min(gameConfig.levelBlockNum, leftBlockNum);
    // 最后一层，强制分配所有 leftBlockNum
    if (i == gameConfig.levelNum - 1) {
      nextBlockNum = leftBlockNum;
    }
    // 边界收缩(从(0,0)和(24,24)像棋盘中心逐步收缩)
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
    // 为此批次的块生成坐标与层级关系
    genLevelBlockPos(nextGenBlocks, minX, minY, maxX, maxY);
    // 将分配好层级的块推送至层级块合集
    levelBlocks.push(...nextGenBlocks);
    // 更新待处理块下标与剩余块
    pos = pos + nextBlockNum;
    leftBlockNum -= nextBlockNum;
    if (leftBlockNum <= 0) {
      break;
    }
  }
  // 初始化储存槽
  const slotArea = new Array(gameConfig.slotNum).fill(null);

  return {
    levelBlocks,
    randomBlocks,
    slotArea,
  };
};

/**
 * 生成一批层级块（坐标、层级关系）
 * @param blocks 要生成层级关系的块集合
 * @param minX 最小X坐标
 * @param minY 最小Y坐标
 * @param maxX 最大X坐标
 * @param maxY 最大Y坐标
 */
const genLevelBlockPos = (blocks, minX, minY, maxX, maxY) => {
  // 记录此批块的坐标，保证同批次块坐标不能重复
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
      // 生成的坐标未被占用则跳出
      if (!currentPosSet.has(key)) {
        break;
      }
    }
    // 在棋盘对应坐标位置记录此块
    chessBoard[newPosX][newPosY].blocks.push(block);
    currentPosSet.add(key);
    block.x = newPosX;
    block.y = newPosY;
    // 为当前块生成层级关系
    genLevelRelation(block);
  }
};

/**
 * 为块绑定层级关系（用于确认哪些块是当前可点击的），每个块压住与其坐标有交集的棋盘格内所有 level 大于它的块，建立双向联系（即记录谁压住了我，我压住了谁）
 * @param block 可交互块
 */
const genLevelRelation = (block) => {
  // 确定该块附近格子的坐标范围（每个块占用为3*3）
  const minX = Math.max(block.x - 2, 0);
  const minY = Math.max(block.y - 2, 0);
  const maxX = Math.min(block.x + 3, boxWidthNum - 2);
  const maxY = Math.min(block.y + 3, boxHeightNum - 2);
  // 遍历该块附近的格子，建立递增的层级，并记录层级关系
  let maxLevel = 0;
  for (let i = minX; i < maxX; i++) {
    for (let j = minY; j < maxY; j++) {
      const relationBlocks = chessBoard[i][j].blocks;
      if (relationBlocks.length > 0) {
        // 找出当前位置最高层的块
        const maxLevelRelationBlock = relationBlocks[relationBlocks.length - 1];
        // 排除自己
        if (maxLevelRelationBlock.id === block.id) {
          continue;
        }
        // 找到最高层级
        maxLevel = Math.max(maxLevel, maxLevelRelationBlock.level);
        // 互相记录层级关系
        block.higherThanBlocks.push(maxLevelRelationBlock);
        maxLevelRelationBlock.lowerThanBlocks.push(block);
      }
    }
  }
  // 设置当前块的层级为坐标区域最高（初始为 1）
  block.level = maxLevel + 1;
};

/**
 * 开始游戏,生成层级块、随机块、储存槽并关联到dom
 */
 const startGame = () => {
  // 游戏状态进入初始化
  gameStatus.value = 0;
  // 生成层级块、随机块、储存槽
  const { levelBlocks, randomBlocks, slotArea } = initGame();
  levelBlocksVal.value = levelBlocks;
  randomBlocksVal.value = randomBlocks;
  slotAreaVal.value = slotArea;
  // 游戏状态进入游戏中
  gameStatus.value = 1;
};

/**
 * 块点击事件
 * @param block
 * @param randomIdx 随机区域下标，>= 0 则表示点击的是随机块
 */
const doClickBlock = (block, randomIdx = -1) => {
  return new Promise(async (resove, reject) => {
    // 游戏结束||已经被点击||有上层块，中断
    if (
      currSlotNum.value >= gameConfig.slotNum ||
      block.status !== 0 ||
      block.lowerThanBlocks.length > 0 ||
      clickWorking
    ) {
      return;
    }
    // 防止动画结束前连续点击
    clickWorking = !clickWorking;
    // 修改点击块状态为已点击
    block.status = 1;
    // 移除点击块
    if (randomIdx >= 0) {
      // 随机块则移除点击区域的第一个元素
      randomBlocksVal.value[randomIdx] = randomBlocksVal.value[randomIdx].slice(1, randomBlocksVal.value[randomIdx].length);
    } else {
      // 层级块则移除覆盖关系
      block.higherThanBlocks.forEach((higherThanBlock) => {
        remove(higherThanBlock.lowerThanBlocks, (lowerThanBlock) => {
          return lowerThanBlock.id === block.id;
        });
      });
    }
    // 将点击块推入储存槽
    let tempSlotNum = currSlotNum.value;
    slotAreaVal.value[tempSlotNum] = block;
    // 暂停js主线程渲染更新dom节点
    await sleep(0);
    // 检查储存槽中是否有有三连
    // 创建map记录槽中每种类型的icon和其出现的次数
    const map = {};
    // 过滤slotAreaVal中空槽
    const tempSlotAreaVal = slotAreaVal.value.filter((slotBlock) => !!slotBlock);
    tempSlotAreaVal.forEach((slotBlock) => {
      const type = slotBlock.type;
      !map[type] ? (map[type] = 1) : map[type]++;
    });
    // 创建槽位数组
    const newSlotAreaVal = new Array(gameConfig.slotNum).fill(null);
    tempSlotNum = 0;
    tempSlotAreaVal.forEach((slotBlock) => {
      // 某种icon出现次数>=composeNum，满足消除条件，执行消除（此种icon不添加到新数组中）
      if (map[slotBlock.type] >= gameConfig.composeNum) {
        playAudio("audio-remove", 0.06);
        // 修改块状态改为已消除
        slotBlock.status = 2;
        // 已消除块数 +1
        clearBlockNum.value++;
        // 爆破次数归0
        doRemoveNum.value = 0;
        return;
      }
      newSlotAreaVal[tempSlotNum++] = slotBlock;
    });
    // 等待消除动画（如果有），控制点击频率
    sleep(clickIntervalTime).then(() => {
      // 更新储存槽与块数统计
      slotAreaVal.value = newSlotAreaVal;
      currSlotNum.value = tempSlotNum;
      clickWorking = false;
      // 判断游戏状态
      // 游戏失败
      if (tempSlotNum >= gameConfig.slotNum) {
        gameStatus.value = 2;
        sleep(300).then(() => {
          alert("马失前蹄，请重新来过"), reload();
        })
        return;
      }
      // 游戏获胜
      if (clearBlockNum.value >= totalBlockNum.value) {
        gameStatus.value = 3;
        return;
      }
      resove();
    });
  });
};

/**
 * 金手指一键通关
 */
const goldenFinger = () => {
  // 减少点击间隔
  clickIntervalTime = 0;
  // 播放魔法音频
  playAudio("audio-magic", 0.5);
  // 等待动画与音频效果后开始ai消除
  sleep(200).then(() => {
    aiBroke();
  });
};

/**
 * ai消除
 */
const aiBroke = async () => {
  // 非可游戏状态，中断
  if (gameStatus.value !== 1) {
    return;
  }
  // 列出储存槽中存入的块
  const tempSlotAreaVal = slotAreaVal.value.filter((slotBlock) => !!slotBlock);
  // 边界爆破
  if (tempSlotAreaVal?.length > gameConfig.slotNum - 2) {
    doRemove(1 + doRemoveNum.value);
    // 逐步增加爆破数量
    doRemoveNum.value++;
    reBroke();
    return;
  }
  // 列出所有可点击的层级块
   const levelBlocks = levelBlocksVal.value.filter(
    (block) => block.status === 0 && block.lowerThanBlocks.length === 0
  );
  // 列出所有可点击的随机块
  let randomBlocks = randomBlocksVal.value.map((randomBlock) => {
    return randomBlock[0] || [];
  });
  // 创建map记录槽中每种类型的icon和其出现的次数
  const map = [];

  tempSlotAreaVal.forEach((slotBlock) => {
    const type = slotBlock.type;
    // 查到map中已有type则将对应num++，否则初始化为1
    if (!findType(map, type)) {
      map.push({type, num: 1});
    } else {
      map.forEach((icon, index) => {
        (icon.type === type) && (icon.num++)
      })
    }
  });
  // 将出现次数较多的icon排在头部，优先选取
  map.sort((a,b) => b.num - a.num)
  let composeNum = gameConfig.composeNum;
  // 筛选算法 composeNum默认为3
  while (composeNum > 0) {
    for (let i = 0; i < map.length; i++) {
      // 选择优先级随map中同类型icon出现次数递减
      // 优先在层级块中选择
      if (map[i].num === composeNum - 1) {
        for (let j = 0; j < levelBlocks.length; j++) {
          if (levelBlocks[j]?.type === map[i].type) {
            // 命中，触发该块点击
            await doClickBlock(levelBlocks[j], -1);
            // 点击更新完毕后继续消除
            reBroke();
            return;
          }
        }
        // 其次在随机块中选择
        for (let j = 0; j < randomBlocks.length; j++) {
          if (randomBlocks[j]?.type === map[i].type) {
            await doClickBlock(randomBlocks[j], j);
            reBroke();
            return;
          }
        }
      }
    }
    composeNum--;
  }

  // 未命中高优先级选取规则，则随机从可交互区域点击一块
  // 随机区域集合（层级块集合或随机块集合）
  let ranClickBlock = [];
  // 目标块索引
  let ranClickIdx = 0;
  // 随机数
  let ranArrNum;
  let stop = false;
  // 随机从层级块区域或随机块区域找到一个可点击块
  while (!stop) {
    ranArrNum = Math.random() > 0.5;
    ranClickBlock = ranArrNum ? levelBlocks : randomBlocks;
    ranClickIdx = Math.floor(Math.random() * ranClickBlock.length);
    stop = ranClickBlock[ranClickIdx].status === 0;
  }
  // 触发该块点击后触发持续消除
  await doClickBlock(ranClickBlock[ranClickIdx], ranArrNum ? -1 : ranClickIdx);
  reBroke();
  return;
};

/**
 *  持续消除
 */
const reBroke = () => {
  // 停顿50毫秒，避免消除太快看不清过程
  sleep(50).then(() => {
    aiBroke();
  });
};

/**
 * 移出块
 */
const doRemove = (num = 1) => {
  while (num > 0) {
    // 取出槽中第一个块
    const block = slotAreaVal.value[0];
    if (!block) {
      return;
    }
    // 移除槽中第一个块
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
  audio.play();
  if (/iPhone/i.test(navigator.userAgent)) {
    //监听客户端抛出事件"WeixinJSBridgeReady"
    if (document.addEventListener) {
      document.addEventListener("WeixinJSBridgeReady",() => audio.play(), false);
    }
  }
};

/**
 * 再来一局
 */
const reload = () => {
  window.location.reload();
};

/**
 * 触发企鹅魔法
 */
const handelMagic = () => {
  // 防抖
  if (channeling) {
    return;
  }
  channeling = !channeling;
  let timer = null;
  let count = 0;
  function interval(func, delay) {
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
    if (count >= 4) {
      // 清除定时器
      window.clearTimeout(timer);
      // 开启金手指
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
  startGame,
  reload,
  handelMagic,
  animSkill
};
