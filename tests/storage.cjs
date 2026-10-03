function storage(initial = {}) {
  const data = structuredClone(initial);
  const listeners = [];
  return {
    local: {
      async get(key) { return { [key]: structuredClone(data[key]) }; },
      async set(values) {
        const changes = {};
        for (const [key, value] of Object.entries(values)) {
          changes[key] = { oldValue: data[key], newValue: structuredClone(value) };
          data[key] = structuredClone(value);
        }
        for (const listener of listeners) listener(changes, 'local');
      }
    },
    onChanged: { addListener(listener) { listeners.push(listener); } }
  };
}
module.exports = { storage };
