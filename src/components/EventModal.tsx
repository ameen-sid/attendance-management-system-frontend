import React, { useState, useEffect } from "react";
import { X, UserPlus, Building2, UserCog, Tag } from "lucide-react";
import { format } from "date-fns";

import type { CalendarEvent, User, Client } from "../types";

interface EventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (eventData: Partial<CalendarEvent>) => void;
	onDelete?: (id: number) => void;
	initialData?: Partial<CalendarEvent> | null;
	employees?: User[];
	clients?: Client[];
}

const EVENT_TYPES = [
	{ label: "Online Meeting", value: "Online Meeting", color: "#4F46E5" }, // Indigo 600
	{ label: "Client Visit", value: "Client Visit", color: "#10B981" }, // Emerald 500
	{ label: "Internal Task", value: "Internal Task", color: "#F59E0B" }, // Amber 500
	{ label: "Other", value: "Other", color: "#6B7280" }, // Gray 500
];

const EventModal: React.FC<EventModalProps> = ({
	isOpen,
	onClose,
	onSave,
	onDelete,
	initialData,
	employees = [],
	clients = [],
}) => {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
		end: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
		type: "Online Meeting",
		allDay: false,
		clientId: "" as string | number,
		participantIds: [] as number[],
		managers: "",
	});

	useEffect(() => {
		if (isOpen) {
			const startStr = initialData?.start 
				? (initialData.start.includes('T') ? initialData.start : `${initialData.start}T09:00`)
				: format(new Date(), "yyyy-MM-dd'T'HH:mm");
				
			const endStr = initialData?.end
				? (initialData.end.includes('T') ? initialData.end : `${initialData.end}T10:00`)
				: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm");

			setFormData({
				title: initialData?.title || "",
				description: initialData?.description || "",
				start: format(new Date(startStr), "yyyy-MM-dd'T'HH:mm"),
				end: format(new Date(endStr), "yyyy-MM-dd'T'HH:mm"),
				type: initialData?.type || "Online Meeting",
				allDay: initialData?.allDay ?? false, // Default to false even if calendar says true
				clientId: initialData?.clientId || "",
				participantIds: Array.isArray(initialData?.participants) 
					? initialData.participants.map(p => typeof p === 'object' ? p.id : p) 
					: [],
				managers: initialData?.managers || "",
			});
		}
	}, [initialData, isOpen]);

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const typeObj = EVENT_TYPES.find((t) => t.value === formData.type);
		onSave({
			...formData,
			clientId: formData.clientId ? Number(formData.clientId) : null,
			start: new Date(formData.start).toISOString(),
			end: new Date(formData.end).toISOString(),
			color: typeObj?.color,
		});
	};

	const toggleParticipant = (id: number) => {
		setFormData(prev => ({
			...prev,
			participantIds: prev.participantIds.includes(id)
				? prev.participantIds.filter(pid => pid !== id)
				: [...prev.participantIds, id]
		}));
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10 shrink-0">
					<div>
						<h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
							{initialData?.id ? "Edit Event" : "Schedule Event"}
						</h3>
						<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
							Organization Timeline
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2.5 hover:bg-gray-200 rounded-2xl transition-all text-gray-400 hover:text-gray-900">
						<X size={20} />
					</button>
				</div>

				{/* Scrollable Form */}
				<form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-6 custom-scrollbar">
					{/* Title */}
					<div className="space-y-2">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
							<Tag size={12} className="text-indigo-400" /> Event Title
						</label>
						<input
							type="text"
							required
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold"
							placeholder="Project Sync, Client Demo..."
						/>
					</div>

					{/* Client Selection */}
					<div className="space-y-2">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
							<Building2 size={12} className="text-emerald-400" /> Assign to Client
						</label>
						<select
							value={formData.clientId}
							onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
							className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold bg-white appearance-none cursor-pointer">
							<option value="">No Specific Client (Internal)</option>
							{clients.map(client => (
								<option key={client.id} value={client.id}>{client.name}</option>
							))}
						</select>
					</div>

					{/* Timing */}
					<div className="space-y-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
						<div className="flex items-center justify-between px-1">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
								Date & Time
							</label>
							<label className="flex items-center gap-2 cursor-pointer group">
								<span className="text-[10px] font-bold text-gray-500 group-hover:text-indigo-600 transition-colors">All Day Event</span>
								<div className="relative inline-flex items-center cursor-pointer">
									<input 
										type="checkbox" 
										checked={formData.allDay} 
										onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
										className="sr-only peer" 
									/>
									<div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
								</div>
							</label>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-[10px] font-bold text-gray-400 uppercase px-1">Start</label>
								<input
									type={formData.allDay ? "date" : "datetime-local"}
									required
									value={formData.allDay ? formData.start.split('T')[0] : formData.start}
									onChange={(e) => setFormData({ ...formData, start: formData.allDay ? `${e.target.value}T00:00` : e.target.value })}
									className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold bg-white"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-[10px] font-bold text-gray-400 uppercase px-1">End</label>
								<input
									type={formData.allDay ? "date" : "datetime-local"}
									required
									value={formData.allDay ? formData.end.split('T')[0] : formData.end}
									onChange={(e) => setFormData({ ...formData, end: formData.allDay ? `${e.target.value}T23:59` : e.target.value })}
									className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold bg-white"
								/>
							</div>
						</div>
					</div>

					{/* Event Type */}
					<div className="space-y-2">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Event Type</label>
						<div className="grid grid-cols-2 gap-3">
							{EVENT_TYPES.map((type) => (
								<button
									key={type.value}
									type="button"
									onClick={() => setFormData({ ...formData, type: type.value })}
									className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border transition-all text-xs font-black ${
										formData.type === type.value
											? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]"
											: "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
									}`}>
									<div className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: type.color }} />
									{type.label}
								</button>
							))}
						</div>
					</div>

					{/* Participants Selection */}
					<div className="space-y-2">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
							<UserPlus size={12} className="text-blue-400" /> Participants (Select Multiple)
						</label>
						<div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-h-[150px] overflow-y-auto">
							{employees.map(emp => (
								<button
									key={emp.id}
									type="button"
									onClick={() => toggleParticipant(emp.id)}
									className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
										formData.participantIds.includes(emp.id)
											? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-100"
											: "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
									}`}>
									{emp.fullname}
								</button>
							))}
						</div>
					</div>

					{/* Managers / Project Leaders */}
					<div className="space-y-2">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
							<UserCog size={12} className="text-amber-400" /> Managers / Leaders
						</label>
						<input
							type="text"
							value={formData.managers}
							onChange={(e) => setFormData({ ...formData, managers: e.target.value })}
							className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold"
							placeholder="Enter manager names (e.g. John Doe, Jane Smith)"
						/>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meeting Agenda / Notes</label>
						<textarea
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold min-h-[100px]"
							placeholder="What are the key points to discuss?"
						/>
					</div>

					{/* Action Buttons - Sticky at bottom */}
					<div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-white pb-2 shrink-0">
						<button
							type="submit"
							className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
							{initialData?.id ? "Update Event" : "Save Event"}
						</button>
						{initialData?.id && onDelete && (
							<button
								type="button"
								onClick={() => onDelete(Number(initialData.id))}
								className="bg-rose-50 text-rose-600 px-8 py-4 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all active:scale-95">
								Delete
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default EventModal;