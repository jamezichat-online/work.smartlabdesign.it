/* SmartLab Analytics: una visualizzazione per apertura; nessun cookie o profilo. */
(() => {
  if (window.__smartlabAnalyticsLoaded) return;
  window.__smartlabAnalyticsLoaded = true;
  const script = document.currentScript;
  if (!script || !script.src || window.top !== window.self) return;
  const endpoint = new URL('/api/collect', script.src).href;
  // Esclusione facoltativa del proprietario. Questa preferenza resta locale.
  try {
    const ignore = new URLSearchParams(location.search).get('smartlab-ignore');
    if (ignore === '1') localStorage.setItem('smartlab-ignore', '1');
    if (ignore === '0') localStorage.removeItem('smartlab-ignore');
    if (localStorage.getItem('smartlab-ignore') === '1') return;
  } catch {}
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  let sent = false;
  const send = () => {
    if (sent || document.visibilityState !== 'visible') return;
    sent = true;
    document.removeEventListener('visibilitychange', send);
    const data = { path: location.pathname, eventId: crypto.randomUUID() };
    fetch(endpoint, {
      method: 'POST', body: JSON.stringify(data),
      headers: { 'Content-Type': 'text/plain' },
      credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true
    }).catch(() => {});
  };
  send();
  if (!sent) document.addEventListener('visibilitychange', send);
})();
