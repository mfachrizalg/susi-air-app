<script setup lang="ts">
const api = useNuxtApp().$api;

async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } finally {
    // A full load drops every Pinia store, so no pilot or schedule data survives sign-out.
    window.location.assign('/login');
  }
}
</script>

<template>
  <div class="layout">
    <main class="layout__content">
      <div class="layout__top">
        <img class="layout__logo" src="/brand/susiair-logo.png" alt="Susi Air" />
        <button type="button" class="layout__logout" @click="logout">Log out</button>
      </div>
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

.layout__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout__logo {
  width: 112px;
  height: auto;
  // The PNG has a white background. Multiply turns white into the page grey.
  mix-blend-mode: multiply;
}

.layout__logout {
  padding: 12px 4px;
  border: 0;
  background: none;
  color: $color-text-secondary;
  font: inherit;
  font-size: 14px;
  font-weight: $font-weight-semibold;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
