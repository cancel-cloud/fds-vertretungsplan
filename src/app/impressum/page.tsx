"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Phone, Mail, Scale, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface ImpressumSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function ImpressumSection({ icon, title, children }: ImpressumSectionProps) {
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

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Impressum"
        description="Angaben gemäß § 5 TMG"
        size="sm"
      />

      <main className="max-w-[850px] mx-auto p-4 md:p-8 space-y-6">
        <ImpressumSection
          icon={<Building2 className="h-6 w-6" />}
          title="Anschrift"
        >
          <div className="space-y-1">
            <p className="font-medium text-foreground">Lukas Dienst</p>
            <p>Am Holzweg 11</p>
            <p>35789 Weilmünster</p>
          </div>
        </ImpressumSection>

        <ImpressumSection
          icon={<Mail className="h-6 w-6" />}
          title="Kontakt"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+49 0170 3044 192</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:0rare-reputed@icloud.com" 
                className="text-primary hover:underline hover:text-primary/90 transition-colors"
              >
                0rare-reputed@icloud.com
              </a>
            </div>
          </div>
        </ImpressumSection>

        <ImpressumSection
          icon={<Scale className="h-6 w-6" />}
          title="Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV"
        >
          <div className="space-y-1">
            <p className="font-medium text-foreground">Lukas Dienst</p>
            <p>Am Holzweg 11</p>
            <p>35789 Weilmünster</p>
          </div>
        </ImpressumSection>

        <ImpressumSection
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Haftungsausschluss (Disclaimer)"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Haftung für Inhalte
              </h3>
              <div className="space-y-4">
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf
                  diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
                  bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
                  übermittelte oder gespeicherte fremde Informationen zu überwachen oder
                  nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                  hinweisen.
                </p>
                <p>
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                  Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
                  Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
                  Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von
                  entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
                  entfernen.
                </p>
              </div>
            </div>
          </div>
        </ImpressumSection>
      </main>
    </div>
  );
} 