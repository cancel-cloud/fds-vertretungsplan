import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import posthog from "posthog-js";

interface SubstitutionData {
    data: string[];
    group: string;
    [key: string]: any;
}

const SubstitutionPlan: React.FC = () => {
    const [data, setData] = useState<SubstitutionData[]>([]);
    const [filteredData, setFilteredData] = useState<SubstitutionData[]>([]);
    const [specialImage, setSpecialImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/getSubstitutionData', {
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();
                const rows = result.payload?.rows || [];
                if (Array.isArray(rows)) {
                    const sortedData = rows.sort((a, b) => {
                        const hourA = parseInt(a.data[0], 10);
                        const hourB = parseInt(b.data[0], 10);
                        return hourA - hourB;
                    });
                    setData(sortedData);
                    setFilteredData(sortedData);
                } else {
                    throw new Error('Fetched data does not contain an array of rows');
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
                setError('Das liegt an FDS');
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    const handleSearch = (query: string) => {
        if (query.toLowerCase() === "mr big") {
            setSpecialImage("/MRBIG.JPG");
            setFilteredData([]);
        } else {
            setSpecialImage(null);
            const filtered = data.filter(item =>
                item.group.toLowerCase().includes(query.toLowerCase()) ||
                item.data.some(cell => cell.toLowerCase().includes(query.toLowerCase()))
            );
            setFilteredData(filtered);
        }
    };
    posthog.capture('my event', { property: 'value' })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <SearchBar onSearch={handleSearch} />
            {specialImage ? (
                <div className="flex justify-center my-4">
                    <img src={specialImage} alt="Mr Big" className="max-w-full h-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded shadow-md">
                            <p><strong>Stunde:</strong> {item.data[0]}</p>
                            <p><strong>Zeit:</strong> {item.data[1]}</p>
                            <p><strong>Klassen:</strong> {item.data[2]}</p>
                            <p><strong>Fach:</strong> {item.data[3]}</p>
                            <p>
                                <strong>Raum:</strong> <span dangerouslySetInnerHTML={{ __html: item.data[4] }} />
                            </p>
                            <p>
                                <strong>Lehrkraft:</strong> <span dangerouslySetInnerHTML={{ __html: item.data[5] }} />
                            </p>
                            <p>
                                <strong>Info:</strong> {item.data[6] ? <span dangerouslySetInnerHTML={{ __html: item.data[6] }} /> : 'Keine Info'}
                            </p>
                            <p>
                                <strong>Vertretungstext:</strong> {item.data[7] ? <span dangerouslySetInnerHTML={{ __html: item.data[7] }} /> : 'Kein Vertretungstext'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubstitutionPlan;
