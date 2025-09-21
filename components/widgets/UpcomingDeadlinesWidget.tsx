import React, { useMemo, useState, useCallback } from 'react';
import type { StoredDocument, ManualDeadline } from '../../types';
import { WidgetWrapper } from './WidgetWrapper';
import { InfoIcon, PlusIcon, BotIcon, UserIcon, PencilIcon, XIcon } from '../ui/icons/Icons';
import { Button } from '../ui/Button';

// Props for the main widget
interface UpcomingDeadlinesWidgetProps {
    title: string;
    onRemove: () => void;
    documents: StoredDocument[];
    manualDeadlines: ManualDeadline[];
    onViewDocument: (doc: StoredDocument) => void;
    onAddManualDeadline: (deadline: Omit<ManualDeadline, 'id'>) => void;
    onUpdateManualDeadline: (deadline: ManualDeadline) => void;
    onDeleteManualDeadline: (id: string) => void;
}

// Combined deadline type for internal use
type CombinedDeadline = {
    id: string;
    date: string;
    eventName: string;
    docName?: string;
    docId?: string;
    isManual: boolean;
};

// Date utilities
const today = new Date();
today.setHours(0, 0, 0, 0);
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Main Widget Component
export const UpcomingDeadlinesWidget: React.FC<UpcomingDeadlinesWidgetProps> = (props) => {
    const { title, onRemove, documents, manualDeadlines, onViewDocument, onAddManualDeadline, onUpdateManualDeadline, onDeleteManualDeadline } = props;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState<ManualDeadline | null>(null);

    const combinedDeadlines = useMemo(() => {
        const allDeadlines: CombinedDeadline[] = [];
        documents.forEach(doc => {
            doc.analysis.keyDates?.forEach(keyDate => {
                if (new Date(keyDate.date) >= today) {
                    allDeadlines.push({ id: `${doc.id}-${keyDate.date}`, date: keyDate.date, eventName: keyDate.eventName, docName: doc.name, docId: doc.id, isManual: false });
                }
            });
        });
        manualDeadlines.forEach(manual => {
             if (new Date(manual.date) >= today) {
                const doc = documents.find(d => d.id === manual.docId);
                allDeadlines.push({ ...manual, docName: doc?.name, isManual: true });
            }
        });
        return allDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [documents, manualDeadlines]);

    const filteredDeadlines = useMemo(() => {
        if (!selectedDate) return combinedDeadlines.slice(0, 7);
        return combinedDeadlines.filter(d => d.date === selectedDate);
    }, [combinedDeadlines, selectedDate]);

    const handleDateClick = (date: string) => {
        setSelectedDate(prev => (prev === date ? null : date));
    };

    const handleOpenModal = (deadline: ManualDeadline | null = null) => {
        setEditingDeadline(deadline);
        setIsModalOpen(true);
    };

    const handleSaveDeadline = (deadline: Omit<ManualDeadline, 'id'> | ManualDeadline) => {
        if ('id' in deadline) {
            onUpdateManualDeadline(deadline);
        } else {
            onAddManualDeadline(deadline);
        }
        setIsModalOpen(false);
    };

    const headerControls = <Button onClick={() => handleOpenModal()} variant="secondary" className="px-2 py-1.5 text-xs"><PlusIcon className="w-4 h-4 mr-1"/> Add</Button>;

    return (
        <WidgetWrapper title={title} onRemove={onRemove} headerControls={headerControls} contentClassName="p-0">
            <div className="flex flex-col h-full">
                <CalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} deadlines={combinedDeadlines} selectedDate={selectedDate} onDateClick={handleDateClick} />
                <div className="flex-grow">
                    {filteredDeadlines.length > 0 ? (
                        <ul className="divide-y divide-border-dark">
                            {filteredDeadlines.map((deadline) => (
                                <DeadlineItem key={deadline.id} deadline={deadline} documents={documents} onViewDocument={onViewDocument} onEdit={() => handleOpenModal(deadline as ManualDeadline)} onDelete={onDeleteManualDeadline} />
                            ))}
                        </ul>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-5">
                            <InfoIcon className="w-10 h-10 text-gray-600 mb-3" />
                            <h4 className="font-semibold text-gray-300">{selectedDate ? "No Deadlines on This Date" : "No Upcoming Deadlines"}</h4>
                            <p className="text-sm text-gray-500 mt-1">{selectedDate ? "Select another date or clear the filter." : "Add one manually or analyze documents with key dates."}</p>
                        </div>
                    )}
                </div>
            </div>
            {isModalOpen && <DeadlineModal documents={documents} deadline={editingDeadline} onSave={handleSaveDeadline} onClose={() => setIsModalOpen(false)} />}
        </WidgetWrapper>
    );
};

