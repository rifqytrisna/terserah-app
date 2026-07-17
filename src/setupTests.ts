import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Create a mock localStorage if it doesn't exist or doesn't have the necessary methods
class MockStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

// Only create mock if localStorage isn't properly implemented
if (!globalThis.localStorage || typeof globalThis.localStorage.setItem !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MockStorage(),
    writable: false,
    enumerable: true,
    configurable: true,
  });
}

// Reset localStorage before each test
beforeEach(() => {
  if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
    globalThis.localStorage.clear();
  }
});
