import React from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import { type ActivityEvent } from '../../types';
import { FilePlusIcon, TagIcon, TrashIcon, InfoIcon } from '../ui/icons/Icons';

interface TeamActivityFeedWidgetProps {
    title: string;
    onRemove: () => void;
    activityFeed: ActivityEvent[];
}

// Time ago utility
const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const ActivityIcon: React.FC<{ type: ActivityEvent['type'] }> = ({ type }) => {
    const commonClasses = "w-5 h-5";
    switch (type) {
        case 'DOCUMENT_CREATED':
            return <FilePlusIcon className={`${commonClasses} text-green-400`} />;
        case 'STATUS_UPDATED':
            return <TagIcon className={`${commonClasses} text-accent`} />;
        case 'DOCUMENT_DELETED':
            return <TrashIcon className={`${commonClasses} text-red-400`} />;
        default:
            return null;
    }
};

const ActivityMessage: React.FC<{ event: ActivityEvent }> = ({ event }) => {
    const { user, type, details } = event;
    const docName = <span className="font-semibold text-gray-200">{details.documentName}</span>;
    
    switch (type) {
        case 'DOCUMENT_CREATED':
            return <>{user} analyzed {docName}.</>;
        case 'STATUS_UPDATED':
            return <>{user} updated {docName} to <span className="font-semibold">{details.newStatus}</span>.</>;
        case 'DOCUMENT_DELETED':
            return <>{user} deleted {docName}.</>;
        default:
            return <>Unknown action.</>;
    }
};


export const TeamActivityFeedWidget: React.FC<TeamActivityFeedWidgetProps> = ({ title, onRemove, activityFeed }) => {
    return (
        <WidgetWrapper title={title} onRemove={onRemove}>
            <div className="h-full">
                {activityFeed.length > 0 ? (
                    <ul className="space-y-4">
                        {activityFeed.slice(0, 10).map((event) => ( // Show latest 10
                            <li key={event.id} className="flex items-start gap-4">
                                <div className="bg-gray-700 p-2 rounded-full mt-1">
                                    <ActivityIcon type={event.type} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300">
                                        <ActivityMessage event={event} />
                                    </p>
                                    <p className="text-xs text-gray-500">{timeAgo(event.timestamp)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <InfoIcon className="w-10 h-10 text-gray-600 mb-3" />
                        <h4 className="font-semibold text-gray-300">No Recent Activity</h4>
                        <p className="text-sm text-gray-500 mt-1">Actions on documents will appear here.</p>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
};