"use client";

import Header from "../components/Header";
import SubstitutionPlan from "../components/SubstitutionPlan";
import Footer from "../components/Footer";
import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900">
      <Header />
      <main className="flex-grow">
        <SubstitutionPlan />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
