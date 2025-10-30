import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-text text-white pt-section pb-component">
      <div className="max-w-[1200px] mx-auto px-component">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-component mb-component">
          <div className="flex flex-col gap-element">
            <h4 className="text-base font-semibold mb-2 text-white">Product</h4>
            <Link to="/features" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">Features</Link>
            <Link to="/pricing" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">Pricing</Link>
            <Link to="/how-it-works" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">How It Works</Link>
          </div>

          <div className="flex flex-col gap-element">
            <h4 className="text-base font-semibold mb-2 text-white">Company</h4>
            <Link to="/about" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">About</Link>
            <Link to="/contact" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">Contact</Link>
          </div>

          <div className="flex flex-col gap-element">
            <h4 className="text-base font-semibold mb-2 text-white">Legal</h4>
            <Link to="/terms" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">Terms of Service</Link>
            <Link to="/privacy" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">Privacy Policy</Link>
          </div>

          <div className="flex flex-col gap-element">
            <h4 className="text-base font-semibold mb-2 text-white">Contact</h4>
            <a href="mailto:support@managrr.com" className="text-white/70 no-underline text-sm transition-colors duration-200 hover:text-white">
              support@managrr.com
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-component text-center">
          <p className="text-sm text-white/70">
            © {currentYear} Managrr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;