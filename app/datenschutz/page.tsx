"use client";

import Header from '../components/Header';
import Footer from '../components/Footer';
import React from "react";

const Page: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
            <Header />
            <main className="flex-grow p-6 container mx-auto">
                <h2 className="text-2xl font-bold mb-4">Datenschutz</h2>
                <p>Hier kommen die Angaben zum Datenschutz.</p>
            </main>
            <Footer />
        </div>
    );
};

export default Page;
