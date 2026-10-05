/// <reference types="vite/client" />

const assets = import.meta.glob('/src/assets/*', { eager: true, query: '?url', import: 'default' });
const files = import.meta.glob('/public/*', { eager: true, query: '?url', import: 'default' });

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // noop
}