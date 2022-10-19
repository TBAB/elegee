/**
 * 获取图片背景
 * @param name 图片素材名字
 */
export const inlineBgImage = (name) => {
    return new URL(`../assets/${name}.png`, import.meta.url).href;
};

/**
* 异步控制
* @param time sleep时间
*/
export const sleep = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

/**
* 查找数组中元素目标属性
* @param arr 待查找数组
* @param type 目标元素
*/
export const findType = (arr, type) => {
    return arr.find((icon) => {icon.type === type})
}