import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import Loading from "./Loading";
import Error from "./Error";
import { Switch } from "@nextui-org/switch";
import { generateDate, sanitizeHtml, sortSubstitutionsByHour, filterSubstitutions, isHtmlContentSafe } from "@/utils";
import { SubstitutionData, SubstitutionApiResponse, ApiError } from "@/types";
import { UI_CONFIG, SUBSTITUTION_FIELDS } from "@/constants";
import Image from "next/image";

/**
 * Fetches substitution data from the API
 * @param date - Date string in YYYYMMDD format
 * @returns Promise resolving to sorted substitution data
 * @throws ApiError when fetch fails
 */
const fetchSubstitutionData = async (
  date: string
): Promise<SubstitutionData[]> => {
  try {
    const response = await fetch("/api/getSubstitutionData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new ApiError(`Network response was not ok: ${response.status}`);
    }

    const result: SubstitutionApiResponse = await response.json();
    const rows = result.payload?.rows || [];

    // Sort rows based on hour using utility function
    return sortSubstitutionsByHour(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch substitution data");
  }
};

const SubstitutionPlan: React.FC = () => {
  const [data, setData] = useState<SubstitutionData[]>([]);
  const [filteredData, setFilteredData] = useState<SubstitutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [showMrBig, setShowMrBig] = useState(false);

  const toggleDate = () => {
    setIsTomorrow(!isTomorrow);
  };

  useEffect(() => {
    const date = isTomorrow ? generateDate(1) : generateDate(0);
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const fetchedData = await fetchSubstitutionData(date);
        setData(fetchedData);
        setFilteredData(fetchedData);
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [isTomorrow]);

  /**
   * Handles search functionality with easter egg support
   * @param query - Search query string
   */
  const handleSearch = (query: string) => {
    if (query.toLowerCase() === UI_CONFIG.EASTER_EGG_TRIGGER) {
      setShowMrBig(true);
      setFilteredData([]);
    } else {
      setShowMrBig(false);
      const filtered = filterSubstitutions(data, query);
      setFilteredData(filtered);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <SearchBar onSearch={handleSearch} />
      <div className="my-4 flex justify-center">
        <label className="mr-2">Heute</label>
        <Switch checked={isTomorrow} onChange={toggleDate}>
          Morgen
        </Switch>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <Error />
      ) : showMrBig ? (
        <div className="flex justify-center">
          <Image 
            src={UI_CONFIG.EASTER_EGG_IMAGE} 
            alt="Mr. Big" 
            className="rounded shadow-md" 
            width={400} 
            height={300} 
          />
        </div>
      ) : (
        <div className={`grid gap-6 ${UI_CONFIG.GRID_BREAKPOINTS.MOBILE} ${UI_CONFIG.GRID_BREAKPOINTS.TABLET} ${UI_CONFIG.GRID_BREAKPOINTS.DESKTOP}`}>
          {filteredData.map((item, index) => (
            <div key={index} className="rounded bg-white p-4 shadow-md">
              <p>
                <strong>Stunde:</strong> {item.data[SUBSTITUTION_FIELDS.HOUR]}
              </p>
              <p>
                <strong>Zeit:</strong> {item.data[SUBSTITUTION_FIELDS.TIME]}
              </p>
              <p>
                <strong>Klassen:</strong> {item.data[SUBSTITUTION_FIELDS.CLASS]}
              </p>
              <p>
                <strong>Fach:</strong> {item.data[SUBSTITUTION_FIELDS.SUBJECT]}
              </p>
              <p>
                <strong>Raum:</strong>{" "}
                {isHtmlContentSafe(item.data[SUBSTITUTION_FIELDS.ROOM]) ? (
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.data[SUBSTITUTION_FIELDS.ROOM]) }} />
                ) : (
                  item.data[SUBSTITUTION_FIELDS.ROOM]
                )}
              </p>
              <p>
                <strong>Lehrkraft:</strong>{" "}
                {isHtmlContentSafe(item.data[SUBSTITUTION_FIELDS.TEACHER]) ? (
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.data[SUBSTITUTION_FIELDS.TEACHER]) }} />
                ) : (
                  item.data[SUBSTITUTION_FIELDS.TEACHER]
                )}
              </p>
              <p>
                <strong>Info:</strong>{" "}
                {item.data[SUBSTITUTION_FIELDS.INFO] ? (
                  isHtmlContentSafe(item.data[SUBSTITUTION_FIELDS.INFO]) ? (
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.data[SUBSTITUTION_FIELDS.INFO]) }} />
                  ) : (
                    item.data[SUBSTITUTION_FIELDS.INFO]
                  )
                ) : (
                  "Keine Info"
                )}
              </p>
              <p>
                <strong>Vertretungstext:</strong>{" "}
                {item.data[SUBSTITUTION_FIELDS.SUBSTITUTION_TEXT] ? (
                  isHtmlContentSafe(item.data[SUBSTITUTION_FIELDS.SUBSTITUTION_TEXT]) ? (
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.data[SUBSTITUTION_FIELDS.SUBSTITUTION_TEXT]) }} />
                  ) : (
                    item.data[SUBSTITUTION_FIELDS.SUBSTITUTION_TEXT]
                  )
                ) : (
                  "Kein Vertretungstext"
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubstitutionPlan;
