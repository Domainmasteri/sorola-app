# Salapurku / ExportView – toteutusmäärittely

## Tavoite

Lisätään sovellukseen paikallinen työkalu, jolla käyttäjä voi avata tuettujen salasananhallintaohjelmien vientitiedostoja ja tarkastella niitä selkeässä taulukossa.

Työkalun nimet:

- suomeksi: **Salapurku**
- englanniksi: **ExportView**

Työkalun pitää toimia kokonaan käyttäjän selaimessa. Backend-palvelua, upload-endpointia tai muuta palvelimelle lähtevää tiedonsiirtoa ei saa käyttää vientitiedoston, salasanan tai puretun datan käsittelyyn.

Ensimmäiset tuetut ohjelmat ovat:

1. Bitwarden
2. Proton Pass

Rakenne pitää toteuttaa niin, että uusia salasananhallintaohjelmia voidaan lisätä myöhemmin omana parserinaan.

## Käyttöliittymä

Työkalussa on sekä suomenkielinen että englanninkielinen käyttöliittymä. Molempien pitää käyttää sovelluksen muuta sivustoa vastaavaa yleistä tyyliä.

Käyttöliittymässä on:

1. Lyhyt kuvaus työkalusta.
2. Selkeä tietoturvahuomio siitä, että tiedosto käsitellään paikallisesti selaimessa.
3. Alasvetovalikko salasananhallintaohjelman valitsemiseen.
4. Vientitiedoston valinta.
5. Salasanakysely salatuille tiedostoille.
6. Hakukenttä tulosten suodattamiseen.
7. Tyhjennä tulokset -painike.
8. Lataa CSV -painike.
9. Linkki käyttöohjeeseen.
10. Linkki tietosuojaselosteeseen.

Alasvetovalikon vaihtoehdot:

- Bitwarden
- Proton Pass

Suomenkieliset käyttöliittymätekstit kirjoitetaan suomeksi ja englanninkieliset englanniksi. Työkalua ei saa kuvata Bitwarden-kohtaisena, koska sama työkalu tukee useita salasananhallintaohjelmia.

Tiedoston valinnan tekstin pitää olla yleinen, esimerkiksi:

- FI: `Valitse vientitiedosto`
- EN: `Choose export file`

Tiedostosyötteen tulee hyväksyä ainakin:

```text
.json
.zip
.pgp
.gpg
application/json
application/zip
application/pgp-encrypted
```

## Näytettävä taulukko

Purettu data näytetään taulukossa, jossa on vain nämä näkyvät sarakkeet:

| Suomi | English | Sisältö |
|---|---|---|
| Palvelu | Service | Tietueen tai kirjautumisen nimi |
| URL / appi | URL / app | Yksi tai useampi URL-osoite |
| Käyttäjänimi / sähköposti | Username / email | Käyttäjänimi tai sähköpostiosoite |
| Salasana | Password | Salasana, aluksi piilotettuna |
| TOTP-avain | TOTP key | TOTP-arvo tai `otpauth://`-URI, jos lähdevienti tarjoaa sen |

Lisäkenttä- tai muistiinpanosaraketta ei näytetä taulukossa, koska se tekee näkymästä liian leveän ja kasvattaa rivejä erityisesti mobiilissa.

Salasana ja TOTP-arvo:

- ovat aluksi piilotettuina
- voidaan paljastaa Näytä / Show-painikkeella
- voidaan kopioida Kopioi / Copy-painikkeella
- eivät saa tulostua palvelimen lokiin, analytiikkaan tai virheilmoituksiin

Työpöytänäkymässä taulukko saa olla vaakasuunnassa vieritettävä, jos sisältö on leveää. Mobiilissa rivit esitetään korttimaisina tietueina, joissa sarakkeen nimi näytetään `data-label`-attribuutilla.

URL-listan rivinvaihdot eivät saa paisuttaa mobiilinäkymää kohtuuttomasti. URL-sisällön pitää olla rajattu, rivittyvä ja tarvittaessa ellipsillä katkaistava.

## CSV-vienti

CSV muodostetaan ja ladataan kokonaan selaimessa.

