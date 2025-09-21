import React, { useState, useRef, useEffect } from 'react';
import { UserIcon, ChevronDownIcon } from './ui/icons/Icons';

interface TopBarProps {
    title: string;
    onLogout: () => void;
    currentUser: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onLogout, currentUser }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-secondary-dark/50 backdrop-blur-lg border-b border-border-dark sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-16">
        <h1 className="text-xl font-semibold text-gray-100 tracking-tight truncate pr-4">
            {title}
        </h1>

        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-dark focus:ring-accent transition-colors"
            >
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-accent" />
                </div>
                <span className="hidden sm:inline font-semibold text-gray-200">{currentUser}</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary-dark rounded-md shadow-lg py-1 ring-1 ring-border-dark z-40">
                    <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};
