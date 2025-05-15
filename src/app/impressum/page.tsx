export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>
        
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
            <p>Ferdinand-Dirichs-Schule</p>
            <p>Zeppelinstraße 4</p>
            <p>65549 Limburg an der Lahn</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
            <p>Telefon: +49 (0) 6431 91830</p>
            <p>E-Mail: poststelle@fds.limburg.schulverwaltung.hessen.de</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Verantwortlich für den Inhalt</h2>
            <p>Die Schulleitung der Ferdinand-Dirichs-Schule</p>
          </div>
        </section>
      </div>
    </div>
  );
} 