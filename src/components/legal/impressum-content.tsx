import { AlertTriangle, Building2, Mail, Phone, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ImpressumContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Impressum</h1>
        <p className="text-muted-foreground">Angaben gemäß § 5 TMG</p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Anschrift</h2>
              <p className="text-foreground">
                <strong>Lukas Dienst</strong>
              </p>
              <p className="text-muted-foreground">Am Holzweg 11, 35789 Weilmünster</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Kontakt</h2>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" aria-hidden="true" />
                +49 0170 3044 192
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <a href="mailto:info@devbrew.dev" className="text-primary hover:underline">
                  info@devbrew.dev
                </a>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Scale className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Verantwortlich für den Inhalt</h2>
              <p className="text-muted-foreground">Lukas Dienst, Am Holzweg 11, 35789 Weilmünster</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <AlertTriangle className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Haftungsausschluss</h2>
              <p className="text-muted-foreground">
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte verantwortlich.
                Nach §§ 8 bis 10 TMG besteht jedoch keine Verpflichtung zur Überwachung übermittelter
                fremder Informationen.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
