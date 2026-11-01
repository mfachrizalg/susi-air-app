<script setup lang="ts">
import { usePilotStore } from '~/stores/pilot';
import { formatHours } from '~/utils/format';

const pilot = usePilotStore();
</script>

<template>
  <header class="home-header">
    <div class="home-header__text">
      <p class="home-header__greeting">Welcome back,</p>
      <h1 class="home-header__name">{{ pilot.profile?.name ?? (pilot.error ? '' : 'Loading…') }}</h1>
      <p v-if="pilot.profile" class="home-header__total">
        <span class="home-header__hours num">{{ formatHours(pilot.profile.totalFlightHours) }}</span>
        <span>total flight hours</span>
      </p>
      <p v-else-if="pilot.error" role="alert" class="status-text">{{ pilot.error }}</p>
    </div>
    <img
      v-if="pilot.profile"
      class="home-header__avatar"
      :src="pilot.profile.avatarUrl"
      alt=""
      width="56"
      height="56"
    />
  </header>
</template>

<style lang="scss" scoped>
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.home-header__greeting {
  margin: 0;
  font-size: 14px;
  color: $color-text-secondary;
}

.home-header__name {
  margin: 2px 0 0;
  font-size: 24px;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.home-header__total {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 0;
  font-size: 14px;
  color: $color-text-secondary;
}

.home-header__hours {
  font-size: 26px;
  color: $color-primary;
}

.home-header__avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $color-card;
  box-shadow: $shadow-card;
  object-fit: cover;
}
</style>
