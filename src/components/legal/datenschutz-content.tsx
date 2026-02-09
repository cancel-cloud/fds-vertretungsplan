import { Ban, Cookie, Database, FileKey, Mail, Server, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function DatenschutzContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Datenschutzerklärung</h1>
        <p className="text-muted-foreground">
          Informationen zum Datenschutz und zur Verarbeitung Ihrer Daten.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Allgemeiner Datenschutz</h2>
              <p className="text-muted-foreground">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst
                und behandeln personenbezogene Daten vertraulich und entsprechend der gesetzlichen
                Vorschriften.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Cookie className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
              <p className="text-muted-foreground">
                Cookies dienen dazu, das Angebot nutzerfreundlicher und sicherer zu machen. Die
                meisten eingesetzten Cookies sind Session-Cookies und werden nach Ende Ihres
                Besuchs gelöscht.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Server className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Server-Log-Files</h2>
              <p className="text-muted-foreground">
                Der Provider erhebt automatisch Browsertyp, Betriebssystem, Referrer und Uhrzeit
                der Anfrage. Diese Daten sind nicht bestimmten Personen zuordenbar.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Kontakt per Mail</h2>
              <p className="text-muted-foreground">
                Wenn Sie uns per Mail kontaktieren, speichern wir Ihre Angaben zur Bearbeitung der
                Anfrage und für Anschlussfragen.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Database className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">API-Daten der Schule</h2>
              <p className="text-muted-foreground">
                Die angezeigten Daten werden durch die API der Schule bereitgestellt und gemäß den
                Datenschutzbestimmungen der Schule verarbeitet.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileKey className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Ihre Rechte</h2>
              <p className="text-muted-foreground">
                Sie haben das Recht auf Auskunft, Berichtigung, Sperrung oder Löschung Ihrer
                gespeicherten personenbezogenen Daten.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Ban className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Widerspruch Werbe-Mails</h2>
              <p className="text-muted-foreground">
                Der Nutzung veröffentlichter Kontaktdaten zur Übersendung unverlangter Werbung wird
                ausdrücklich widersprochen.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
