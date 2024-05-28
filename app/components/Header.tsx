import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Vertretungsplan FDS-Limburg</h1>
                <nav>
                    <Link href="/" className="mx-2 hover:underline">
                        Home
                    </Link>
                    <Link href="/impressum" className="mx-2 hover:underline">
                        Impressum
                    </Link>
                    <Link href="/datenschutz" className="mx-2 hover:underline">
                        Datenschutz
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
