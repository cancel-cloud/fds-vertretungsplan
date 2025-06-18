'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Cookie, Server, Mail, Database, FileKey, Ban } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ThemeToggle } from '@/components/theme-toggle';

export function DatenschutzClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileMenuContent = (
    <div className="flex flex-col gap-6 p-6">
      {/* Theme toggle for mobile */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border)/0.2)]">
        <span className="text-[rgb(var(--color-text-secondary))]">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <Header onMenuToggle={handleMobileMenuToggle} />
      
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      >
        {mobileMenuContent}
      </MobileMenu>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 p-6 border-r border-[rgb(var(--color-border)/0.2)] min-h-[calc(100vh-64px)]">
          <div className="sticky top-6 space-y-6">
            {/* Invisible placeholder to maintain layout spacing */}
            <div className="h-80"></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">
                Datenschutzerklärung
              </h1>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Informationen zum Datenschutz und zur Verarbeitung Ihrer Daten
              </p>
            </div>

            <div className="grid gap-6">
              {/* Allgemeiner Datenschutz */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <ShieldCheck className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Allgemeiner Datenschutz
                    </h2>
                    <div className="space-y-4 text-[rgb(var(--color-text-secondary))]">
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
                  </div>
                </div>
              </Card>

              {/* Cookies */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Cookie className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Cookies
                    </h2>
                    <div className="space-y-4 text-[rgb(var(--color-text-secondary))]">
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
                  </div>
                </div>
              </Card>

              {/* Server-Log-Files */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Server className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Server-Log-Files
                    </h2>
                    <div className="space-y-4 text-[rgb(var(--color-text-secondary))]">
                      <p>
                        Der Provider der Seiten erhebt und speichert automatisch Informationen
                        in so genannten Server-Log Files, die Ihr Browser automatisch an uns
                        übermittelt. Dies sind:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
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
                  </div>
                </div>
              </Card>

              {/* Mail */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Mail className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Mail
                    </h2>
                    <div className="text-[rgb(var(--color-text-secondary))]">
                      <p>
                        Wenn Sie uns per Mail Anfragen zukommen lassen, werden Ihre Angaben aus
                        der Mail inklusive der von Ihnen dort angegebenen Daten zwecks
                        Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns
                        gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* API-Daten der Schule */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Database className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      API-Daten der Schule
                    </h2>
                    <div className="text-[rgb(var(--color-text-secondary))]">
                      <p>
                        Die angezeigten Daten auf dieser Webseite werden durch die API der
                        Schule bereitgestellt. Die Daten werden entsprechend den
                        Datenschutzbestimmungen der Schule verarbeitet. Bei Fragen zu diesen
                        Daten wenden Sie sich bitte direkt an die Schule.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recht auf Auskunft, Löschung, Sperrung */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <FileKey className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Recht auf Auskunft, Löschung, Sperrung
                    </h2>
                    <div className="text-[rgb(var(--color-text-secondary))]">
                      <p>
                        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre
                        gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und
                        den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung,
                        Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum
                        Thema personenbezogene Daten können Sie sich jederzeit unter der im
                        Impressum angegebenen Adresse an uns wenden.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Widerspruch Werbe-Mails */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Ban className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Widerspruch Werbe-Mails
                    </h2>
                    <div className="text-[rgb(var(--color-text-secondary))]">
                      <p>
                        Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten
                        Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter
                        Werbung und Informationsmaterialien wird hiermit widersprochen. Die
                        Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im
                        Falle der unverlangten Zusendung von Werbeinformationen, etwa durch
                        Spam-E-Mails, vor.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 