import '@testing-library/jest-dom';

// jsdom does not implement ResizeObserver — provide a no-op stub
(globalThis as Record<string, unknown>).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
