"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubstitutionItem } from "@/components/ui/substitution-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, ReloadIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useMemo } from "react";

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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Header */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vertretungsplan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Aktuelle Vertretungen und Raumänderungen für die Dessauer Schule Limburg
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Desktop sidebar */}
          <div className="hidden md:flex flex-col space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border bg-white dark:bg-gray-800"
            />
            <Button 
              onClick={() => fetchSubstitutions()}
              className="w-full"
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
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && (
              <div className="text-sm text-gray-500">
                {filteredSubstitutions.length} von {substitutions.length} Vertretungen
              </div>
            )}
          </div>

          {/* Mobile search */}
          <div className="md:hidden space-y-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery && (
              <div className="text-sm text-gray-500">
                {filteredSubstitutions.length} von {substitutions.length} Vertretungen
              </div>
            )}
          </div>
          
          <div>
            <ErrorAlert type={error} />
            
            {/* Mobile view - single column */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredSubstitutions.map((substitution, index) => (
                <SubstitutionItem key={index} data={substitution.data} />
              ))}
            </div>

            {/* Desktop view - multi-column */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
              {filteredSubstitutions.map((substitution, index) => (
                <SubstitutionItem key={index} data={substitution.data} />
              ))}
            </div>

            {/* No substitutions message */}
            {!loading && !error && filteredSubstitutions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchQuery 
                  ? "Keine Vertretungen für diese Suche gefunden."
                  : "Keine Vertretungen für diesen Tag gefunden."
                }
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Lade Vertretungen...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
