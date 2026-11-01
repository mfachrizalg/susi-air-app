// Every API response is { success, statusCode, message, data }. Callers get `data`.
const isEnvelope = (body: unknown): body is { data: unknown } =>
  typeof body === 'object' && body !== null && 'data' in body;

export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    baseURL: '/api',
    onResponse({ response }) {
      // Also runs for error responses, so unwrap success bodies only. Error bodies keep `message`.
      if (response.ok && isEnvelope(response._data)) {
        response._data = response._data.data;
      }
    },
    async onResponseError({ request, response }) {
      // A bad-credentials 401 from the login call stays on the page, which shows the message.
      if (response.status === 401 && !String(request).endsWith('/auth/login')) {
        await nuxtApp.runWithContext(() => navigateTo('/login'));
      }
    },
  });

  return { provide: { api } };
});
