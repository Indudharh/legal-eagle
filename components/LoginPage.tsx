import React from 'react';
import { Button } from './ui/Button';

const FeatherIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
        <line x1="16" y1="8" x2="2" y2="22"></line>
        <line x1="17.5" y1="15" x2="9" y2="15"></line>
    </svg>
);

interface LoginPageProps {
    onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onLogin();
    };

    return (
        <div className="min-h-screen bg-primary-dark flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-center items-center mb-6">
                    <FeatherIcon className="w-10 h-10 text-accent mr-3" />
                    <h1 className="text-4xl font-bold text-gray-100 tracking-tight">
                      Legal Eagle <span className="text-accent">AI</span>
                    </h1>
                </div>
                <div className="bg-secondary-dark p-8 rounded-xl border border-border-dark">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-100">Welcome Back</h2>
                        <p className="text-gray-400 text-sm mt-1">Sign in to access your dashboard</p>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    defaultValue="demo@legaleagle.ai"
                                    className="w-full p-3 bg-primary-dark border border-border-dark rounded-lg text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent transition-shadow duration-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    defaultValue="password"
                                    className="w-full p-3 bg-primary-dark border border-border-dark rounded-lg text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent transition-shadow duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full py-3 text-base">
                                Sign In
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
             <footer className="text-center p-4 text-gray-600 text-sm mt-8">
                <p>&copy; {new Date().getFullYear()} Legal Eagle. All rights reserved.</p>
            </footer>
        </div>
    );
};