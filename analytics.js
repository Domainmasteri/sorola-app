import { Platform } from 'react-native';

const PLAUSIBLE_DOMAIN = 'sorola.fi';
const PLAUSIBLE_SCRIPT_URL = 'https://plausible.io/js/pa-YNdLPWi1IRdbPeUxj0Qa6.js';
const PLAUSIBLE_EVENT_URL = 'https://plausible.io/api/event';

let webAnalyticsInitialized = false;
let lastTrackedUrl = '';

function getScreenUrl(screenName) {
  return `app://sorola/${String(screenName || 'home').toLowerCase()}`;
}

export function initializeAnalytics() {
  if (Platform.OS !== 'web' || webAnalyticsInitialized || typeof document === 'undefined') {
    return;
  }

  if (!document.querySelector(`script[src="${PLAUSIBLE_SCRIPT_URL}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = PLAUSIBLE_SCRIPT_URL;
    document.head.appendChild(script);
  }

  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
  window.plausible.init = window.plausible.init || function(options) {
    window.plausible.o = options || {};
  };
  window.plausible.init();

  webAnalyticsInitialized = true;
}

export async function trackScreenView(screenName) {
  const url = getScreenUrl(screenName);

  if (lastTrackedUrl === url) {
    return;
  }

  lastTrackedUrl = url;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible('pageview', {
      u: url,
      props: {
        platform: 'web-app',
        screen: screenName,
      },
    });
    return;
  }

  try {
    await fetch(PLAUSIBLE_EVENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        name: 'pageview',
        url,
        domain: PLAUSIBLE_DOMAIN,
        props: {
          platform: Platform.OS,
          screen: screenName,
          source: 'sorola-app',
        },
      }),
    });
  } catch {
    // Ignore analytics failures silently.
  }
}
