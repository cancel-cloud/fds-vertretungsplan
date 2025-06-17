'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Calendar, Search, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if welcome has been shown before
    const hasSeenWelcome = sessionStorage.getItem('fds-welcome-seen');
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    // Trigger confetti when overlay becomes visible
    if (isVisible) {
      // Small delay to let the overlay render first
      const timer = setTimeout(() => {
        triggerWelcomeConfetti();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const triggerWelcomeConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    // Initial burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Continuous confetti from both sides
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#218095', '#5E5240', '#C0152F', '#1FB8CD']
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#218095', '#5E5240', '#C0152F', '#1FB8CD']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Start the continuous animation after a short delay
    setTimeout(() => {
      requestAnimationFrame(frame);
    }, 500);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('fds-welcome-seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <>


      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="relative text-center">
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-[rgb(var(--color-surface))] hover:bg-[rgb(var(--color-border))] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-[rgb(var(--color-primary)/0.1)] rounded-full">
                  <Sparkles className="h-8 w-8 text-[rgb(var(--color-primary))]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">
                Willkommen!
              </h2>
              <p className="text-[rgb(var(--color-text-secondary))] mt-2">
                Entdecken Sie den neuen Vertretungsplan der Friedrich-Dessauer-Schule
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text))]">Kalender-Navigation</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Wählen Sie einfach ein Datum im Kalender aus
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg flex-shrink-0">
                  <Search className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text))]">Intelligente Suche</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Suchen Sie nach Klassen, Lehrern oder Fächern
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg flex-shrink-0">
                  <Filter className="h-4 w-4 text-[rgb(var(--color-primary))]" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text))]">Kategorien-Filter</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Filtern Sie nach Vertretungsart (Entfall, Verlegung, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleDismiss}
                className="w-full"
              >
                Los geht's!
              </Button>
              <p className="text-xs text-center text-[rgb(var(--color-text-secondary))]">
                Diese Nachricht wird nur einmal pro Sitzung angezeigt
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
} 