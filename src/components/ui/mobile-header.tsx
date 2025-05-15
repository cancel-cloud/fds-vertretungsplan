import { Button } from "./button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Calendar } from "./calendar";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, DesktopIcon } from "@radix-ui/react-icons";

interface MobileHeaderProps {
  onDateSelect?: (date: Date | undefined) => void;
  onDateConfirm?: () => void;
  selectedDate?: Date;
  loading?: boolean;
}

export function MobileHeader({ onDateSelect, onDateConfirm, selectedDate, loading }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleDateConfirmAndClose = () => {
    if (onDateConfirm) {
      onDateConfirm();
    }
    setIsOpen(false);
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
    <header className="md:hidden bg-primary text-primary-foreground p-4 sticky top-0 z-50 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold hover:text-primary-foreground/90" onClick={() => setIsOpen(false)}>
        Vertretungsplan FDS-Limburg
      </Link>
      <div className="flex items-center gap-2">
        {mounted && (
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={cycleTheme}>
            {themeIcon}
          </Button>
        )}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary-foreground/80">
              <HamburgerMenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                <Link href="/" className="text-lg hover:text-blue-600" onClick={() => setIsOpen(false)}>
                  Vertretungsplan FDS-Limburg
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    Anderen Tag anschauen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Wähle einen Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={onDateSelect}
                      className="rounded-md border mx-auto"
                    />
                    <Button 
                      onClick={handleDateConfirmAndClose}
                      className="w-full"
                      disabled={!selectedDate || loading}
                    >
                      Vertretungen anzeigen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Link href="/impressum" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  Impressum
                </Button>
              </Link>
              <Link href="/datenschutz" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  Datenschutz
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
} 