import React from "react";

const Datenschutz: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Datenschutzerklärung</h1>

      <p className="mb-4">
        <strong>Datenschutz</strong>
      </p>
      <p className="mb-4">
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten
        sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und
        entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
        Datenschutzerklärung.
      </p>
      <p className="mb-4">
        Die Nutzung unserer Webseite ist ohne Angabe personenbezogener Daten
        möglich.
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">Cookies</h2>
      <p className="mb-4">
        Die Internetseiten verwenden teilweise so genannte Cookies. Cookies
        richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren.
        Cookies dienen dazu, unser Angebot nutzerfreundlicher zu machen,
        effektiver und sicherer zu machen. Cookies sind kleine Textdateien, die
        auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert.
      </p>
      <p className="mb-4">
        Die meisten der von uns verwendeten Cookies sind so genannte
        „Session-Cookies“. Sie werden nach Ende Ihres Besuchs automatisch
        gelöscht.
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">Server-Log-Files</h2>
      <p className="mb-4">
        Der Provider der Seiten erhebt und speichert automatisch Informationen
        in so genannten Server-Log Files, die Ihr Browser automatisch an uns
        übermittelt. Dies sind:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>Browsertyp und Browserversion</li>
        <li>verwendetes Betriebssystem</li>
        <li>Referrer URL</li>
        <li>Hostname des zugreifenden Rechners</li>
        <li>Uhrzeit der Serveranfrage</li>
      </ul>
      <p className="mb-4">
        Diese Daten sind nicht bestimmten Personen zuordenbar. Eine
        Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
        vorgenommen. Wir behalten uns vor, diese Daten nachträglich zu prüfen,
        wenn uns konkrete Anhaltspunkte für eine rechtswidrige Nutzung bekannt
        werden.
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">Mail</h2>
      <p className="mb-4">
        Wenn Sie uns per Mail Anfragen zukommen lassen, werden Ihre Angaben aus
        der Mail inklusive der von Ihnen dort angegebenen Daten zwecks
        Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns
        gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">API-Daten der Schule</h2>
      <p className="mb-4">
        Die angezeigten Daten auf dieser Webseite werden durch die API der
        Schule bereitgestellt. Die Daten werden entsprechend den
        Datenschutzbestimmungen der Schule verarbeitet. Bei Fragen zu diesen
        Daten wenden Sie sich bitte direkt an die Schule.
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">
        Recht auf Auskunft, Löschung, Sperrung
      </h2>
      <p className="mb-4">
        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre
        gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und
        den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung,
        Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum
        Thema personenbezogene Daten können Sie sich jederzeit unter der im
        Impressum angegebenen Adresse an uns wenden.
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">Widerspruch Werbe-Mails</h2>
      <p className="mb-4">
        Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten
        Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter
        Werbung und Informationsmaterialien wird hiermit widersprochen. Die
        Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im
        Falle der unverlangten Zusendung von Werbeinformationen, etwa durch
        Spam-E-Mails, vor.
      </p>
    </div>
  );
};

export default Datenschutz;