CSV:n näkyvät pääsarakkeet ovat:

```text
Palvelu;URL / appi;Käyttäjänimi / sähköposti;Salasana;TOTP-avain
```

CSV:ssä saa olla lisäksi yksi yleinen `Lisätiedot` / `Additional details` -sarake, joka sisältää:

- lähdeviennin lisäkentät
- muistiinpanot

Näitä lisätietoja ei saa näyttää HTML-taulukon omana sarakkeena.

CSV:n vaatimukset:

- UTF-8 BOM, jotta suomalaiset merkit toimivat hyvin taulukkolaskentaohjelmissa
- puolipiste-erotin
- lainausmerkkien escaping RFC-tyyliin
- rivinvaihdot solujen sisältä muunnetaan lyhyeksi erottimeksi, esimerkiksi ` · `
- salasanoja ei saa piilottaa CSV:ssä, koska käyttäjä pyytää nimenomaan puretun datan vientiä
- tiedosto luodaan `Blob`-objektina
- lataus tehdään `URL.createObjectURL`-osoitteen kautta
- object URL vapautetaan latauksen jälkeen `URL.revokeObjectURL`-kutsulla

Tiedostonimet:

- FI: `salapurku.csv`
- EN: `exportview.csv`

CSV:n pitää perustua kaikkiin avattuihin tietueisiin, ei vain hakukentässä näkyviin suodatettuihin riveihin.

## Yhteinen parserirakenne

Toteuta ohjelmakohtainen lukeminen seuraavalla periaatteella:

```text
valitse ohjelma
  -> lue ohjelman vientiformaatti
  -> tarvittaessa kysy salasana
  -> pura ja validoi sisältö
  -> muunna yhteiseen tietuemalliin
  -> renderöi taulukko ja CSV
```

Yhteinen normalisoitu tietuemalli:

```javascript
{
  service: string,
  url: string,
  username: string,
  password: string,
  totp: string,
  extra: string
}
```

`extra` on vain CSV:tä varten. Sitä ei renderöidä HTML-taulukon sarakkeeksi eikä käytetä mobiilikortin näkyvänä kenttänä.

Hakukentän pitää hakea ainakin näistä näkyvistä kentistä:

```text
service
url
username
password
totp
```

Lisätietoja ei pidä näyttää käyttöliittymässä vahingossa esimerkiksi `Object.values(record)` -haulla tai mobiilin `data-label`-renderöinnillä.

## Bitwarden-tuki

### Salaamaton vienti

Bitwardenin salaamaton JSON-vienti sisältää juuritason `items`-taulukon.

Tyypillisiä kenttiä:

```javascript
{
  encrypted: false,
  folders: [],
  items: [
    {
      name: string,
      folderId: string,
      notes: string,
      fields: [],
      login: {
        username: string,
        password: string,
        totp: string,
        uris: [{ uri: string }]
      }
    }
  ]
}
```

Normalisointi:

- palvelu: `item.name`, mahdollinen kansio lisätään nimeen
- URL: kaikki `login.uris[].uri`-arvot
- käyttäjänimi: `login.username`
- salasana: `login.password`
- TOTP: `login.totp`
- lisätiedot: `item.fields` ja `item.notes`

### Salattu Bitwarden JSON

Salatun Bitwarden JSON-viennin avaaminen tapahtuu selaimen Web Crypto APIlla.

Tuettu salausmuoto:

- `encrypted: true`
- `passwordProtected: true`
- PBKDF2-SHA256
- HKDF-Expand erillisillä `enc`- ja `mac`-tunnisteilla
- salatut merkkijonot muodossa `2.iv|ciphertext|mac`
- AES-CBC-256
- HMAC-SHA256

Käsittelyjärjestys:

1. Johda PBKDF2-SHA256-avaimen pohja vientitiedoston `salt`-arvosta.
2. Käytä vientitiedoston `kdfIterations`-arvoa.
3. Johda HKDF:llä 32 tavun `encKey` tunnisteella `enc`.
4. Johda 32 tavun `macKey` tunnisteella `mac`.
5. Tarkista `encKeyValidation_DO_NOT_EDIT`-kenttä HMACilla ennen varsinaisen datan avaamista.
6. Avaa `data` AES-CBC-256:lla.
7. Muunna avattu JSON yhteiseen tietuemalliin.

