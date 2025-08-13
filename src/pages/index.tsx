"use client";

import Header from "../components/Header";
import SubstitutionPlan from "../components/SubstitutionPlan";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/ErrorBoundary";
import React from "react";

/**
 * Home page component displaying the substitution plan with error boundary protection
 */
const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900">
      <Header />
      <main className="flex-grow">
        <ErrorBoundary>
          <SubstitutionPlan />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
