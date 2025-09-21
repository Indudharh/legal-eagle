import React from 'react';
import { Button } from './ui/Button';
import { PlusIcon } from './ui/icons/Icons';

interface AddWidgetPanelProps {
    availableWidgets: { [key: string]: { name: string } };
    activeWidgets: string[];
    onAddWidget: (widgetId: string) => void;
}

export const AddWidgetPanel: React.FC<AddWidgetPanelProps> = ({ availableWidgets, activeWidgets, onAddWidget }) => {
    const widgetsToAdd = Object.keys(availableWidgets)
        .filter(id => !activeWidgets.includes(id))
        .map(id => ({ id, name: availableWidgets[id].name }));

    if (widgetsToAdd.length === 0) {
        return null;
    }

    return (
        <div className="bg-secondary-dark/50 p-4 rounded-xl border border-border-dark">
            <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-sm font-semibold text-gray-300 mr-2">Add Widget:</h3>
                {widgetsToAdd.map(widget => (
                    <Button key={widget.id} onClick={() => onAddWidget(widget.id)} variant="secondary" className="px-3 py-1.5 text-sm">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {widget.name}
                    </Button>
                ))}
            </div>
        </div>
    );
};