Jos `kdfType` viittaa Argon2id-muotoon, älä yritä käsitellä tiedostoa väärällä algoritmilla. Näytä käyttäjälle selkeä ilmoitus siitä, että kyseinen salausmuoto ei ole tässä selainversiossa tuettu.

## Proton Pass -tuki

Proton Passin virallinen vienti voi olla salaamaton tai salattu ZIP-tiedosto. Salaamattomassa ZIPissä on JSON ja salatussa ZIPissä ASCII-armoroitu PGP-sanoma. Tämä vastaa Protonin vientiohjetta: [How to export from Proton Pass](https://proton.me/support/pass-export).

### Protonin salaamaton ZIP

ZIPin sisältö:

```text
Proton Pass/data.json
```

JSON-rakenne:

```javascript
{
  userId: string,
  vaults: object | array,
  version: number
}
```

Vaultin tietueet löytyvät `vaults`-rakenteen `items`-taulukoista.

Tyypillinen tietue:

```javascript
{
  itemId: string,
  data: {
    metadata: {
      name: string,
      note: string,
      itemUuid: string
    },
    extraFields: [],
    platformSpecific: object,
    type: "login",
    content: {
      itemEmail: string,
      password: string,
      totpUri: string,
      itemUsername: string,
      autofillUrls: [{ url: string, mode: string }],
      urls: [string]
    }
  }
}
```

Normalisointi:

- palvelu: `data.metadata.name`
- URL: yhdistä `data.content.urls` ja `data.content.autofillUrls[].url`, poista duplikaatit
- käyttäjänimi: ensisijaisesti `data.content.itemUsername`, toissijaisesti `data.content.itemEmail`
- salasana: `data.content.password`
- TOTP: `data.content.totpUri`
- lisätiedot: `data.extraFields` ja `data.metadata.note`

ZIP-parserin pitää vähintään tukea:

- ZIP stored -menetelmää, compression method `0`
- mielellään myös DEFLATE-menetelmää, compression method `8`, selaimen `DecompressionStream('deflate-raw')`-rajapinnalla

ZIP-parseri ei saa purkaa tiedostoa palvelimella.

ZIPin käsittelyn perusvaiheet:

1. Etsi End of Central Directory -tietue alle 65 535 tavun loppualueelta.
2. Lue central directory.
3. Etsi nimellä `Proton Pass/data.json` tai `Proton Pass/data.pgp`.
4. Lue paikallisen tiedostotietueen perusteella pakatun datan alku ja pituus.
5. Pura method 0 suoraan.
6. Pura method 8 `DecompressionStream`-rajapinnalla.

### Protonin salattu ZIP

ZIPin sisältö:

```text
Proton Pass/data.pgp
```

`data.pgp` on ASCII-armoroitu sanoma:

```text
-----BEGIN PGP MESSAGE-----
...
-----END PGP MESSAGE-----
```

ASCII-armorissa:

- etsi BEGIN- ja END-rivit
- ohita mahdolliset armor-otsakkeet
- ohita CRC-rivi, joka alkaa merkillä `=`
- yhdistä Base64-rivit
- dekoodaa Base64 selaimessa

Tässä Protonin testiviennissä PGP-sanoma sisältää:

- Symmetric-Key Encrypted Session Key -paketin, tag 3
- Symmetrically Encrypted Integrity Protected Data -paketin, tag 18
- AES-256-salauksen
- iterated salted S2K -johdon
- SHA-256-S2K-hajautuksen
- MDC-tarkistuksen SHA-1:llä

### OpenPGP-pakettien lukeminen

Parserin pitää ymmärtää vähintään OpenPGP:n new-format packet headerit.

New-format-header:

```text
tag = header & 0x3f
```

Pituuskoodaus:

- ensimmäinen pituustavu alle 192: pituus on sama tavu
- 192–223: `((first - 192) << 8) + next + 192`
- 255: seuraavat neljä tavua ovat big-endian-pituus
- 224–254: partial body length, `1 << (first & 0x1f)`

Vanhan formaatin tag 3 kannattaa hyväksyä myös, koska paikalliset GPG-testit voivat tuottaa old-format-headerin.

### Protonin tag 3 -paketti

Tag 3:n body on tässä muodossa:

```text
offset 0: version = 4
offset 1: symmetric algorithm = 9 (AES-256)
offset 2: S2K type = 3 (iterated and salted)
offset 3: hash algorithm = 8 (SHA-256)
offset 4..11: 8 tavun salt
offset 12: S2K count-octet
offset 13..: salattu session key, yleensä 33 tavua
```

S2K-count lasketaan näin:

```javascript
const count = (16 + (countOctet & 15)) << ((countOctet >> 4) + 6);
```

Protonin testitiedostossa count-octet on `255`, jolloin laskettu määrä on 65 011 712 tavua.

S2K-avaimen johtaminen:

1. Muunna käyttäjän salasana UTF-8-tavuiksi.
2. Muodosta lähde `salt || password`.
3. Toista lähdettä laskettuun count-määrään asti.
4. Hajauta SHA-256:lla.
5. Käytä ensimmäisiä 32 tavua AES-256-avaimena.

Salatun session key -osuuden purku:

- käytä AES-256-CFB:tä
- IV on 16 nollatavua
- OpenPGP:n tässä kentässä ei ole erillistä prefixiä
- purettu sisältö on 33 tavua:
  - tavu 0: algoritmitavu `9`
  - tavut 1–32: varsinainen AES-256-istuntoavain

Älä vaadi tähän osuuteen tarkistussummaa. Protonin tag 3 -paketin session-key-kenttä on 33 tavua, ei 35 tavua.

### Protonin tag 18 -paketti

Tag 18:n body alkaa yhdellä versiolla:

```text
offset 0: version = 1
offset 1..: OpenPGP-CFB-salattu sisältö
```

OpenPGP-CFB:n AES-lohkon koko on 16 tavua.

Purkamisessa:

1. Aseta feedback-rekisteri 16 nollatavuksi.
2. Laske AES-lohkosalaus feedback-rekisterille.
3. XORaa ensimmäiset 16 salattua tavua saadaksesi prefixin.
4. Aseta feedbackiksi ensimmäiset 16 salattua tavua.
5. Tag 18:ssa ei tehdä tag 9:n erityistä resynkronointia.
6. Jatka tavallisena OpenPGP-CFB:nä niin, että toinen vaihe alkaa salatun datan offsetista 16 ja käsittelee myös kaksi prefixin tarkistustavua samassa feedback-virrassa.
7. Poista puretusta tuloksesta ensimmäiset 18 tavua:
   - 16 satunnaista prefix-tavua
   - kaksi viimeistä tarkistustavua, joiden pitää vastata prefixin kahta viimeistä tavua

Tärkeä ero:

- tag 18: ei tag 9:n erityistä resynkronointia
- vanha tag 9: voidaan käsitellä erillisellä resynkronointipolulla

MDC-tarkistus:

- viimeiset 22 tavua ovat MDC-paketin `D3 14` + 20 tavun SHA-1-hajautus
- MDC-hajautuksen syötteeseen kuuluu:
  - OpenPGP-prefix, 18 tavua
  - kaikki purettu packet-data ennen MDC:tä
  - tavut `D3 14`
- vertaile laskettua SHA-1-arvoa viimeisiin 20 tavuun
- jos tarkistus epäonnistuu, käsittele virhe salasana- tai eheysvirheenä äläkä näytä dataa

### Sisemmät PGP-paketit

MDC:n jälkeen purettu data sisältää yleensä:

- Literal Data -paketin, tag 11
- tai Compressed Data -paketin, tag 8, jonka sisällä on Literal Data -paketti

Compressed Data -paketissa:

- algoritmi `0`: ZIP/DEFLATE raw
- algoritmi `1`: ZLIB

Protonin ensimmäiset testit voidaan toteuttaa ilman pakkausta, mutta parserin pitää antaa selkeä virhe, jos pakkausalgoritmi ei ole tuettu.

Literal Data -paketin rakenne:

```text
offset 0: data format
offset 1: filename length
offset 2..: filename
filename jälkeen: 4 tavun timestamp
timestampin jälkeen: JSON-teksti
```

Dekoodaa JSON UTF-8:na ja normalisoi se Protonin yhteisen tietuemallin kautta.

## Salasanadialogi ja virheet

Kun valittu tiedosto on salattu:

1. Tallenna salattu data vain JavaScriptin hetkelliseen muistiin.
2. Avaa modal-dialogi.
3. Pyydä vientitiedoston salasanaa.
4. Älä kutsu backendia.
5. Älä tallenna salasanaa `localStorageen`, `sessionStorageen`, evästeisiin tai URL-osoitteeseen.
6. Tyhjennä salasana onnistuneen avauksen, peruutuksen ja tulosten tyhjennyksen jälkeen.

Väärän salasanan viestin pitää olla yleinen:

- FI: `Salasana ei täsmää tai tiedosto on vioittunut.`
- EN: `The password is incorrect or the file is damaged.`

Älä erottele käyttäjälle tavalla, joka vuotaa liikaa tietoa, onko salausavain väärä vai onko tiedoston eheystarkistus epäonnistunut.

Muita virheitä:

- virheellinen JSON
- tuntematon ZIP-rakenne
- puuttuva Protonin `data.json` / `data.pgp`
- tukematon ZIP-pakkausmenetelmä
- tukematon PGP-algoritmi
- tukematon Argon2id
- rikkinäinen MDC

## Tietoturvarajat

Parserin JavaScriptissä ei saa käyttää vientidatan käsittelyyn:

```text
fetch
XMLHttpRequest
sendBeacon
localStorage
sessionStorage
```

Älä lisää vientitiedoston nimeä, sisältöä, salasanaa, palvelun nimiä, käyttäjänimiä, TOTP-arvoja tai salasanoja:

- Google Tag Managerin dataLayeriin
- analytiikkatapahtumiin
- URL-osoitteeseen
- palvelinlokeihin
- virheraportointiin

Google Tag Manager saa olla sivulla sivuston muun käytännön mukaisesti, mutta työkalun salainen data ei saa päätyä sen kautta mihinkään.

Käytä selaimen Web Crypto APIa ainakin seuraaviin:

- PBKDF2
- HKDF:n HMAC-rakennus
- AES-CBC
- AES-lohkosalaus CFB:n toteuttamista varten
- SHA-1 MDC-tarkistus
- SHA-256 S2K

Koska Web Crypto API ei tarjoa suoraan AES-ECB:tä, yksi AES-lohkon salaus voidaan toteuttaa AES-CBC:llä nollatavuisella IV:llä ja käyttämällä vain ensimmäistä 16 tavua tuloksesta. Älä käytä AES-CBC:n padding-tulosta sellaisenaan CFB-virrana.

## Sivut, metatiedot ja linkitykset

Molemmille kielille tarvitaan:

- työkalusivu
- käyttöohje
- tietosuojaseloste

Sivuilla pitää olla:

- oikea canonical-osoite
- kielikohtainen title
- kuvaava meta description
- tarkoituksenmukaiset keywords
- Open Graph -metat
- Twitter-metat
- WebApplication JSON-LD työkalusivulla
- Google Tag Managerin head-skripti
- Google Tag Managerin body-noscript

FI-osoitteet:

```text
/salapurku/
/ohjeet/salapurku
/tietosuoja/salapurku
```

EN-osoitteet:

```text
/exportview/
/guides/exportview
/privacy/exportview
```

Lisää työkalun linkki:

- suomenkieliselle etusivulle
- englanninkieliselle etusivulle
- käyttöohjeiden hakemistoon
- tietosuojaselosteiden hakemistoon

Lisää kaikki kolme kielikohtaista osoitetta oikeaan sitemap.xml-tiedostoon.

## Visuaalinen hyväksymiskriteeri

Työpöydällä:

- toimintonapit eivät veny kohtuuttoman korkeiksi
- taulukossa ei ole turhaa tyhjää sisäistä aluetta
- URL-solut eivät riko koko layoutia
- salasanojen painikkeet pysyvät samalla rivillä tai järkevästi rivittyvinä
- taulukon viisi saraketta ovat luettavia

Mobiilissa:

- valikko ja tiedoston valinta ovat täysleveitä
- kortit eivät levene näkymän ulkopuolelle
- jokaisella solulla on oikea `data-label`
- lisäkentät ja muistiinpanot eivät näy omana mobiilikenttänään
- URL-lista ei paisuta korttia tarpeettomasti
- vaakavieritystä ei tarvita koko sivulle

## Hyväksymistestit

### Bitwarden

- [ ] salaamaton Bitwarden JSON avautuu
- [ ] salattu PBKDF2-SHA256 Bitwarden JSON avautuu oikealla salasanalla
- [ ] väärä Bitwarden-salasana hylätään
- [ ] Argon2id ilmoitetaan tukemattomaksi ilman väärää purkuyritystä
- [ ] kansiot normalisoituvat palvelun nimeen
- [ ] käyttäjänimi, salasana, URL ja TOTP näkyvät oikeissa sarakkeissa
- [ ] lisäkentät ja muistiinpanot eivät näy HTML-taulukossa
- [ ] lisäkentät ja muistiinpanot ovat CSV:n lisätiedoissa

### Proton Pass

- [ ] salaamaton Proton ZIP avautuu
- [ ] `Proton Pass/data.json` löytyy ZIPistä
- [ ] salattu Proton ZIP tunnistetaan
- [ ] `Proton Pass/data.pgp` löytyy ZIPistä
- [ ] oikea salasana avaa Protonin tag 3 + tag 18 -sanoman
- [ ] 33 tavun salattu session key käsitellään ilman ylimääräistä checksum-vaatimusta
- [ ] väärä salasana hylätään
- [ ] MDC-tarkistus tehdään ennen JSONin näyttämistä
- [ ] Protonin vaultit ja login-tietueet normalisoituvat yhteiseen malliin
- [ ] `urls` ja `autofillUrls[].url` yhdistyvät ilman duplikaatteja
- [ ] `itemUsername` ja `itemEmail` käsitellään oikein
- [ ] `totpUri` päätyy TOTP-sarakkeeseen

### Paikallisuus ja tietoturva

- [ ] vientitiedosto ei lähde selaimesta
- [ ] salasana ei lähde selaimesta
- [ ] parserissa ei ole `fetch`-, XHR- tai beacon-kutsuja
- [ ] parseri ei käytä localStoragea tai sessionStoragea
- [ ] CSV syntyy selaimessa Blobina
- [ ] tulosten tyhjennys tyhjentää myös selaimen muistissa olevat tietueet
- [ ] salasana tyhjennetään dialogin jälkeen
- [ ] GTM ei saa vientidataa

### Laadunvarmistus

Suorita vähintään:

```bash
node --check sivusto/js/salapurku.js
node --check sivusto-en/js/exportview.js
git diff --check
```

Validoi lisäksi sitemapit XML-parserilla ja tarkista molemmat käyttöliittymät sekä mobiili- että työpöytänäkymässä.

## Nykyisen staattisen toteutuksen tiedostot

Nykyisessä Sorolan staattisessa sivustossa vastaavat tiedostot ovat:

```text
sivusto/salapurku/index.html
sivusto/js/salapurku.js
sivusto/ohjeet/salapurku.html
sivusto/tietosuoja/salapurku.html

sivusto-en/exportview/index.html
sivusto-en/js/exportview.js
sivusto-en/guides/exportview.html
sivusto-en/privacy/exportview.html
```

Molempien kielten JavaScript-toteutusten pitää pysyä toiminnallisesti yhdenmukaisina. Jos parseri kopioidaan eri sovellukseen, käännä käyttöliittymätekstit sovelluksen omaan käännösrakenteeseen, mutta säilytä formaattien ja kryptografian toiminta täsmälleen samana.
