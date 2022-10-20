import { createApp } from "vue";
import App from "./App.vue";
import * as VueRouter from "vue-router";
import GamePage from "./pages/index.vue";

// 路由
const routes = [
  {
    path: "/",
    component: GamePage,
  },
];
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});
// 挂载
createApp(App).use(router).mount("#app");
