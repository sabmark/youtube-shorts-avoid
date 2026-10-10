(() => {
  'use strict';
  const api = globalThis.ShortsAvoid ||= {};
  api.Feedback = {
    normalize(value) { return value === 'not-interested' || value === 'channel' ? value : 'both'; },
    kinds(value) { return this.normalize(value) === 'both' ? ['not-interested', 'channel'] : [this.normalize(value)]; },
    label(value) {
      return this.normalize(value) === 'not-interested' ? 'Mark video not interested'
        : this.normalize(value) === 'channel' ? "Don't recommend this channel" : 'Avoid video and channel';
    }
  };
})();
