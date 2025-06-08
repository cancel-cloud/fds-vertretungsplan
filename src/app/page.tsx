"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubstitutionItem } from "@/components/ui/substitution-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, ReloadIcon, MagnifyingGlassIcon, CheckIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useMemo, useCallback } from "react";
import WelcomeOverlay from "@/app/test/welcomeOverlay";
import { PageHeader } from "@/components/ui/page-header";

interface SubstitutionResponse {
  payload: {
    rows: {
      data: string[];
    }[];
  };
}

type ErrorType = "API_ERROR" | "INTERNAL_ERROR" | "NETWORK_ERROR" | null;

// Define categories
const CATEGORIES = [
  "Entfall",
  "Raumänderung",
  "Vertretung",
  "Sondereinsatz",
  "EVA", // Eigenverantwortliches Arbeiten
  "Klausur",
  "Freisetzung",
  "Sonstiges",
];

// Helper function to get substitution type from info string
// Revised keyword matching for better accuracy
const categoryKeywords: Record<string, string[]> = {
  "Entfall": ["entfällt", "fällt aus", "entfall", "ausfall"],
  "Klausur": ["klausur", "prüfung", "klassenarbeit", "test"],
  "EVA": ["eva", "eigenverantwortliches arbeiten", "selbstlernzeit"],
  "Freisetzung": ["freisetzung", "frei"], // "frei" handled specially
  "Raumänderung": [
    "raumänderung", 
    "raumvtr.", 
    "raum vtr.", 
    "raumwechsel", 
    "neuer raum", 
    "verlegt nach raum", // More specific than just "verlegt"
    "raumtausch", 
    "raum ->", // specific pattern
    "raum statt", // specific pattern
    "verlegt in raum", // more specific
    "findet in raum", // new addition
    "raum siehe", // new addition
    "wechselt nach raum", // new addition
  ],
  "Vertretung": [
    "vertretung", 
    "vertr.", 
    "vtr.", 
    "wird vertreten", 
    "vertritt", 
    "übernimmt", 
    "statt", // General "statt", handled carefully
    "durch", 
    "std-vertr.",
    "lehrerwechsel", // new addition
  ],
  "Sondereinsatz": ["sondereinsatz", "sonder", "projekt", "exkursion", "veranstaltung", "wandertag", "aufsicht"], // added "aufsicht"
};

// Detection order matters for overlapping keywords!
const detectionOrder: string[] = [
  "Entfall",
  "Klausur",
  "EVA",
  "Freisetzung",
  "Raumänderung", 
  "Vertretung",   
  "Sondereinsatz"
];

