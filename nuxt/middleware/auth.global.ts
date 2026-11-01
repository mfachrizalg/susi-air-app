import { usePilotStore } from '~/stores/pilot';

// Loads the pilot once. Without a valid session the API answers 401, so go to Sign In.
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
