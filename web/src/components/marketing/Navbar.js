import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-[1000]">
      <div className="max-w-[1200px] mx-auto px-component py-element flex justify-between items-center relative">
        <Link to="/" className="text-2xl font-bold text-primary no-underline">Managrr</Link>

        <button
          className="hidden max-[768px]:flex flex-col gap-1 bg-none border-none cursor-pointer p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-text rounded-sm"></span>
          <span className="w-6 h-0.5 bg-text rounded-sm"></span>
          <span className="w-6 h-0.5 bg-text rounded-sm"></span>
        </button>

        <div
          className={`flex gap-component items-center max-[768px]:${isMobileMenuOpen ? 'flex' : 'hidden'} max-[768px]:flex-col max-[768px]:absolute max-[768px]:top-full max-[768px]:left-0 max-[768px]:right-0 max-[768px]:bg-white max-[768px]:shadow-md max-[768px]:p-4 max-[768px]:gap-0 max-[768px]:z-[1000]`}
        >
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className={`text-text no-underline text-base transition-colors duration-200 hover:text-primary max-[768px]:py-3 max-[768px]:border-b max-[768px]:border-[#f0f0f0] max-[768px]:w-full ${isActive(link.path) ? 'text-primary font-semibold' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="hidden max-[768px]:flex flex-col gap-3 pt-4 border-t border-[#f0f0f0] mt-4 w-full">
            <Link to="/login" className="text-primary no-underline text-base py-3 text-center font-medium" onClick={handleLinkClick}>
              Sign In
            </Link>
            <Link to="/register" className="bg-primary text-white no-underline text-base py-3 px-6 rounded-md font-medium text-center" onClick={handleLinkClick}>
              Get Started
            </Link>
          </div>
        </div>

        <div className="flex gap-element items-center max-[768px]:hidden">
          <Link to="/login" className="text-primary no-underline text-base py-2 px-4">
            Sign In
          </Link>
          <Link to="/register" className="bg-primary text-white no-underline text-base py-3 px-6 rounded-md font-medium">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;