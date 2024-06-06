// src/pages/impressum.tsx
import React from 'react';
import Header from "@/components/Header";

const Impressum: React.FC = () => {
    return (
        <main>
            <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4">Datenschutz</h1>
            <p className="text-lg">
                This is the Impressum page. You can add your legal information and other details here.
            </p>
            <p className="text-md mt-4">
                <strong>Company Name:</strong> Your Company
            </p>
            <p className="text-md">
                <strong>Address:</strong> 1234 Street, City, Country
            </p>
            <p className="text-md">
                <strong>Contact:</strong> email@example.com
            </p>
        </div>
        </main>
    );
};

export default Impressum;
