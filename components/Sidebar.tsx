import React from 'react';
import { LayoutDashboardIcon, FileScanIcon, SettingsIcon } from './ui/icons/Icons';

const FeatherIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
        <line x1="16" y1="8" x2="2" y2="22"></line>
        <line x1="17.5" y1="15" x2="9" y2="15"></line>
    </svg>
);

interface SidebarProps {
    activeView: string;
    onNavigateDashboard: () => void;
    onNavigateAnalysis: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onClick();
                }}
                className={`flex items-center p-3 rounded-lg transition-colors text-lg ${
                    isActive
                        ? 'bg-accent text-gray-900 font-bold shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
                {icon}
                <span className="ml-4">{label}</span>
            </a>
        </li>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigateDashboard, onNavigateAnalysis }) => {
    return (
        <aside className="w-64 bg-secondary-dark p-6 flex flex-col border-r border-border-dark sticky top-0 h-screen">
            <div className="flex items-center mb-10">
                 <FeatherIcon className="w-10 h-10 text-accent mr-3" />
                 <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
                    Legal Eagle
                </h1>
            </div>
            <nav className="flex-1">
                <ul className="space-y-4">
                    <NavItem 
                        label="Dashboard"
                        icon={<LayoutDashboardIcon className="w-6 h-6" />}
                        isActive={activeView === 'dashboard'}
                        onClick={onNavigateDashboard}
                    />
                     <NavItem 
                        label="Analyze"
                        icon={<FileScanIcon className="w-6 h-6" />}
                        isActive={activeView === 'analysis'}
                        onClick={onNavigateAnalysis}
                    />
                </ul>
            </nav>
            <div className="mt-auto">
                 <NavItem 
                    label="Settings"
                    icon={<SettingsIcon className="w-6 h-6" />}
                    isActive={false}
                    onClick={() => {}}
                />
            </div>
        </aside>
    );
};