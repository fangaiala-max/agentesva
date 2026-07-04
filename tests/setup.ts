// happy-dom no implementa IntersectionObserver (usado por los count-up de stats);
// stub inerte suficiente para que initHome/initDirectory no fallen en tests.
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  // @ts-expect-error — stub parcial a propósito
  globalThis.IntersectionObserver = IOStub;
}
