import React, { useState } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center px-4">
                <h1 className="text-2xl font-bold">Vertretungsplan FDS-Limburg</h1>
                <nav className="hidden md:flex">
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
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-gradient-to-r from-blue-500 to-purple-600">
                    <nav className="flex flex-col items-center py-2">
                        <Link href="/" className="my-2 hover:underline" onClick={toggleMenu}>
                            Home
                        </Link>
                        <Link href="/impressum" className="my-2 hover:underline" onClick={toggleMenu}>
                            Impressum
                        </Link>
                        <Link href="/datenschutz" className="my-2 hover:underline" onClick={toggleMenu}>
                            Datenschutz
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
