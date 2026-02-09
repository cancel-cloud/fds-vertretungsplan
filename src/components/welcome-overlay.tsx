'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Calendar, Filter, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { captureClientEvent } from '@/lib/analytics/posthog-client';

interface WelcomeOverlayProps {
  enabled?: boolean;
}

const STORAGE_KEY = 'fds-welcome-seen';

export function WelcomeOverlay({ enabled = true }: WelcomeOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const burstTimeoutRef = useRef<number | null>(null);
  const loopStartTimeoutRef = useRef<number | null>(null);
  const overlayShownRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!isOpen || !enabled) {
      return;
    }

    if (!overlayShownRef.current) {
      overlayShownRef.current = true;
      captureClientEvent(ANALYTICS_EVENTS.WELCOME_SHOWN, { source: 'first_visit' });
    }

    burstTimeoutRef.current = window.setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const end = Date.now() + 3000;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#218095', '#5E5240', '#C0152F', '#1FB8CD'],
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#218095', '#5E5240', '#C0152F', '#1FB8CD'],
        });

        if (Date.now() < end) {
          animationFrameRef.current = requestAnimationFrame(frame);
        }
      };

      loopStartTimeoutRef.current = window.setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(frame);
      }, 350);
    }, 250);

    return () => {
      if (burstTimeoutRef.current) {
        window.clearTimeout(burstTimeoutRef.current);
      }
      if (loopStartTimeoutRef.current) {
        window.clearTimeout(loopStartTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isOpen]);

  const dismiss = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    captureClientEvent(ANALYTICS_EVENTS.WELCOME_DISMISSED, { source: 'button' });
  };

  if (!enabled) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          dismiss();
        }
      }}
    >
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Willkommen</DialogTitle>
          <DialogDescription>Kurzer Überblick über die wichtigsten Funktionen.</DialogDescription>
        </DialogHeader>

        <Card className="border-none p-0 shadow-none">
          <div className="space-y-6 p-6">
            <div className="relative text-center">
              <button
                type="button"
                onClick={dismiss}
                className="absolute -right-2 -top-2 rounded-full bg-[rgb(var(--color-surface))] p-1 transition-colors hover:bg-[rgb(var(--color-border))]"
                aria-label="Willkommenshinweis schließen"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-[rgb(var(--color-primary)/0.1)] p-3">
                  <Sparkles className="h-8 w-8 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--color-text))]">Willkommen!</h2>
              <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
                Entdecken Sie den neuen Vertretungsplan der Friedrich-Dessauer-Schule.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[rgb(var(--color-primary)/0.1)] p-2">
                  <Calendar className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text))]">Kalender-Navigation</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">Wählen Sie ein Datum direkt im Kalender.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[rgb(var(--color-primary)/0.1)] p-2">
                  <Search className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text))]">Intelligente Suche</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">Suchen Sie nach Klassen, Lehrern oder Fächern.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[rgb(var(--color-primary)/0.1)] p-2">
                  <Filter className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium text-[rgb(var(--color-text))]">Kategorien-Filter</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">Filtern Sie nach Vertretungsart.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={dismiss} className="w-full">
                Los geht&apos;s!
              </Button>
              <p className="text-center text-xs text-[rgb(var(--color-text-secondary))]">Diese Nachricht wird nur einmal angezeigt</p>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
