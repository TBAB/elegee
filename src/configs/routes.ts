import { RouteRecordRaw } from "vue-router";
import GamePage from "../pages/GamePage.vue";

export default [
  {
    path: "/",
    component: GamePage,
  },
  {
    path: "/game",
    component: GamePage,
  },
] as RouteRecordRaw[];
