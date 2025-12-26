const listeners = new Map();

export const authEvents = {
  on(eventName, handler) {
    const set = listeners.get(eventName) ?? new Set();
    set.add(handler);
    listeners.set(eventName, set);

    return () => {
      set.delete(handler);
      if (set.size === 0) listeners.delete(eventName);
    };
  },

  emit(eventName, payload) {
    const set = listeners.get(eventName);
    if (!set) return;
    for (const fn of set) fn(payload);
  },
};