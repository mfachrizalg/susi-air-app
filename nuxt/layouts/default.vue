<template>
  <div class="layout">
    <main class="layout__content">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style lang="scss" scoped>
.layout__content {
  max-width: 560px;
  margin: 0 auto;
  padding: 20px 16px 104px;
}
</style>
