// 企鹅icon数组
const icons = [];
for (let i = 1; i <= 15; i++) {
  icons.push(`icon-${i}`);
}
export const defaultGameConfig = {
  // 槽容量
  slotNum: 7,
  // 需要多少个一样块的才能合成
  composeNum: 3,
  // 图标类别数
  typeNum: 8,
  // 每层块数（大致）
  levelBlockNum: 12,
  // 边界收缩步长
  borderStep: 3,
  // 总层数（最小为 2）
  levelNum: 3,
  // 随机区块数（数组长度代表随机区数量，值表示每个随机区生产多少块）
  randomBlocks: [8, 8],
  // 图标数组
  icons,
};
