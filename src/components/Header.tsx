import React, { useState } from "react";
import Link from "next/link";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-primary py-4 text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4">
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
          <Link href="https://fds-limburg.schule/iserv" className="inline-block bg-gradient-to-r from-lime-600 via-slate-500 to-blue-600 bg-clip-text text-transparent">
            FDS-IServ
          </Link>
        </nav>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 md:hidden">
          <nav className="flex flex-col items-center py-2">
            <Link
              href="/"
              className="my-2 hover:underline"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/impressum"
              className="my-2 hover:underline"
              onClick={toggleMenu}
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="my-2 hover:underline"
              onClick={toggleMenu}
            >
              Datenschutz
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
