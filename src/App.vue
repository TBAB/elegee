<template>
  <div id="app">
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped>
html {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-size: 14px;
}
#app {
  background: url("assets/bg.png") no-repeat;
  padding: 16px 16px 50px;
  height: 100vh;
  background-size: cover;
}

.content {
  max-width: 480px;
  margin: 0 auto;
}
</style>