const getSubstitutionType = (info: string | undefined): string => {
  // For debugging, uncomment these lines in your local environment:
  // console.log(`Original Info: '${info}'`);
  if (!info || info.trim() === "" || info.trim() === "-") {
    // console.log("Assigned Type: Sonstiges (no/empty info)");
    return "Sonstiges";
  }
  const lowerInfo = info.toLowerCase().trim();

  // --- START REVISED INITIAL RAUM CHECK ---
  // Covers: "Raum Xyz", "R Xyz", "Raum->Xyz", "Raum statt Xyz", "Raum siehe Xyz"
  // Xyz can be alphanumeric or include common separators like hyphen/slash for combined rooms.
  const raumPattern = /^(raum|r\.|r)\s*([\w\düäöÜÄÖ-]+(\s*[-\/]\s*[\w\düäöÜÄÖ-]+)?)/; 
  const raumContextKeywords = ["->", "statt", "siehe", "verlegt", "wechsel", "neu:"]; // Added "neu:"

  if (raumPattern.test(lowerInfo) || 
      (lowerInfo.includes("raum") && raumContextKeywords.some(k => lowerInfo.includes(k)))) {
    
    // Before definitively calling it Raumänderung, check if it's a more specific, high-priority type.
    let isOtherHighlySpecificType = false;
    const highPriorityCats = ["Entfall", "Klausur", "EVA"]; // Freisetzung removed as "frei" is too ambiguous here
    for (const otherCat of highPriorityCats) {
        const otherKeywords = categoryKeywords[otherCat];
        if (otherKeywords && otherKeywords.some(ok => lowerInfo.includes(ok))) {
            // Example: "Entfall Raum C101" should be Entfall.
            isOtherHighlySpecificType = true;
            break;
        }
    }
    if (!isOtherHighlySpecificType) {
        // console.log(`Assigned Type: Raumänderung (info: '${lowerInfo}' based on initial specific Raum pattern)`);
        return "Raumänderung";
    }
    // If it IS another highly specific type (e.g., Entfall), we don't return Raumänderung here;
    // the main detectionOrder loop below will handle it correctly.
  }
  // --- END REVISED INITIAL RAUM CHECK ---

  // Check for very specific Raumänderung cases first that might be misclassified or are too general
  // This block is now largely covered by the new initial check, but kept for existing more complex regexes if needed in future.
  // Consider removing or refactoring this older block if the new initial check is sufficient.
  /* 
  if ((lowerInfo.includes("raum") && (lowerInfo.includes("->") || lowerInfo.includes("statt") || lowerInfo.includes("siehe"))) || 
      lowerInfo.startsWith("r ") || // e.g. "R 123"
      /raum\s*\d/.test(lowerInfo) || // e.g. "Raum 123"
      /r\.\s*\d/.test(lowerInfo) ) { // e.g. "R. 123"
      // console.log(`Assigned Type: Raumänderung (info: '${lowerInfo}' based on specific Raum pattern)`);
      return "Raumänderung";
  }
  */

  for (const category of detectionOrder) {
    const keywords = categoryKeywords[category];
    if (keywords) {
      for (const keyword of keywords) {
        // Special handling for "frei" in Freisetzung to avoid conflict with "fällt frei" (Entfall)
        if (category === "Freisetzung" && keyword === "frei") {
          if (lowerInfo.includes("frei") && !lowerInfo.includes("fällt")) {
            // console.log(`Assigned Type: ${category} (info: '${lowerInfo}' based on 'frei' rule)`);
            return category;
          }
          continue; // Move to next keyword for Freisetzung or next category
        }

        // Specific handling for Raumänderung keywords to avoid being too greedy or too loose
        if (category === "Raumänderung") {
            // Keywords like "verlegt nach raum" or "findet in raum" should be checked with care
            if (lowerInfo.includes(keyword)) {
                 // Avoid classifying as Raumänderung if it's actually an Entfall or other specific type
                let isOtherSpecificType = false;
                for (const otherCat of detectionOrder) {
                    if (otherCat === "Raumänderung" || otherCat === "Sonstiges" || otherCat === "Vertretung") continue; // Don't check against self, Sonstiges or general Vertretung
                    const otherKeywords = categoryKeywords[otherCat];
                    if (otherKeywords && otherKeywords.some(ok => lowerInfo.includes(ok))) {
                        isOtherSpecificType = true;
                        break;
                    }
                }
                if (!isOtherSpecificType) {
                    // console.log(`Assigned Type: ${category} (info: '${lowerInfo}' based on '${keyword}')`);
                    return category;
                }
            }
            continue; // Continue to next keyword for Raumänderung or next category
        }
        
        // Special handling for general "statt" in Vertretung to avoid Raumänderung's "raum statt"
        if (category === "Vertretung" && keyword === "statt") {
          if (lowerInfo.includes("statt") && !lowerInfo.includes("raum statt") && !lowerInfo.includes("statt raum")) {
            // console.log(`Assigned Type: ${category} (info: '${lowerInfo}' based on general 'statt' rule)`);
            return category;
          }
          continue;
        }

        // Standard keyword check
        if (lowerInfo.includes(keyword)) {
          // console.log(`Assigned Type: ${category} (info: '${lowerInfo}' based on '${keyword}')`);
          return category;
        }
      }
    }
  }
  // console.log(`Assigned Type: Sonstiges (info: '${lowerInfo}')`);
  return "Sonstiges";
};

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [substitutions, setSubstitutions] = useState<{ data: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [displayedCategories, setDisplayedCategories] = useState<string[]>([]);

  const fetchSubstitutions = useCallback(async (targetDate?: Date) => {
    const dateToFetch = targetDate || date;
    if (!dateToFetch) return;

    setLoading(true);
    setError(null);
    try {
      const formattedDate = dateToFetch.getFullYear() * 10000 + 
        (dateToFetch.getMonth() + 1) * 100 + 
        dateToFetch.getDate();

      const response = await fetch("/api/substitutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: formattedDate }),
      });

      if (!response.ok) {
        throw new Error("API_ERROR");
      }

      const data: SubstitutionResponse = await response.json();
      setSubstitutions(data.payload.rows);

      // Dynamically set displayed categories based on fetched data
      const currentTypes = new Set(data.payload.rows.map(sub => getSubstitutionType(sub.data[6])));
      const activeDisplayCategories = CATEGORIES.filter(cat => currentTypes.has(cat));
      // Ensure "Sonstiges" is added if there are items classified as such but not in CATEGORIES explicitly, 
      // or if no other specific categories are found but items exist.
      if (currentTypes.has("Sonstiges") && !activeDisplayCategories.includes("Sonstiges")) {
        activeDisplayCategories.push("Sonstiges");
      }
      // If after all filtering, no categories are derived from CATEGORIES but there are "Sonstiges" items, show it.
      if (activeDisplayCategories.length === 0 && currentTypes.has("Sonstiges")) {
         activeDisplayCategories.push("Sonstiges");
      }
      setDisplayedCategories(activeDisplayCategories);

      // Filter selectedCategories to only include those that are currently displayable
      setSelectedCategories(prev => prev.filter(cat => activeDisplayCategories.includes(cat)));

    } catch (err) {
      console.error("Error fetching substitutions:", err);
      if (err instanceof Error) {
        if (err.message === "API_ERROR") {
          setError("API_ERROR");
        } else if (err.message.includes("ENOTFOUND") || err.message.includes("fetch failed")) {
          setError("NETWORK_ERROR");
        } else {
          setError("INTERNAL_ERROR");
        }
      } else {
        setError("INTERNAL_ERROR");
      }
      setSubstitutions([]);
      // Reset displayed categories on error or no data
      setDisplayedCategories([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const filteredSubstitutions = useMemo(() => {
    let filtered = substitutions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.data.some(field => field.toLowerCase().includes(query))
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(sub => {
        const info = sub.data[6]; // Assuming info is the 7th element
        const type = getSubstitutionType(info);
        return selectedCategories.includes(type);
      });
    }
    
    return filtered;
  }, [substitutions, searchQuery, selectedCategories]);

  const sortedSubstitutions = useMemo(() => {
    return [...filteredSubstitutions].sort((a, b) => {
      const [hourA] = a.data;
      const [hourB] = b.data;
      const [, , , , , , infoA] = a.data;
      const [, , , , , , infoB] = b.data;

      // First, sort by Entfall status
      const isEntfallA = infoA?.toLowerCase().includes('entfall') ?? false;
      const isEntfallB = infoB?.toLowerCase().includes('entfall') ?? false;
      if (isEntfallA !== isEntfallB) {
        return isEntfallA ? -1 : 1;
      }

      // Then sort by hour
      const getNumericHour = (hour: string) => {
        const match = hour.match(/(\d+)(?:-(\d+))?/);
        if (!match) return 99; // Default high value for invalid formats
        return parseInt(match[1], 10);
      };

      const numA = getNumericHour(hourA);
      const numB = getNumericHour(hourB);
      return numA - numB;
    });
  }, [filteredSubstitutions]);

  useEffect(() => {
    fetchSubstitutions();
  }, []); // Only fetch on initial load

  const ErrorAlert = ({ type }: { type: ErrorType }) => {
    if (!type) return null;

    return (
      <Alert variant="destructive" className="mb-4">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Ein Fehler ist aufgetreten</AlertTitle>
        <AlertDescription>
          {type === "API_ERROR" ? (
            "Der Server ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut."
          ) : type === "NETWORK_ERROR" ? (
            "Keine Internetverbindung möglich. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut."
          ) : (
            "Ein interner Fehler ist aufgetreten. Bitte laden Sie die Seite neu."
          )}
        </AlertDescription>
      </Alert>
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const CategoryButtons = () => (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Nach Typ filtern:</p>
      <div className="flex flex-wrap gap-2">
        {displayedCategories.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">Keine Filter für aktuelle Auswahl.</p>
        )}
        {displayedCategories.map(category => (
          <Button
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryToggle(category)}
            className="flex items-center"
          >
            {selectedCategories.includes(category) && <CheckIcon className="mr-2 h-4 w-4" />}
            {category}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <WelcomeOverlay />
      <div className="min-h-screen bg-background grid grid-rows-[auto_1fr]">
        <PageHeader
          title="Vertretungsplan"
          description="Aktuelle Vertretungen und Raumänderungen für die Dessauer Schule Limburg"
        />

        <main className="w-full overflow-x-auto">
            <div className="max-w-[1620px] mx-auto p-4 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
              {/* Desktop sidebar */}
                <div className="hidden lg:flex flex-col space-y-4 shrink-0">
                <div className="bg-card rounded-lg border p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="mx-auto"
                  />
                  <Button 
                    onClick={() => fetchSubstitutions()}
                    className="w-full mt-4"
                    disabled={!date || loading}
                  >
                    {loading ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Lädt...
                      </>
                    ) : (
                      "Vertretungen anzeigen"
                    )}
                  </Button>
                </div>

                <div className="bg-card rounded-lg border p-4 space-y-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {searchQuery && (
                    <div className="text-sm text-muted-foreground">
                      {sortedSubstitutions.length} von {substitutions.length} {selectedCategories.length > 0 ? "gefilterten " : ""}Vertretungen
                    </div>
                  )}
                  <CategoryButtons />
                </div>
              </div>

              {/* Mobile search and filters */}
                <div className="lg:hidden space-y-4 mb-6">
                <div className="bg-card rounded-lg border p-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {searchQuery && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {sortedSubstitutions.length} von {substitutions.length} {selectedCategories.length > 0 ? "gefilterten " : ""}Vertretungen
                    </div>
                  )}
                  <div className="mt-4">
                    <CategoryButtons />
                  </div>
                </div>
              </div>
              
              <div>
                <ErrorAlert type={error} />
                
                {/* Mobile/Small Tablet view */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden min-w-full">
                  {loading ? (
                    Array.from({ length: window.innerWidth >= 640 ? 4 : 3 }).map((_, index) => (
                      <SubstitutionItem key={`skeleton-${index}`} data={[]} isLoading />
                    ))
                  ) : (
                    sortedSubstitutions.map((substitution, index) => (
                      <SubstitutionItem key={index} data={substitution.data} />
                    ))
                  )}
                </div>
                {/* Desktop/Tablet view - multi-column */}
                  <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 content-start auto-cols-max overflow-x-auto">
                  {loading ? (
                    Array.from({ length: loading && window.innerWidth >= 1280 ? 6 : 4 }).map((_, index) => (
                      <SubstitutionItem key={`skeleton-${index}`} data={[]} isLoading />
                    ))
                  ) : (
                    sortedSubstitutions.map((substitution, index) => (
                      <SubstitutionItem key={index} data={substitution.data} />
                    ))
                  )}
                </div>

                {/* No substitutions message */}
                {!loading && !error && sortedSubstitutions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery 
                      ? "Keine Vertretungen für diese Suche gefunden."
                      : "Keine Vertretungen für diesen Tag gefunden."
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
