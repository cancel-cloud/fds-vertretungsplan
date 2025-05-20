"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubstitutionItem } from "@/components/ui/substitution-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, ReloadIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useMemo } from "react";
import WelcomeOverlay from "@/app/test/welcomeOverlay";
import { PageHeader } from "@/components/ui/page-header";

interface SubstitutionResponse {
  payload: {
    rows: {
      data: string[];
    }[];
  };
}

type ErrorType = "API_ERROR" | "INTERNAL_ERROR" | null;

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [substitutions, setSubstitutions] = useState<{ data: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorType>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubstitutions = async (targetDate?: Date) => {
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
    } catch (err) {
      console.error("Error fetching substitutions:", err);
      setError(err instanceof Error && err.message === "API_ERROR" ? "API_ERROR" : "INTERNAL_ERROR");
      setSubstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubstitutions = useMemo(() => {
    if (!searchQuery.trim()) return substitutions;

    const query = searchQuery.toLowerCase();
    return substitutions.filter(sub => {
      return sub.data.some(field => 
        field.toLowerCase().includes(query)
      );
    });
  }, [substitutions, searchQuery]);

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
          ) : (
            "Ein interner Fehler ist aufgetreten. Bitte laden Sie die Seite neu."
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <>
      <WelcomeOverlay />
      <div className="min-h-screen bg-background grid grid-rows-[auto_1fr]">
        <PageHeader
          title="Vertretungsplan"
          description="Aktuelle Vertretungen und Raumänderungen für die Dessauer Schule Limburg"
        />

        <main className="w-full overflow-x-auto">
          <div className="max-w-[1620px] mx-auto p-4 md:p-8 min-w-full md:min-w-[1200px]">
            <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8">
              {/* Desktop sidebar */}
              <div className="hidden md:flex flex-col space-y-4 shrink-0">
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
                      {sortedSubstitutions.length} von {substitutions.length} Vertretungen
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile search */}
              <div className="md:hidden space-y-4 mb-6">
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
                      {sortedSubstitutions.length} von {substitutions.length} Vertretungen
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <ErrorAlert type={error} />
                
                {/* Mobile view - single column */}
                <div className="grid grid-cols-1 gap-4 md:hidden min-w-full">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <SubstitutionItem key={`skeleton-${index}`} data={[]} isLoading />
                    ))
                  ) : (
                    sortedSubstitutions.map((substitution, index) => (
                      <SubstitutionItem key={index} data={substitution.data} />
                    ))
                  )}
                </div>

                {/* Desktop view - multi-column */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 content-start min-w-[800px] lg:min-w-[1200px]">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
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
