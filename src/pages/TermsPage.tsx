import { LegalDocument } from '../components/legal/LegalDocument';

export const TermsPage = () => (
  <LegalDocument
    title="Nutzungsbedingungen"
    updated="2. September 2026"
    sections={[
      {
        heading: '1. Über Linguo',
        body: 'Linguo ist eine kostenlose, quelloffene Lernanwendung zum Üben der deutschen Sprache. Die App wird "wie besehen" (as-is) zur Verfügung gestellt, ohne Gewähr für Verfügbarkeit, Fehlerfreiheit oder Vollständigkeit der Inhalte.',
      },
      {
        heading: '2. Nutzung',
        body: 'Die Nutzung von Linguo ist kostenlos und erfordert keine Registrierung. Ein Google-Konto ist nur erforderlich, wenn du die optionale Synchronisierung des Lernfortschritts über mehrere Geräte hinweg nutzen möchtest. Du bist dafür verantwortlich, die App nicht missbräuchlich zu verwenden.',
      },
      {
        heading: '3. Lerninhalte',
        body: 'Die Übungs- und Vokabelinhalte in Linguo sind eigenständig erstellte Originalinhalte. Sie orientieren sich thematisch an Grammatik- und Wortschatzthemen gängiger Deutschlehrwerke, enthalten jedoch keine wörtlich übernommenen Texte aus urheberrechtlich geschützten Werken. Für die didaktische Richtigkeit wird keine Garantie übernommen — die Inhalte dienen der Übung, nicht als offizielles Prüfungsmaterial.',
      },
      {
        heading: '4. Haftungsausschluss',
        body: 'Linguo wird ohne jegliche ausdrückliche oder stillschweigende Gewährleistung bereitgestellt. Die Nutzung erfolgt auf eigenes Risiko. Es wird keine Haftung für Schäden übernommen, die aus der Nutzung oder Nichtverfügbarkeit der App entstehen, soweit gesetzlich zulässig.',
      },
      {
        heading: '5. Geistiges Eigentum',
        body: 'Der Quellcode von Linguo ist auf GitHub verfügbar: github.com/michael2036/linguo. Es gelten die dort angegebenen Lizenzbedingungen.',
      },
      {
        heading: '6. Änderungen des Dienstes',
        body: 'Funktionen, Inhalte und Verfügbarkeit von Linguo können jederzeit ohne Vorankündigung geändert, erweitert oder eingestellt werden.',
      },
      {
        heading: '7. Änderungen dieser Bedingungen',
        body: 'Diese Nutzungsbedingungen können gelegentlich aktualisiert werden. Die jeweils aktuelle Version ist immer unter dieser Seite abrufbar.',
      },
      {
        heading: '8. Kontakt',
        body: 'Fragen zu diesen Nutzungsbedingungen können über das GitHub-Repository gestellt werden: github.com/michael2036/linguo',
      },
    ]}
  />
);
