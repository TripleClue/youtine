/**
 * Youtine cookie consent banner.
 * Shared across every page so a first-time visitor sees it wherever they land.
 * Pairs with the in-page loadMixpanel() gate: analytics only loads on opt-in.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'youtine_cookie_consent';
  var analyticsOn = false;

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); }
    catch (e) { return null; }
  }

  function injectStyles() {
    if (document.getElementById('cookie-banner-styles')) return;
    var style = document.createElement('style');
    style.id = 'cookie-banner-styles';
    style.textContent =
      '@keyframes cookieUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }' +
      '@media (max-width: 480px) {' +
      '  #cookie-banner > div { padding: 1.5rem !important; }' +
      '  #cookie-banner .cookie-actions { flex-direction: column !important; }' +
      '  #cookie-banner .cookie-actions > button { width: 100% !important; text-align: center !important; }' +
      '}';
    document.head.appendChild(style);
  }

  var BTN_BASE = 'padding:0.65rem 1.4rem; border-radius:100px; font-family:var(--font-sans); font-size:0.85rem; font-weight:600; cursor:pointer; transition:opacity 0.2s;';

  var BANNER_HTML =
    '<div id="cookie-banner" role="dialog" aria-modal="true" aria-label="Cookie consent" style="display:none; position:fixed; bottom:0; left:0; right:0; z-index:200; padding:0 1.5rem 1.5rem; pointer-events:none;">' +
      '<div style="max-width:720px; margin:0 auto; background:#fff; border-radius:10px; padding:2rem; box-shadow:0 8px 40px rgba(0,0,0,0.12); pointer-events:all; animation:cookieUp 0.4s ease;">' +
        '<p style="font-family:var(--font-serif, var(--font-sans)); font-size:1.15rem; font-weight:600; color:var(--color-text); margin-bottom:0.5rem;">A quiet word about cookies.</p>' +
        '<p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.65; margin-bottom:1.25rem;">We use a small number of tracking technologies to keep Youtine running and to understand how it’s being used — so we can make it better. You’re in control of what you share.</p>' +
        '<div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">' +
          '<div style="display:flex; align-items:center; gap:1rem; background:var(--color-bg-warm); border-radius:10px; padding:0.85rem 1rem;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:0.9rem; font-weight:600; color:var(--color-text);">Strictly necessary</div>' +
              '<div style="font-size:0.8rem; color:var(--color-text-light);">Keeps the site working. Always on.</div>' +
            '</div>' +
            '<div style="flex-shrink:0; width:44px; height:26px; border-radius:100px; background:rgba(188,141,255,0.25); border:1.5px solid rgba(188,141,255,0.3); position:relative;">' +
              '<div style="position:absolute; top:3px; left:21px; width:18px; height:18px; border-radius:50%; background:#BC8DFF; box-shadow:0 1px 3px rgba(0,0,0,0.15);"></div>' +
            '</div>' +
          '</div>' +
          '<label for="cookie-analytics" style="display:flex; align-items:center; gap:1rem; background:var(--color-bg-warm); border-radius:10px; padding:0.85rem 1rem; cursor:pointer;">' +
            '<input type="checkbox" id="cookie-analytics" style="display:none;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:0.9rem; font-weight:600; color:var(--color-text);">Analytics (Mixpanel)</div>' +
              '<div style="font-size:0.8rem; color:var(--color-text-light);">Helps us understand how people use our website, so we can improve it. Data is processed by Mixpanel (may include US transfer).</div>' +
            '</div>' +
            '<div id="analytics-toggle" style="flex-shrink:0; width:44px; height:26px; border-radius:100px; background:var(--color-bg-soft); border:1.5px solid var(--color-border); position:relative; transition:background 0.2s;">' +
              '<div id="analytics-knob" style="position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:white; box-shadow:0 1px 3px rgba(0,0,0,0.15); transition:transform 0.2s;"></div>' +
            '</div>' +
          '</label>' +
        '</div>' +
        '<div class="cookie-actions" style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1rem;">' +
          '<button id="cookie-accept-all" style="' + BTN_BASE + ' border:none; background:#BC8DFF; color:white;">Accept all</button>' +
          '<button id="cookie-save" style="' + BTN_BASE + ' background:var(--color-bg-warm); color:var(--color-text); border:1.5px solid var(--color-border);">Save my choices</button>' +
          '<button id="cookie-reject-all" style="' + BTN_BASE + ' background:transparent; color:var(--color-text-secondary); border:1.5px solid var(--color-border);">Reject non-essential</button>' +
        '</div>' +
        '<p style="font-size:0.78rem; color:var(--color-text-light); margin:0;">You can update your preferences at any time, or read our <a href="/cookies" style="color:#BC8DFF; text-decoration:underline; text-underline-offset:2px;">Cookie Policy</a>.</p>' +
      '</div>' +
    '</div>';

  function saveConsent(analytics) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() }));
    if (analytics && typeof window.loadMixpanel === 'function') {
      window.loadMixpanel();
    }
    hideBanner();
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.style.opacity = '0';
    banner.style.transition = 'opacity 0.3s ease';
    setTimeout(function () { banner.style.display = 'none'; }, 300);
  }

  function updateToggle(on) {
    analyticsOn = on;
    var toggle = document.getElementById('analytics-toggle');
    var knob = document.getElementById('analytics-knob');
    var cb = document.getElementById('cookie-analytics');
    if (on) {
      toggle.style.background = '#BC8DFF';
      toggle.style.borderColor = '#BC8DFF';
      knob.style.transform = 'translateX(18px)';
      cb.checked = true;
    } else {
      toggle.style.background = 'var(--color-bg-soft)';
      toggle.style.borderColor = 'var(--color-border)';
      knob.style.transform = 'translateX(0)';
      cb.checked = false;
    }
  }

  function init() {
    // Only build/show the banner when no choice has been recorded yet.
    if (getConsent()) return;

    injectStyles();
    var holder = document.createElement('div');
    holder.innerHTML = BANNER_HTML;
    document.body.appendChild(holder.firstChild);
    document.getElementById('cookie-banner').style.display = 'block';

    document.getElementById('analytics-toggle').addEventListener('click', function () {
      updateToggle(!analyticsOn);
    });
    document.getElementById('cookie-accept-all').addEventListener('click', function () {
      updateToggle(true);
      saveConsent(true);
    });
    document.getElementById('cookie-reject-all').addEventListener('click', function () {
      updateToggle(false);
      saveConsent(false);
    });
    document.getElementById('cookie-save').addEventListener('click', function () {
      saveConsent(analyticsOn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
