'use client';

import { Button } from "@/components/ui/button";
import WelcomeOverlay from "./welcomeOverlay";

export default function TestingPage() {
    return (
      <div>
        <h1>Testing Page</h1>
        <WelcomeOverlay />
        <div className="mt-4 flex flex-col items-center gap-4">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              const img = document.getElementById('displayedImage') as HTMLImageElement;
              img.style.display = img.style.display === 'none' ? 'block' : 'none';
            }}
          >
            Toggle Image
          </Button>
          <img 
            id="displayedImage" 
            src="/MRBIG.jpeg" 
            alt="Example" 
            style={{display: 'none', maxWidth: '400px'}}
          />
        </div>
      </div>
    );
  }