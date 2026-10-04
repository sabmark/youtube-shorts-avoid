(() => {
  'use strict';
  // Chromium truncates fractional auto heights in native toolbar popups.
  const shell = document.querySelector('.popup-shell');
  if (window.ResizeObserver) {
    const sizeObserver = new ResizeObserver(() => {
      document.documentElement.style.height = `${Math.ceil(shell.getBoundingClientRect().height)}px`;
    });
    sizeObserver.observe(shell);
  }
  document.getElementById('settings').addEventListener('click', () => {
    void chrome.runtime.openOptionsPage().catch(() => {
      const status = document.getElementById('status');
      status.hidden = false;
      status.textContent = 'Could not open settings. Use the browser extensions page.';
    });
  });
})();
