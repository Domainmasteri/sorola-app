import React, { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  fi: {
    nav: {
      home: 'Sorolan Työkalut',
      password: 'Salasanakone',
      qr: 'QR-Luoja',
      shortener: 'Linkinlyhennin',
      pastebin: 'Pastebin',
      share: 'Tiedostonjako',
    },
    language: {
      label: 'Kieli',
      finnish: 'Suomi',
      english: 'Englanti',
    },
    update: {
      availableTitle: 'Päivitys saatavilla',
      availableMessage: 'Sovelluksesta löytyi uusi versio. Haluatko asentaa sen nyt?',
      installNow: 'Asenna nyt',
      later: 'Myöhemmin',
      installFailedTitle: 'Päivitys epäonnistui',
      installFailedMessage: 'Päivityksen asennus ei onnistunut. Yritä myöhemmin uudelleen.',
    },
    home: {
      welcome: 'TERVETULOA!',
      subtitle: 'Valitse haluamasi IT-työkalu alta.',
      tools: {
        shortenerTitle: '🔗 Linkinlyhennin',
        shortenerDesc: 'Tee pitkistä urleista lyhyitä',
        pastebinTitle: '📝 Pastebin',
        pastebinDesc: 'Jaa tekstiä ja koodia turvallisesti',
        qrTitle: '🔲 QR-Luoja',
        qrDesc: 'Luo QR-koodeja ilmaiseksi',
        shareTitle: '📁 Tiedostonjako',
        shareDesc: 'Lataa ja jaa tiedostoja',
        passwordTitle: '🔑 Salasanakone',
        passwordDesc: 'Luo vahvoja salasanoja',
      },
    },
    password: {
      settingsTitle: '1. Muokkaa asetuksia',
      length: 'Pituus:',
      lower: 'Pienet kirjaimet (a-z)',
      upper: 'Isot kirjaimet (A-Z)',
      numbers: 'Numerot (0-9)',
      specials: 'Erikoismerkit (!@#...)',
      generate: '🔄 Arvo uusi salasana',
      ready: 'Valmis salasana',
      copied: '✅ Kopioitu!',
      copy: '📋 Kopioi leikepöydälle',
    },
    qr: {
      selectType: '1. Valitse tyyppi',
      website: 'Nettisivu',
      text: 'Teksti',
      wifi: 'Wi-Fi',
      phone: 'Puhelin',
      placeholderUrl: 'https://soro.la',
      placeholderText: 'Kirjoita viestisi tähän...',
      placeholderSsid: 'Verkon nimi (SSID)',
      placeholderPassword: 'Salasana',
      noPassword: 'Ei salasanaa',
      placeholderPhone: '+358401234567',
      refresh: 'Päivitä QR-koodi',
      readyCode: 'Valmis koodi',
      screenshotHint: 'Voit ottaa koodista näyttökuvan (Screenshot) ja jakaa sen!',
      defaultText: 'Moi!',
    },
    shortener: {
      create: 'Luo Lyhytlinkki',
      chooseDomain: 'Valitse domain:',
      urlToShorten: 'Lyhennettävä osoite:',
      placeholderUrl: 'https://esimerkki.fi/pitka-osoite...',
      emptyUrlError: 'Syötä ensin lyhennettävä osoite!',
      createError: 'Linkin luonti epäonnistui.',
      serverError: 'Palvelinvirhe. Tarkista verkkoyhteys.',
      shorten: 'Lyhennä linkki',
      ready: 'Linkki on valmis!',
      copied: '✅ Kopioitu!',
      copy: '📋 Kopioi linkki',
    },
    pastebin: {
      shareText: 'Jaa tekstiä tai koodia',
      placeholderText: 'Liitä koodi tai teksti tähän...',
      emptyError: 'Tekstikenttä on tyhjä!',
      saveError: 'Virhe tallennuksessa.',
      serverError: 'Palvelinvirhe. Tarkista verkkoyhteys.',
      save: 'Tallenna ja luo linkki',
      saved: 'Teksti tallennettu!',
      shareLinkHint: 'Jaa alla oleva linkki vastaanottajalle.',
      copied: '✅ Kopioitu!',
      copy: '📋 Kopioi linkki',
      createNew: 'Luo uusi',
    },
    share: {
      secureShare: 'Jaa tiedosto turvallisesti',
      retentionDays: 'Säilytysaika (päiviä):',
      daysSuffix: 'pv',
      downloadLimit: 'Latausrajoitus (0 = rajaton):',
      pickFile: '📄 Valitse tiedosto laitteelta',
      size: 'Koko:',
      encryptionHintStart: 'Jos haluat salata tiedoston päästä-päähän-salauksella, se onnistuu',
      sorolaSite: 'Sorolan',
      encryptionHintEnd: 'nettisivuilla.',
      pickError: 'Tiedoston valinta epäonnistui.',
      pickFirstError: 'Valitse ensin tiedosto!',
      uploadError: 'Lataus pilveen epäonnistui.',
      serverError: 'Palvelinvirhe. Onko tiedosto liian suuri (max 1 Gt)?',
      upload: 'Lataa pilveen',
      shared: 'Tiedosto jaettu!',
      shareLinkHint: 'Jaa alla oleva linkki vastaanottajalle.',
      copied: '✅ Kopioitu!',
      copy: '📋 Kopioi linkki',
      shareNew: 'Jaa uusi',
    },
  },
  en: {
    nav: {
      home: 'Sorola Tools',
      password: 'Password Generator',
      qr: 'QR Creator',
      shortener: 'Link Shortener',
      pastebin: 'Pastebin',
      share: 'File Sharing',
    },
    language: {
      label: 'Language',
      finnish: 'Finnish',
      english: 'English',
    },
    update: {
      availableTitle: 'Update available',
      availableMessage: 'A new app update is available. Do you want to install it now?',
      installNow: 'Install now',
      later: 'Later',
      installFailedTitle: 'Update failed',
      installFailedMessage: 'Could not install the update. Please try again later.',
    },
    home: {
      welcome: 'WELCOME!',
      subtitle: 'Choose the IT tool you want below.',
      tools: {
        shortenerTitle: '🔗 Link Shortener',
        shortenerDesc: 'Turn long URLs into short links',
        pastebinTitle: '📝 Pastebin',
        pastebinDesc: 'Share text and code securely',
        qrTitle: '🔲 QR Creator',
        qrDesc: 'Create QR codes for free',
        shareTitle: '📁 File Sharing',
        shareDesc: 'Upload and share files',
        passwordTitle: '🔑 Password Generator',
        passwordDesc: 'Create strong passwords',
      },
    },
    password: {
      settingsTitle: '1. Adjust settings',
      length: 'Length:',
      lower: 'Lowercase letters (a-z)',
      upper: 'Uppercase letters (A-Z)',
      numbers: 'Numbers (0-9)',
      specials: 'Special characters (!@#...)',
      generate: '🔄 Generate new password',
      ready: 'Generated password',
      copied: '✅ Copied!',
      copy: '📋 Copy to clipboard',
    },
    qr: {
      selectType: '1. Choose type',
      website: 'Website',
      text: 'Text',
      wifi: 'Wi-Fi',
      phone: 'Phone',
      placeholderUrl: 'https://soro.la',
      placeholderText: 'Write your message here...',
      placeholderSsid: 'Network name (SSID)',
      placeholderPassword: 'Password',
      noPassword: 'No password',
      placeholderPhone: '+358401234567',
      refresh: 'Update QR code',
      readyCode: 'Ready code',
      screenshotHint: 'Take a screenshot of the code and share it!',
      defaultText: 'Hi!',
    },
    shortener: {
      create: 'Create short link',
      chooseDomain: 'Choose domain:',
      urlToShorten: 'URL to shorten:',
      placeholderUrl: 'https://example.com/very-long-url...',
      emptyUrlError: 'Enter a URL to shorten first!',
      createError: 'Failed to create link.',
      serverError: 'Server error. Check your network connection.',
      shorten: 'Shorten link',
      ready: 'Your link is ready!',
      copied: '✅ Copied!',
      copy: '📋 Copy link',
    },
    pastebin: {
      shareText: 'Share text or code',
      placeholderText: 'Paste code or text here...',
      emptyError: 'Text field is empty!',
      saveError: 'Error while saving.',
      serverError: 'Server error. Check your network connection.',
      save: 'Save and create link',
      saved: 'Text saved!',
      shareLinkHint: 'Share the link below with the recipient.',
      copied: '✅ Copied!',
      copy: '📋 Copy link',
      createNew: 'Create new',
    },
    share: {
      secureShare: 'Share files securely',
      retentionDays: 'Retention time (days):',
      daysSuffix: 'd',
      downloadLimit: 'Download limit (0 = unlimited):',
      pickFile: '📄 Choose file from device',
      size: 'Size:',
      encryptionHintStart: 'If you want end-to-end encrypted sharing, use the',
      sorolaSite: 'Sorola',
      encryptionHintEnd: 'website.',
      pickError: 'Failed to select file.',
      pickFirstError: 'Select a file first!',
      uploadError: 'Cloud upload failed.',
      serverError: 'Server error. Is the file too large (max 1 GB)?',
      upload: 'Upload to cloud',
      shared: 'File shared!',
      shareLinkHint: 'Share the link below with the recipient.',
      copied: '✅ Copied!',
      copy: '📋 Copy link',
      shareNew: 'Share new',
    },
  },
};

const TranslationContext = createContext(null);

const getDefaultLanguage = () => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'fi';
  return locale.toLowerCase().startsWith('fi') ? 'fi' : 'en';
};

const getValueByPath = (obj, path) => {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
};

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState(getDefaultLanguage);

  const value = useMemo(() => {
    const t = (path) => {
      const selected = getValueByPath(translations[language], path);
      if (selected !== undefined) return selected;
      const fallback = getValueByPath(translations.fi, path);
      return fallback !== undefined ? fallback : path;
    };

    return {
      language,
      setLanguage,
      t,
    };
  }, [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used inside TranslationProvider');
  }

  return context;
}