// --- Sub-components for the Widget ---

const CalendarView: React.FC<{ currentDate: Date, setCurrentDate: (d: Date) => void, deadlines: CombinedDeadline[], selectedDate: string | null, onDateClick: (d: string) => void }> =
({ currentDate, setCurrentDate, deadlines, selectedDate, onDateClick }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const deadlineDates = useMemo(() => new Set(deadlines.map(d => d.date)), [deadlines]);

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) calendarDays.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date(year, month, day).toDateString() === new Date().toDateString();
            const hasDeadline = deadlineDates.has(dateStr);
            const isSelected = selectedDate === dateStr;

            calendarDays.push(
                <div key={day} className="relative flex justify-center">
                    <button
                        onClick={() => onDateClick(dateStr)}
                        className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors 
                        ${isSelected ? 'bg-accent text-gray-900 font-semibold' : ''}
                        ${!isSelected && isToday ? 'bg-accent/20 text-accent' : ''}
                        ${!isSelected && !isToday ? 'text-gray-300 hover:bg-gray-700' : ''}`}
                    >
                        {day}
                    </button>
                    {hasDeadline && !isSelected && <div className="absolute bottom-1 w-1.5 h-1.5 bg-accent rounded-full"></div>}
                </div>
            );
        }
        return calendarDays;
    };
    
    return (
        <div className="p-4 border-b border-border-dark">
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 rounded-full hover:bg-gray-700 text-gray-400">&lt;</button>
                <p className="font-semibold text-gray-200">{MONTH_NAMES[month]} {year}</p>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 rounded-full hover:bg-gray-700 text-gray-400">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-gray-500">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                {renderCalendar()}
            </div>
        </div>
    );
};

const DeadlineItem: React.FC<{ deadline: CombinedDeadline, documents: StoredDocument[], onViewDocument: (d: StoredDocument) => void, onEdit: () => void, onDelete: (id: string) => void }> =
({ deadline, documents, onViewDocument, onEdit, onDelete }) => {
    const doc = deadline.docId ? documents.find(d => d.id === deadline.docId) : null;
    return (
        <li className="px-5 py-3 hover:bg-gray-700/50 transition-colors group">
            <div className="flex items-center gap-3">
                {/* Icon */}
                {deadline.isManual ? <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <BotIcon className="w-5 h-5 text-accent flex-shrink-0" />}
                {/* Text content */}
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-200 truncate">{deadline.eventName}</p>
                    {doc && <button onClick={() => onViewDocument(doc)} className="text-sm text-accent hover:underline block text-left truncate w-full">{deadline.docName}</button>}
                </div>
                {/* Date */}
                <p className="font-medium text-gray-300 text-sm flex-shrink-0">{new Date(deadline.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                {/* Actions */}
                <div className="w-[60px] flex-shrink-0 flex justify-end">
                    {deadline.isManual && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-gray-600 text-gray-400"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(deadline.id)} className="p-1.5 rounded-md hover:bg-red-900/40 text-gray-400 hover:text-red-400"><XIcon className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};

const DeadlineModal: React.FC<{ documents: StoredDocument[], deadline: ManualDeadline | null, onClose: () => void, onSave: (d: any) => void }> =
({ documents, deadline, onClose, onSave }) => {
    const [eventName, setEventName] = useState(deadline?.eventName || '');
    const [date, setDate] = useState(deadline?.date || '');
    const [docId, setDocId] = useState(deadline?.docId || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { eventName, date, docId: docId || undefined };
        onSave(deadline ? { ...data, id: deadline.id } : data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-secondary-dark rounded-xl shadow-2xl w-full max-w-md border border-border-dark" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border-dark">
                        <h3 className="text-lg font-semibold text-gray-100">{deadline ? 'Edit Deadline' : 'Add New Deadline'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="eventName" className="block text-sm font-medium text-gray-300 mb-1">Event Name</label>
                            <input type="text" id="eventName" value={eventName} onChange={e => setEventName(e.target.value)} required className="w-full p-2 bg-primary-dark border border-border-dark rounded-lg focus:ring-2 focus:ring-accent" />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 bg-primary-dark border border-border-dark rounded-lg focus:ring-2 focus:ring-accent" />
                        </div>
                        <div>
                            <label htmlFor="docId" className="block text-sm font-medium text-gray-300 mb-1">Link to Document (Optional)</label>
                            <select id="docId" value={docId} onChange={e => setDocId(e.target.value)} className="w-full p-2 bg-primary-dark border border-border-dark rounded-lg focus:ring-2 focus:ring-accent">
                                <option value="">None</option>
                                {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-primary-dark flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Deadline</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};