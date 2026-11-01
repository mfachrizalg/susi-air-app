<script setup lang="ts">
import { useFlightHoursStore } from '~/stores/flightHours';

const flightHours = useFlightHoursStore();
void flightHours.load();
</script>

<template>
  <div class="home">
    <HomeHeader />

    <section class="section" aria-labelledby="limits-title">
      <h2 id="limits-title" class="section-title">Hours to limit</h2>
      <div v-if="flightHours.summary" class="limits">
        <LimitCard v-for="card in flightHours.summary.cards" :key="card.key" :card="card" />
      </div>
      <p v-else-if="flightHours.error" role="alert" class="status-text">{{ flightHours.error }}</p>
      <div v-else role="status" class="limits">
        <span class="sr-only">Loading hours…</span>
        <span v-for="n in 4" :key="n" class="skeleton skeleton--card" aria-hidden="true" />
      </div>
      <FlightHoursChart />
    </section>

    <DocumentList />
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.limits {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
