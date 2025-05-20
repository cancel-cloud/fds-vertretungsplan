"use client";

import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/ui/mobile-header";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, DesktopIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleDateConfirm = async () => {
    if (selectedDate) {
      setLoading(true);
      // Here you would typically fetch the data
      // For now, we'll just simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    }
  };

  // Helper to cycle theme
  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  // Icon for current theme
  const themeIcon =
    theme === "system" ? <DesktopIcon className="h-5 w-5" /> :
    theme === "dark" ? <MoonIcon className="h-5 w-5" /> :
    <SunIcon className="h-5 w-5" />;

  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex bg-primary text-primary-foreground p-4 sticky top-0 z-50 items-end justify-between">
        <Link href="/" className="text-lg font-bold hover:text-primary-foreground/90">
          Vertretungsplan FDS-Limburg
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground/90 hover:text-primary-foreground"
            asChild
          >
            <Link href="/impressum">Impressum</Link>
          </Button>
          <Button
            variant="ghost" 
            size="sm"
            className="text-primary-foreground/90 hover:text-primary-foreground"
            asChild
          >
            <Link href="/datenschutz">Datenschutzerklärung</Link>
          </Button>
          {mounted && (
            <Button
              className="ml-2 p-2 rounded-full transition-colors
                bg-secondary hover:bg-secondary/80 
                dark:bg-secondary/20 dark:hover:bg-secondary/30
                border border-border dark:border-border/50
                text-foreground dark:text-foreground/90
                hover:scale-105 hover:shadow-md"
              aria-label="Toggle theme"
              onClick={cycleTheme}
            >
              {themeIcon}
            </Button>
          )}
        </div>
      </header>

      {/* Mobile header */}
      <MobileHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onDateConfirm={handleDateConfirm}
        loading={loading}
      />
      {children}
    </>
  );
} 