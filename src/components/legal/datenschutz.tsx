'use client';

import { Card } from '@/components/ui/card';
import { Shield, Eye, Database, UserCheck, Clock, AlertTriangle } from 'lucide-react';

export function Datenschutz() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">
          Datenschutzerklärung
        </h1>
        <p className="text-[rgb(var(--color-text-secondary))]">
          Informationen zum Umgang mit Ihren personenbezogenen Daten
        </p>
      </div>

      <div className="grid gap-6">
        {/* Verantwortlicher */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <UserCheck className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Verantwortlicher
              </h2>
              <div className="space-y-2 text-[rgb(var(--color-text-secondary))]">
                <p>
                  <strong className="text-[rgb(var(--color-text))]">Friedrich-Dessauer-Schule Limburg</strong><br />
                  Frankfurter Straße 86<br />
                  65549 Limburg an der Lahn<br />
                  Telefon: 06431 9479-0<br />
                  E-Mail: info@fds-limburg.de
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Erhebung und Verarbeitung */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <Database className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Erhebung und Verarbeitung von Daten
              </h2>
              <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
                <p>
                  Diese Anwendung dient der Anzeige von Vertretungsplänen der Friedrich-Dessauer-Schule. 
                  Dabei werden folgende Daten verarbeitet:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Technische Daten (IP-Adresse, Browser-Typ, Betriebssystem)</li>
                  <li>Nutzungsdaten (aufgerufene Seiten, Verweildauer)</li>
                  <li>Theme-Präferenzen (lokal gespeichert)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Rechtsgrundlage */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <Shield className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Rechtsgrundlage
              </h2>
              <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
                <p>
                  Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO 
                  (berechtigtes Interesse). Unser berechtigtes Interesse liegt in der 
                  Bereitstellung aktueller Vertretungsplaninformationen für Schüler, 
                  Lehrer und Eltern.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cookies und lokale Speicherung */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <Eye className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Cookies und lokale Speicherung
              </h2>
              <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
                <p>
                  Diese Anwendung verwendet lokale Speicherung (SessionStorage) um Ihre 
                  Theme-Präferenzen zu speichern. Diese Daten werden nicht an Dritte 
                  weitergegeben und dienen ausschließlich der Verbesserung Ihrer Nutzererfahrung.
                </p>
                <p>
                  Es werden keine Tracking-Cookies oder externe Analysedienste verwendet.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Speicherdauer */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <Clock className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Speicherdauer
              </h2>
              <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
                <p>
                  Personenbezogene Daten werden nur so lange gespeichert, wie es für den 
                  jeweiligen Zweck erforderlich ist:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Server-Logs: 7 Tage</li>
                  <li>Theme-Präferenzen: bis zur Löschung durch den Nutzer</li>
                  <li>Cache-Daten: automatische Löschung nach Sitzungsende</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Ihre Rechte */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Ihre Rechte
            </h2>
            <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
              <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Kontakt */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <AlertTriangle className="h-6 w-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                Kontakt bei Datenschutzfragen
              </h2>
              <div className="space-y-2 text-[rgb(var(--color-text-secondary))]">
                <p>
                  Bei Fragen zum Datenschutz wenden Sie sich bitte an:
                </p>
                <p>
                  <strong className="text-[rgb(var(--color-text))]">Friedrich-Dessauer-Schule Limburg</strong><br />
                  E-Mail: info@fds-limburg.de<br />
                  Telefon: 06431 9479-0
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Beschwerderecht */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
              Beschwerderecht
            </h2>
            <div className="space-y-2 text-[rgb(var(--color-text-secondary))]">
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über unsere 
                Verarbeitung personenbezogener Daten zu beschweren.
              </p>
              <p>
                <strong className="text-[rgb(var(--color-text))]">Zuständige Aufsichtsbehörde:</strong><br />
                Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
                Postfach 3163<br />
                65021 Wiesbaden
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 