'use client';

import { Button } from "@/components/ui/button";
import WelcomeOverlay from "./welcomeOverlay";
import Image from 'next/image';

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
          <Image 
            id="displayedImage" 
            src="/MRBIG.jpeg" 
            alt="Example" 
            width={400}
            height={400}
            style={{display: 'none'}}
          />
        </div>
      </div>
    );
  }