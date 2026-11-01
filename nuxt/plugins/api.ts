const isEnvelope = (body: unknown): body is { data: unknown } =>
  typeof body === 'object' && body !== null && 'data' in body;

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    onResponse({ response }) {
      if (response.ok && isEnvelope(response._data)) {
        response._data = response._data.data;
      }
    },
    async onResponseError({ request, response }) {
      if (response.status === 401 && !String(request).endsWith('/auth/login')) {
        await nuxtApp.runWithContext(() => navigateTo('/login'));
      }
    },
  });

  return { provide: { api } };
});
