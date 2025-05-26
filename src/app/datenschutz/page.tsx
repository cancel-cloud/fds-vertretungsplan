"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Cookie, Server, Mail, Database, FileKey, Ban } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface PrivacySectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function PrivacySection({ icon, title, children }: PrivacySectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Datenschutzerklärung"
        description="Informationen zum Datenschutz und zur Verarbeitung Ihrer Daten"
        size="sm"
      />

      <main className="max-w-[850px] mx-auto p-4 md:p-8 space-y-6">
        <PrivacySection
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Allgemeiner Datenschutz"
        >
          <div className="space-y-4">
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten
              sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und
              entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
              Datenschutzerklärung.
            </p>
            <p>
              Die Nutzung unserer Webseite ist ohne Angabe personenbezogener Daten
              möglich.
            </p>
          </div>
        </PrivacySection>

        <PrivacySection
          icon={<Cookie className="h-6 w-6" />}
          title="Cookies"
        >
          <div className="space-y-4">
            <p>
              Die Internetseiten verwendet teilweise so genannte Cookies. Cookies
              richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren.
              Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver und
              sicherer zu machen. Cookies sind kleine Textdateien, die auf Ihrem
              Rechner abgelegt werden und die Ihr Browser speichert.
            </p>
            <p>
              Die meisten der von uns verwendeten Cookies sind so genannte
              &quot;Session-Cookies&quot;. Sie werden nach Ende Ihres Besuchs automatisch
              gelöscht.
            </p>
          </div>
        </PrivacySection>

        <PrivacySection
          icon={<Server className="h-6 w-6" />}
          title="Server-Log-Files"
        >
          <div className="space-y-4">
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen
              in so genannten Server-Log Files, die Ihr Browser automatisch an uns
              übermittelt. Dies sind:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p>
              Diese Daten sind nicht bestimmten Personen zuordenbar. Eine
              Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
              vorgenommen. Wir behalten uns vor, diese Daten nachträglich zu prüfen,
              wenn uns konkrete Anhaltspunkte für eine rechtswidrige Nutzung bekannt
              werden.
            </p>
          </div>
        </PrivacySection>

        <PrivacySection
          icon={<Mail className="h-6 w-6" />}
          title="Mail"
        >
          <p>
            Wenn Sie uns per Mail Anfragen zukommen lassen, werden Ihre Angaben aus
            der Mail inklusive der von Ihnen dort angegebenen Daten zwecks
            Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns
            gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
          </p>
        </PrivacySection>

        <PrivacySection
          icon={<Database className="h-6 w-6" />}
          title="API-Daten der Schule"
        >
          <p>
            Die angezeigten Daten auf dieser Webseite werden durch die API der
            Schule bereitgestellt. Die Daten werden entsprechend den
            Datenschutzbestimmungen der Schule verarbeitet. Bei Fragen zu diesen
            Daten wenden Sie sich bitte direkt an die Schule.
          </p>
        </PrivacySection>

        <PrivacySection
          icon={<FileKey className="h-6 w-6" />}
          title="Recht auf Auskunft, Löschung, Sperrung"
        >
          <p>
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre
            gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und
            den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung,
            Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum
            Thema personenbezogene Daten können Sie sich jederzeit unter der im
            Impressum angegebenen Adresse an uns wenden.
          </p>
        </PrivacySection>

        <PrivacySection
          icon={<Ban className="h-6 w-6" />}
          title="Widerspruch Werbe-Mails"
        >
          <p>
            Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten
            Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter
            Werbung und Informationsmaterialien wird hiermit widersprochen. Die
            Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im
            Falle der unverlangten Zusendung von Werbeinformationen, etwa durch
            Spam-E-Mails, vor.
          </p>
        </PrivacySection>
      </main>
    </div>
  );
} 