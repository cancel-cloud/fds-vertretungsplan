import React from "react";
import Header from "@/components/Header";

const Impressum: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Impressum</h1>
      <p className="mb-4">
        <strong>Angaben gemäß § 5 TMG:</strong>
      </p>
      <p className="mb-4">
        Lukas Dienst
        <br />
        Am Holzweg 11
        <br />
        35789 Weilmünster
      </p>

      <p className="mb-4">
        <strong>Kontakt:</strong>
      </p>
      <p className="mb-4">
        Telefon: +49 0170 3044 192
        <br />
        E-Mail:{" "}
        <a href="mailto:0rare-reputed@icloud.com" className="underline">
          0rare-reputed@icloud.com
        </a>
      </p>

      <p className="mb-4">
        <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong>
      </p>
      <p className="mb-4">
        Lukas Dienst
        <br />
        Am Holzweg 11
        <br />
        35789 Weilmünster
      </p>

      <h2 className="mb-4 mt-6 text-xl font-bold">
        Haftungsausschluss (Disclaimer):
      </h2>

      <h3 className="mb-2 text-lg font-semibold">Haftung für Inhalte</h3>
      <p className="mb-4">
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
        bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen.
      </p>
      <p className="mb-4">
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
        Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
        Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von
        entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
        entfernen.
      </p>
    </div>
  );
};

export default Impressum;
