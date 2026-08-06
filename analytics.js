import { Platform } from 'react-native';

export const PLAUSIBLE_DOMAIN = 'sorola.fi';
export const PLAUSIBLE_SCRIPT_URL = 'https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.tagged-events.js';
export const PLAUSIBLE_EVENT_URL = 'https://plausible.io/api/event';
export const PLAUSIBLE_BASE_URL = 'https://sorola.fi';

const APP_SOURCE = 'sorola-app';

let webAnalyticsInitialized = false;
let lastTrackedUrl = '';

function getScreenUrl(screenName) {
  const routes = {
    Home: `${PLAUSIBLE_BASE_URL}/`,
    Shortener: `${PLAUSIBLE_BASE_URL}/lyhennin/`,
    Pastebin: `${PLAUSIBLE_BASE_URL}/pastebin/`,
    QR: `${PLAUSIBLE_BASE_URL}/qr/`,
    Share: `${PLAUSIBLE_BASE_URL}/jako/`,
    Password: `${PLAUSIBLE_BASE_URL}/salasanat/`,
    JsonFormatter: `${PLAUSIBLE_BASE_URL}/json/`,
    ToolHelp: `${PLAUSIBLE_BASE_URL}/ohjeet/`,
    Changelog: `${PLAUSIBLE_BASE_URL}/sovellus/muutoshistoria/`,
    Privacy: `${PLAUSIBLE_BASE_URL}/sovellus/tietosuoja/`,
  };

  return routes[screenName] || `${PLAUSIBLE_BASE_URL}/`;
}

function createEventPayload(name, url, props = {}) {
  return {
    name,
    url,
    domain: PLAUSIBLE_DOMAIN,
    props: {
      source: APP_SOURCE,
      platform: Platform.OS,
      ...props,
    },
  };
}

async function sendNativeEvent(name, url, props = {}) {
  try {
    await fetch(PLAUSIBLE_EVENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(createEventPayload(name, url, props)),
    });
  } catch {
    // Ignore analytics failures silently.
  }
}

export function initializeAnalytics() {
  if (Platform.OS !== 'web' || webAnalyticsInitialized || typeof document === 'undefined') {
    return;
  }

  if (!document.querySelector(`script[src="${PLAUSIBLE_SCRIPT_URL}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.domain = PLAUSIBLE_DOMAIN;
    script.src = PLAUSIBLE_SCRIPT_URL;
    document.head.appendChild(script);
  }

  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };

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
        source: APP_SOURCE,
        platform: 'web-app',
        screen: screenName,
      },
    });
    return;
  }

  await sendNativeEvent('pageview', url, { screen: screenName });
}

export async function trackEvent(name, options = {}) {
  const url = options.url || getScreenUrl(options.screenName || 'Home');
  const props = {
    ...options.props,
  };

  if (options.screenName) {
    props.screen = options.screenName;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(name, {
      u: url,
      props: {
        source: APP_SOURCE,
        platform: 'web-app',
        ...props,
      },
    });
    return;
  }

  await sendNativeEvent(name, url, props);
}
