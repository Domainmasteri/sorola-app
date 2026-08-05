import { Platform } from 'react-native';

export const PLAUSIBLE_DOMAIN = 'sorola-app.fi';
export const PLAUSIBLE_SCRIPT_URL = 'https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.tagged-events.js';
export const PLAUSIBLE_EVENT_URL = 'https://plausible.io/api/event';

const APP_SOURCE = 'sorola-app';

let webAnalyticsInitialized = false;
let lastTrackedUrl = '';

function getScreenUrl(screenName) {
  const routes = {
    Home: 'https://sorola.fi/',
    Shortener: 'https://sorola.fi/lyhennin/',
    Pastebin: 'https://sorola.fi/pastebin/',
    QR: 'https://sorola.fi/qr/',
    Share: 'https://sorola.fi/jako/',
    Password: 'https://sorola.fi/salasanat/',
    JsonFormatter: 'https://sorola.fi/json/',
    ToolHelp: 'https://sorola.fi/ohjeet/',
    Changelog: 'https://sorola.fi/sovellus/muutoshistoria/',
    Privacy: 'https://sorola.fi/sovellus/tietosuoja/',
  };

  return routes[screenName] || 'https://sorola.fi/';
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
