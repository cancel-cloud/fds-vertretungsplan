'use client';

import { useEffect, useState } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

const canvasStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 999
} as const;

export default function WelcomeOverlay() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      localStorage.setItem('hasVisitedBefore', 'true');
      setIsFirstVisit(true);
    }
    setIsLoading(false);
  }, []);

  const onInit = ({ confetti }: { confetti: any }) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleClose = () => {
    setIsFirstVisit(false);
  };

  if (isLoading || !isFirstVisit) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/50 z-50 flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-xl max-w-md relative">
          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-4 text-accent">Willkommen! 🎉</h2>
          <p className="text-muted-foreground mb-4">
            Schön, dass du meinen Vertretungsplan der Dessauer Schule Limburg nutzt!<br />
            Dieses Portal hilft dir immer über aktuelle Vertretungen und Raumänderungen informiert zu bleiben.
          </p>
          <button
            onClick={handleClose}
            className="bg-accent text-accent-foreground px-4 py-2 rounded hover:bg-accent/90 transition-colors"
          >
            Los geht's!
          </button>
        </div>
      </div>
      <ReactCanvasConfetti onInit={onInit} style={canvasStyles} />
    </>
  );
} 