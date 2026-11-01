<script setup lang="ts">
import { BookOpen, CalendarDays, Ellipsis, House } from 'lucide-vue-next';

const route = useRoute();
const onSchedule = computed(() => route.path.startsWith('/schedule'));
</script>

<template>
  <nav class="nav" aria-label="Main">
    <ul class="nav__list">
      <li>
        <NuxtLink to="/" class="nav__item" :aria-current="route.path === '/' ? 'page' : undefined">
          <House :size="22" aria-hidden="true" />
          <span>Home</span>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/schedule" class="nav__item" :aria-current="onSchedule ? 'page' : undefined">
          <CalendarDays :size="22" aria-hidden="true" />
          <span>Schedule</span>
        </NuxtLink>
      </li>
      <li>
        <span class="nav__item nav__item--disabled" role="link" aria-disabled="true">
          <BookOpen :size="22" aria-hidden="true" />
          <span>Logbook</span>
        </span>
      </li>
      <li>
        <span class="nav__item nav__item--disabled" role="link" aria-disabled="true">
          <Ellipsis :size="22" aria-hidden="true" />
          <span>More</span>
        </span>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 10;
  width: 100%;
  max-width: 560px;
  transform: translateX(-50%);
  background: $color-card;
  box-shadow: 0 -1px 0 rgba(14, 33, 56, 0.06), 0 -4px 16px rgba(14, 33, 56, 0.04);
}

.nav__list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
  list-style: none;
}

.nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
  text-decoration: none;

  &[aria-current='page'] {
    color: $color-primary;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.nav__item--disabled {
  color: #9ca3af;
  cursor: not-allowed;
}
</style>
