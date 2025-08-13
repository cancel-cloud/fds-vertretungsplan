import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import Loading from "./Loading";
import Error from "./Error";
import { Switch } from "@nextui-org/switch";
import generateDate from "@/pages/api/getDate";
import Image from "next/image";

interface SubstitutionData {
  data: string[];
  group: string;

  [key: string]: any;
}

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
      // @ts-ignore
      throw new Error("Network response was not ok");
    }

    const result = await response.json();
    const rows = result.payload?.rows || [];

    // Sort rows based on "Stunde"
    rows.sort((a: SubstitutionData, b: SubstitutionData) => {
      const stundeA = parseInt(a.data[0], 10);
      const stundeB = parseInt(b.data[0], 10);
      if (isNaN(stundeA) || isNaN(stundeB)) return 0; // if stunde is not a number, keep order as is
      return stundeA - stundeB;
    });

    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
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

  const handleSearch = (query: string) => {
    if (query.toLowerCase() === "mr big") {
      setShowMrBig(true);
      setFilteredData([]);
    } else {
      setShowMrBig(false);
      const filtered = data.filter(
        (item) =>
          item.group.toLowerCase().includes(query.toLowerCase()) ||
          item.data.some((cell: string) =>
            cell.toLowerCase().includes(query.toLowerCase())
          )
      );
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
            src="/MRBIG.JPG"
            alt="Mr. Big"
            className="rounded shadow-md"
            width={400}
            height={300}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((item, index) => (
            <div key={index} className="rounded bg-white p-4 shadow-md">
              <p>
                <strong>Stunde:</strong> {item.data[0]}
              </p>
              <p>
                <strong>Zeit:</strong> {item.data[1]}
              </p>
              <p>
                <strong>Klassen:</strong> {item.data[2]}
              </p>
              <p>
                <strong>Fach:</strong> {item.data[3]}
              </p>
              <p>
                <strong>Raum:</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: item.data[4] }} />
              </p>
              <p>
                <strong>Lehrkraft:</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: item.data[5] }} />
              </p>
              <p>
                <strong>Info:</strong>{" "}
                {item.data[6] ? (
                  <span dangerouslySetInnerHTML={{ __html: item.data[6] }} />
                ) : (
                  "Keine Info"
                )}
              </p>
              <p>
                <strong>Vertretungstext:</strong>{" "}
                {item.data[7] ? (
                  <span dangerouslySetInnerHTML={{ __html: item.data[7] }} />
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
