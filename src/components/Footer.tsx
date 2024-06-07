"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-10 bg-gray-800 py-4 text-center text-white">
      <p>
        Fragen?{" "}
        <a href="mailto:0rare-reputed@icloud.com" className="underline">
          Melde dich per Mail bei mir!
        </a>
      </p>
    </footer>
  );
};

export default Footer;
