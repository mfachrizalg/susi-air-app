<script setup lang="ts">
import { CircleAlert, CircleCheck, CircleX } from 'lucide-vue-next';
import type { components } from '~/types/api';
import { useDocumentsStore } from '~/stores/documents';
import { formatDate } from '~/utils/format';

type Status = components['schemas']['DocumentDto']['status'];

const documents = useDocumentsStore();
void documents.load();

const STATUS_ICON = { safe: CircleCheck, soon: CircleAlert, expired: CircleX } as const;
const STATUS_TEXT: Record<Status, string> = { safe: 'Safe', soon: 'Soon', expired: 'Expired' };

// The API sends days remaining. A negative value means the document has expired.
const remaining = (days: number) => {
  if (days === 0) return 'Expires today';
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} remaining`;
  const overdue = Math.abs(days);
  return `${overdue} ${overdue === 1 ? 'day' : 'days'} overdue`;
};
</script>

<template>
  <section class="docs" aria-labelledby="docs-title">
    <h2 id="docs-title" class="section-title">My documents</h2>
    <div class="card">
      <p v-if="documents.error" role="alert" class="status-text">{{ documents.error }}</p>
      <p v-else-if="!documents.data" role="status" class="status-text">Loading documents…</p>
      <p v-else-if="documents.data.documents.length === 0" class="status-text">No documents.</p>
      <ul v-else class="docs__list">
        <li v-for="doc in documents.data.documents" :key="doc.id" class="doc">
          <div class="doc__text">
            <p class="doc__label">{{ doc.label }}</p>
            <p class="doc__meta">{{ formatDate(doc.expiryDate) }} · {{ remaining(doc.daysRemaining) }}</p>
          </div>
          <span class="badge" :class="`badge--${doc.status}`">
            <component :is="STATUS_ICON[doc.status]" :size="14" aria-hidden="true" />
            {{ STATUS_TEXT[doc.status] }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.docs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.docs__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.doc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #eef0f4;

  &:first-child {
    padding-top: 0;
    border-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
}

.doc__text {
  min-width: 0;
}

.doc__label {
  margin: 0;
  font-size: 15px;
  font-weight: $font-weight-semibold;
  color: $color-primary;
}

.doc__meta {
  margin: 2px 0 0;
  font-size: 13px;
  color: $color-text-secondary;
}

// Status uses a tint, an icon, and text. Colour is never the only cue.
.badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: $radius-pill;
  font-size: 13px;
  font-weight: $font-weight-semibold;
  color: $color-primary;
}

.badge--safe {
  background: rgba($color-success, 0.14);

  svg {
    color: $color-success;
  }
}

.badge--soon {
  background: rgba($color-warning, 0.2);

  svg {
    color: $color-warning;
  }
}

.badge--expired {
  background: rgba($color-danger, 0.14);

  svg {
    color: $color-danger;
  }
}
</style>
