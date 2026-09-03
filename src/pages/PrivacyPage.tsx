import { LegalDocument } from '../components/legal/LegalDocument';

export const PrivacyPage = () => (
  <LegalDocument
    title="Datenschutzerklärung"
    updated="2. September 2026"
    sections={[
      {
        heading: '1. Überblick',
        body: 'Linguo ist eine statische Web-App ohne eigenes Backend. Es gibt keinen Server, der deine Daten verarbeitet oder speichert — alle Lerndaten bleiben standardmäßig ausschließlich auf deinem Gerät.',
      },
      {
        heading: '2. Welche Daten werden gespeichert?',
        body: 'Im Gastmodus (Standard) werden dein Lernfortschritt (Vokabeln, Lektionen, Übungs- und Testergebnisse) und deine Einstellungen (Design, Muttersprache) ausschließlich lokal im localStorage deines Browsers gespeichert. Diese Daten verlassen dein Gerät nicht und werden an niemanden übertragen — auch nicht an die Betreiber dieser App. Wenn du dich freiwillig mit deinem Google-Konto verbindest, wird dein Lernfortschritt zusätzlich in einer einzigen Datei (app_state.json) im privaten, versteckten App-Datenordner (appDataFolder) deines eigenen Google-Drive-Kontos gespeichert. Dieser Ordner ist für dich und für andere Apps oder Personen nicht sichtbar und ausschließlich über diese App zugänglich. Linguo fordert dabei nur den eingeschränkten Google-Berechtigungsbereich drive.appdata an — niemals Zugriff auf deine sonstigen Drive-Dateien, E-Mails, Kontakte oder andere Google-Dienste. Zugriffstoken werden ausschließlich im Arbeitsspeicher deines Browsers gehalten und nicht dauerhaft gespeichert.',
      },
      {
        heading: '3. Werden Daten an Dritte weitergegeben?',
        body: 'Nein. Linguo enthält keine Analyse-, Tracking- oder Werbedienste und keine Drittanbieter-Server. Die einzige externe Verbindung entsteht ausschließlich dann, wenn du selbst die optionale Google-Synchronisierung aktivierst — und dabei ausschließlich mit den Servern von Google, gemäß deren eigener Datenschutzerklärung.',
      },
      {
        heading: '4. Cookies',
        body: 'Linguo verwendet keine Cookies. Für die Offline-Funktionalität kommt ein Service Worker (Cache Storage) zum Einsatz, der ausschließlich App-Dateien (HTML, CSS, JavaScript, Lerninhalte) lokal zwischenspeichert.',
      },
      {
        heading: '5. Kontrolle über deine Daten',
        body: 'Du kannst deinen gesamten Lernfortschritt jederzeit über Einstellungen → „Fortschritt zurücksetzen" löschen. Du kannst die Google-Verbindung jederzeit über Einstellungen → „Google-Konto trennen" beenden; deine lokal gespeicherten Daten bleiben davon unberührt. Da alle Daten lokal bzw. in deinem eigenen Google-Drive-Konto liegen, hast du jederzeit die volle Kontrolle darüber.',
      },
      {
        heading: '6. Kinder',
        body: 'Linguo richtet sich nicht gezielt an Kinder unter 13 Jahren und sammelt wissentlich keine Daten von ihnen.',
      },
      {
        heading: '7. Änderungen dieser Erklärung',
        body: 'Diese Datenschutzerklärung kann gelegentlich aktualisiert werden, wenn sich die App weiterentwickelt. Die jeweils aktuelle Version ist immer unter dieser Seite abrufbar.',
      },
      {
        heading: '8. Kontakt',
        body: 'Fragen zu dieser Datenschutzerklärung können über das GitHub-Repository von Linguo gestellt werden: github.com/michael2036/linguo',
      },
    ]}
  />
);
