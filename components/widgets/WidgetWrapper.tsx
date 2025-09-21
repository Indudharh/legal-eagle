import React from 'react';
import { Card } from '../ui/Card';
import { XIcon } from '../ui/icons/Icons';

interface WidgetWrapperProps {
    title: string;
    onRemove: () => void;
    children: React.ReactNode;
    headerControls?: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ title, onRemove, children, headerControls, className, contentClassName = "p-5" }) => {
    return (
        <Card className={`flex flex-col h-full ${className}`}>
            <Card.Header className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex-grow">
                    <Card.Title>{title}</Card.Title>
                </div>
                <div className="w-full sm:w-auto flex items-center gap-2">
                    {headerControls}
                    <button
                        onClick={onRemove}
                        className="text-gray-500 hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-700 ml-auto"
                        aria-label={`Remove ${title} widget`}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </Card.Header>
            <div className={`flex-grow ${contentClassName}`}>
                {children}
            </div>
        </Card>
    );
};