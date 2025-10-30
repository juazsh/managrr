import React from 'react';
import Navbar from '../components/marketing/Navbar';
import Footer from '../components/marketing/Footer';

const MarketingLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;