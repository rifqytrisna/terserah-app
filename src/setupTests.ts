import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Node 25's experimental Web Storage support installs a `localStorage` global
// ahead of jsdom, but its methods (getItem/setItem/...) are undefined stubs
// rather than a working implementation. jsdom would otherwise provide a real
// Storage, but we can't rely on that across Node versions/CI runners. To keep
// test behavior identical everywhere, we install this faithful in-memory
// Storage implementation unconditionally, regardless of what globalThis
// already has.
class MockStorage implements Storage {
  #store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.#store.has(key) ? (this.#store.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.#store.delete(key);
  }

  clear(): void {
    this.#store.clear();
  }

  key(index: number): string | null {
    return Array.from(this.#store.keys())[index] ?? null;
  }

  get length(): number {
    return this.#store.size;
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MockStorage(),
  writable: false,
  enumerable: true,
  configurable: true,
});

// Isolate localStorage between tests project-wide, so state from one test
// file/case never leaks into the next.
beforeEach(() => {
  globalThis.localStorage.clear();
});
