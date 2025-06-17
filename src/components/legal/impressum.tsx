'use client';

import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail, Globe, Building2 } from 'lucide-react';

export function Impressum() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">
          Impressum
        </h1>
        <p className="text-[rgb(var(--color-text-secondary))]">
          Angaben gemäß § 5 TMG
        </p>
      </div>

      <div className="grid gap-6">
        {/* Schulträger */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <Building2 className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Schulträger
              </h2>
              <div className="space-y-2">
                <p className="text-[rgb(var(--color-text))]">
                  <strong>Landkreis Limburg-Weilburg</strong>
                </p>
                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                  <MapPin className="h-4 w-4" />
                  <span>Schiede 43, 65549 Limburg an der Lahn</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Schule */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <Building2 className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Schule
              </h2>
              <div className="space-y-2">
                <p className="text-[rgb(var(--color-text))]">
                  <strong>Friedrich-Dessauer-Schule Limburg</strong>
                </p>
                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                  <MapPin className="h-4 w-4" />
                  <span>Frankfurter Straße 86, 65549 Limburg an der Lahn</span>
                </div>
                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                  <Phone className="h-4 w-4" />
                  <span>06431 9479-0</span>
                </div>
                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                  <Mail className="h-4 w-4" />
                  <span>info@fds-limburg.de</span>
                </div>
                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                  <Globe className="h-4 w-4" />
                  <span>www.fds-limburg.de</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Schulleitung */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Vertretungsberechtigte Person
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Die Schule wird vertreten durch die Schulleitung der Friedrich-Dessauer-Schule Limburg.
            </p>
          </div>
        </Card>

        {/* Aufsichtsbehörde */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Aufsichtsbehörde
            </h2>
            <div className="space-y-2">
              <p className="text-[rgb(var(--color-text))]">
                <strong>Staatliches Schulamt für den Landkreis Limburg-Weilburg</strong>
              </p>
              <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                <MapPin className="h-4 w-4" />
                <span>Schiede 43, 65549 Limburg an der Lahn</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Verantwortlich für den Inhalt */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Verantwortlich für den Inhalt
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV ist die Schulleitung der 
              Friedrich-Dessauer-Schule Limburg.
            </p>
          </div>
        </Card>

        {/* Haftungsausschluss */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Haftungsausschluss
            </h2>
            <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
              <div>
                <h3 className="font-medium text-[rgb(var(--color-text))] mb-1">Haftung für Inhalte</h3>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                  nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                  Diensteanbieter jedoch nicht unter allen Umständen verpflichtet, übermittelte oder 
                  gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, 
                  die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-[rgb(var(--color-text))] mb-1">Haftung für Links</h3>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
                  Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                  Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber 
                  der Seiten verantwortlich.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 