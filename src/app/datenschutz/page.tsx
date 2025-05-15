export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Datenschutz auf einen Blick</h2>
            <p className="mb-4">
              Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zwecke der Verarbeitung von personenbezogenen Daten im Rahmen des Vertretungsplans der Ferdinand-Dirichs-Schule auf.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Datenerfassung</h2>
            <p className="mb-4">
              Der Vertretungsplan zeigt ausschließlich schulbezogene Informationen an. Es werden keine personenbezogenen Daten der Nutzer gespeichert oder verarbeitet.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Cookies und lokale Speicherung</h2>
            <p className="mb-4">
              Diese Anwendung verwendet keine Cookies. Einige Einstellungen werden im lokalen Speicher Ihres Browsers gespeichert, um die Benutzerfreundlichkeit zu verbessern.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Kontakt</h2>
            <p>Bei Fragen zum Datenschutz können Sie sich an die Schulleitung wenden:</p>
            <p>E-Mail: poststelle@fds.limburg.schulverwaltung.hessen.de</p>
          </div>
        </section>
      </div>
    </div>
  );
} 