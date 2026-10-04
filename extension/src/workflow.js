(() => {
  'use strict';
  const api = globalThis.ShortsAvoid ||= {};
  class Workflow {
    constructor(adapter) {
      this.adapter = adapter;
      this.busy = false;
    }

    async run(onState = () => {}, action = 'avoid') {
      if (this.busy) return { status: 'busy', completed: [] };
      this.busy = true;
      const completed = [];
      onState({ status: 'busy', completed: [] });
      let result;
      try {
        const target = this.adapter.current();
        this.adapter.assertCurrent(target);
        if (action === 'like') {
          await this.adapter.like(target);
          completed.push('like');
        } else {
          await this.adapter.preflight(target);
          for (const kind of ['not-interested', 'channel']) {
            this.adapter.assertCurrent(target);
            await this.adapter.feedback(target, kind);
            completed.push(kind);
          }
        }
        const current = this.adapter.current();
        if (!current || current.id === target.id) await this.adapter.next(target);
        result = { status: 'complete', completed: [...completed], message: 'Feedback sent.' };
      } catch (error) {
        result = {
          status: completed.length ? 'partial' : 'stopped',
          completed: [...completed],
          code: error.code || 'unexpected',
          message: error.message || 'The feedback sequence could not be completed.'
        };
      } finally {
        this.busy = false;
      }
      onState(result);
      return result;
    }
  }
  api.Workflow = Workflow;
})();
