import { usePilotStore } from '~/stores/pilot';

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return;
  try {
    await usePilotStore().load();
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      return navigateTo('/login');
    }
  }
});
