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
      jsonFormatter: 'JSON-muotoilija',
      help: 'Työkaluohjeet',
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
      helpButtonTitle: '📖 Työkalujen ohjeet',
      helpButtonDesc: 'Katso mitä työkalut tekevät ja miten niitä käytetään.',
      basicToolsTitle: 'Perustyökalut',
      basicToolsDesc: 'Nopeat työkalut linkeille, tiedostoille, salasanoille ja QR-koodeille.',
      advancedToolsTitle: 'Edistyneet työkalut',
      advancedToolsDesc: 'Teknisemmät apuvälineet esimerkiksi kehittäjille ja datan käsittelyyn.',
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
        jsonFormatterTitle: '🔧 JSON-muotoilija',
        jsonFormatterDesc: 'Muotoile ja validoi JSON-dataa paikallisesti',
        downloadAppTitle: 'Päivitä sovellus',
        downloadAppDesc: 'Lataa uusin Android-versio (APK)',
      },
    },
    help: {
      title: 'Työkaluohjeet',
      intro: 'Täältä löydät lyhyet käyttöohjeet kaikille sovelluksen työkaluille.',
      openTool: 'Avaa työkalu',
      tools: {
        shortener: {
          description: 'Luo pitkästä verkko-osoitteesta lyhyempi ja helpommin jaettava linkki.',
          step1: 'Valitse haluamasi domain ja liitä lyhennettävä osoite kenttään.',
          step2: 'Paina lyhennyspainiketta ja odota uuden linkin muodostumista.',
          step3: 'Kopioi valmis linkki ja jaa se eteenpäin.',
        },
        pastebin: {
          description: 'Jaa tekstiä tai koodia väliaikaisella linkillä.',
          step1: 'Liitä tekstisi tai koodisi syötekenttään.',
          step2: 'Tallenna sisältö palveluun ja luo jakolinkki.',
          step3: 'Kopioi syntynyt linkki vastaanottajalle.',
        },
        qr: {
          description: 'Luo QR-koodi nettisivulle, tekstille, Wi-Fi-verkolle tai puhelinnumerolle.',
          step1: 'Valitse QR-koodin tyyppi yläreunan painikkeista.',
          step2: 'Täytä valitun tyypin tiedot syötekenttiin.',
          step3: 'Päivitä QR-koodi ja jaa se esimerkiksi kuvakaappauksena.',
        },
        share: {
          description: 'Lataa tiedosto pilveen ja luo siitä helposti jaettava linkki.',
          step1: 'Valitse tiedosto laitteeltasi.',
          step2: 'Aseta halutessasi säilytysaika ja latausrajoitus.',
          step3: 'Lataa tiedosto ja kopioi valmis jakolinkki.',
        },
        password: {
          description: 'Luo vahva salasana valitsemillasi merkkiasetuksilla.',
          step1: 'Säädä salasanan pituus ja käytettävät merkkityypit.',
          step2: 'Arvo uusi salasana asetusten perusteella.',
          step3: 'Kopioi valmis salasana leikepöydälle talteen.',
        },
        download: {
          description: 'Avaa sivu, josta voit ladata sovelluksen uusimman Android-version.',
          step1: 'Avaa lataussivu sovelluksen napista.',
          step2: 'Lataa uusin APK-paketti laitteellesi.',
          step3: 'Asenna päivitys Androidin ohjeiden mukaisesti.',
        },
        jsonFormatter: {
          description: 'Muotoile, pakkaa ja validoi JSON-dataa täysin paikallisesti.',
          step1: 'Liitä JSON-data syötekenttään.',
          step2: 'Muotoile tai pakkaa sisältö painikkeilla.',
          step3: 'Kopioi valmis tulos leikepöydälle tai tyhjennä kentät.',
        },
      },
    },
    jsonFormatter: {
      inputTitle: '1. Liitä JSON-data',
      outputTitle: '2. Tulos',
      localHint: 'Kaikki käsittely tapahtuu paikallisesti tässä sovelluksessa.',
      placeholder: 'Liitä JSON tähän, esimerkiksi {"nimi":"Testi","arvo":42}',
      outputPlaceholder: 'Muotoiltu JSON näkyy tässä...',
      format: '✨ Muotoile',
      minify: '📦 Pakkaa',
      clear: '🗑️ Tyhjennä',
      copy: '📋 Kopioi leikepöydälle',
      copied: '✅ Kopioitu!',
      emptyError: '⚠️ Syötekenttä on tyhjä.',
      invalidError: '❌ Virheellinen JSON: {error}',
      formatSuccess: '✅ JSON on kelvollinen ja muotoiltu onnistuneesti.',
      minifySuccess: '✅ JSON pakattu onnistuneesti.',
      copyFirstError: '⚠️ Ei kopioitavaa – muotoile ensin JSON.',
      copySuccess: '✅ JSON kopioitiin leikepöydälle.',
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
      jsonFormatter: 'JSON Formatter',
      help: 'Tool Instructions',
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
      helpButtonTitle: '📖 Tool instructions',
      helpButtonDesc: 'See what each tool does and how to use it.',
      basicToolsTitle: 'Basic tools',
      basicToolsDesc: 'Fast tools for links, files, passwords and QR codes.',
      advancedToolsTitle: 'Advanced tools',
      advancedToolsDesc: 'More technical helpers for developers and data handling.',
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
        jsonFormatterTitle: '🔧 JSON Formatter',
        jsonFormatterDesc: 'Format and validate JSON locally',
        downloadAppTitle: 'Update App',
        downloadAppDesc: 'Download the latest Android version (APK)',
      },
    },
    help: {
      title: 'Tool Instructions',
      intro: 'Here you can find short usage instructions for every tool in the app.',
      openTool: 'Open tool',
      tools: {
        shortener: {
          description: 'Turn a long web address into a shorter link that is easier to share.',
          step1: 'Choose the domain you want and paste the URL into the field.',
          step2: 'Press the shorten button and wait for the new link to be created.',
          step3: 'Copy the finished link and share it forward.',
        },
        pastebin: {
          description: 'Share text or code with a temporary link.',
          step1: 'Paste your text or code into the input field.',
          step2: 'Save the content to the service and create a share link.',
          step3: 'Copy the generated link for the recipient.',
        },
        qr: {
          description: 'Create a QR code for a website, text, Wi-Fi network or phone number.',
          step1: 'Choose the QR code type from the buttons at the top.',
          step2: 'Fill in the fields for the selected type.',
          step3: 'Refresh the QR code and share it, for example with a screenshot.',
        },
        share: {
          description: 'Upload a file to the cloud and create a link that is easy to share.',
          step1: 'Choose a file from your device.',
          step2: 'Optionally set the retention time and download limit.',
          step3: 'Upload the file and copy the finished share link.',
        },
        password: {
          description: 'Create a strong password with the character options you choose.',
          step1: 'Adjust the password length and enabled character types.',
          step2: 'Generate a new password from the selected settings.',
          step3: 'Copy the generated password to your clipboard.',
        },
        download: {
          description: 'Open the page where you can download the latest Android version of the app.',
          step1: 'Open the download page from the app button.',
          step2: 'Download the latest APK package to your device.',
          step3: 'Install the update by following Android instructions.',
        },
        jsonFormatter: {
          description: 'Format, minify and validate JSON data completely locally.',
          step1: 'Paste your JSON data into the input field.',
          step2: 'Use the buttons to format or minify the content.',
          step3: 'Copy the result to your clipboard or clear the fields.',
        },
      },
    },
    jsonFormatter: {
      inputTitle: '1. Paste JSON data',
      outputTitle: '2. Result',
      localHint: 'All processing happens locally in this app.',
      placeholder: 'Paste JSON here, for example {"name":"Test","value":42}',
      outputPlaceholder: 'Formatted JSON will appear here...',
      format: '✨ Format',
      minify: '📦 Minify',
      clear: '🗑️ Clear',
      copy: '📋 Copy to clipboard',
      copied: '✅ Copied!',
      emptyError: '⚠️ The input field is empty.',
      invalidError: '❌ Invalid JSON: {error}',
      formatSuccess: '✅ JSON is valid and was formatted successfully.',
      minifySuccess: '✅ JSON was minified successfully.',
      copyFirstError: '⚠️ Nothing to copy – format JSON first.',
      copySuccess: '✅ JSON was copied to the clipboard.',
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
    const interpolate = (template, values = {}) => {
      if (typeof template !== 'string') {
        return template;
      }

      return Object.entries(values).reduce(
        (result, [key, replacement]) => result.split(`{${key}}`).join(String(replacement)),
        template
      );
    };

    const t = (path, values) => {
      const selected = getValueByPath(translations[language], path);
      if (selected !== undefined) return interpolate(selected, values);
      const fallback = getValueByPath(translations.fi, path);
      return fallback !== undefined ? interpolate(fallback, values) : path;
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
