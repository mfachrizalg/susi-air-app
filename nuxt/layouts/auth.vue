<template>
  <div class="auth">
    <main class="auth__content">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.auth__content {
  width: 100%;
  max-width: 560px;
}
</style>
