/**
 * 获取图片背景
 */
export const inlineBgImage = (src) => {
    return new URL(`../assets/${src}.png`, import.meta.url).href;
};

/**
* 异步控制
*/
export const sleep = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};