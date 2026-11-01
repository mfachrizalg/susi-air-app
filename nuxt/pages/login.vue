<script setup lang="ts">
import type { components } from '~/types/api';

definePageMeta({ layout: 'auth' });

type LoginResult = components['schemas']['LoginResultDto'];

const api = useNuxtApp().$api;
const username = ref('');
const password = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);

async function submit() {
  submitting.value = true;
  error.value = null;
  try {
    // The server sets the httpOnly `token` cookie. This page never reads the token.
    await api<LoginResult>('/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    });
    await navigateTo('/');
  } catch (err) {
    error.value = (err as { data?: { message?: string } }).data?.message ?? 'Could not sign in. Try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="login">
    <img class="login__logo" src="/brand/susiair-logo.png" alt="Susi Air" />
    <h1 class="sr-only">Sign in to the Susi Air Pilot App</h1>
    <form class="login__form" @submit.prevent="submit">
      <label class="field">
        <span class="field__label">Username</span>
        <input v-model="username" class="field__input" name="username" autocomplete="username" required />
      </label>
      <label class="field">
        <span class="field__label">Password</span>
        <input
          v-model="password"
          class="field__input"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>
      <p v-if="error" role="alert" class="login__error">{{ error }}</p>
      <button type="submit" class="btn-primary login__submit" :disabled="submitting">Sign in</button>
    </form>
  </section>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 36px 24px;
  background: $color-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}

.login__logo {
  width: 180px;
  height: auto;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 14px;
  font-weight: $font-weight-semibold;
  color: $color-text-secondary;
}

.field__input {
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d1d5db;
  border-radius: $radius-control;
  background: $color-card;
  color: $color-text;
  font: inherit;
  font-size: 16px;

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 1px;
  }
}

.login__error {
  margin: 0;
  font-size: 14px;
  font-weight: $font-weight-semibold;
  text-align: center;
  color: $color-text;
}

.login__submit {
  width: 100%;
  margin-top: 8px;
  font-size: 16px;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
}
</style>
