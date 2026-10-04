function storage(initial = {}) {
  const data = structuredClone(initial);
  const listeners = [];
  return {
    local: {
      async get(key) { return Object.fromEntries((Array.isArray(key) ? key : [key]).map(name => [name, structuredClone(data[name])])); },
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
