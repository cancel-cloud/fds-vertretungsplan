'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Phone, Mail, Building2, Scale, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ThemeToggle } from '@/components/theme-toggle';

export function ImpressumClient() {
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
                Impressum
              </h1>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Angaben gemäß § 5 TMG
              </p>
            </div>

            <div className="grid gap-6">
              {/* Anschrift */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Building2 className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Anschrift
                    </h2>
                    <div className="space-y-2">
                      <p className="text-[rgb(var(--color-text))]">
                        <strong>Lukas Dienst</strong>
                      </p>
                      <p className="text-[rgb(var(--color-text-secondary))]">
                        Am Holzweg 11<br />
                        35789 Weilmünster
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Kontakt */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Mail className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Kontakt
                    </h2>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                        <Phone className="h-4 w-4" />
                        <span>+49 0170 3044 192</span>
                      </div>
                      <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                        <Mail className="h-4 w-4" />
                        <a 
                          href="mailto:info@devbrew.dev" 
                          className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary)/0.8)] transition-colors"
                        >
                          info@devbrew.dev
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Verantwortlich für den Inhalt */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <Scale className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                    </h2>
                    <div className="space-y-2">
                      <p className="text-[rgb(var(--color-text))]">
                        <strong>Lukas Dienst</strong>
                      </p>
                      <p className="text-[rgb(var(--color-text-secondary))]">
                        Am Holzweg 11<br />
                        35789 Weilmünster
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Haftungsausschluss */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-[rgb(var(--color-primary))]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      Haftungsausschluss (Disclaimer)
                    </h2>
                    <div className="space-y-4 text-[rgb(var(--color-text-secondary))]">
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">
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