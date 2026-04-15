import React, { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";

import type { CalendarEvent } from "../types";

interface EventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (eventData: Partial<CalendarEvent>) => void;
	onDelete?: (id: number) => void;
	initialData?: Partial<CalendarEvent> | null;
}

const EVENT_TYPES = [
	{ label: "Meeting", value: "Meeting", color: "#4F46E5" }, // Indigo 600
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
}) => {
	const [formData, setFormData] = useState(() => {
		if (initialData) {
			return {
				title: initialData.title || "",
				description: initialData.description || "",
				start: initialData.start
					? format(new Date(initialData.start), "yyyy-MM-dd'T'HH:mm")
					: "",
				end: initialData.end
					? format(new Date(initialData.end), "yyyy-MM-dd'T'HH:mm")
					: "",
				type: initialData.type || "Meeting",
				allDay: initialData.allDay || false,
			};
		}
		return {
			title: "",
			description: "",
			start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
			end: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
			type: "Meeting",
			allDay: false,
		};
	});

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();
		const typeObj = EVENT_TYPES.find((t) => t.value === formData.type);
		onSave({
			...formData,
			start: new Date(formData.start).toISOString(),
			end: new Date(formData.end).toISOString(),
			color: typeObj?.color,
		});
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
				<div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
					<h3 className="text-lg font-bold text-gray-900">
						{initialData?.id ? "Edit Event" : "Schedule Event"}
					</h3>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
							Event Title
						</label>
						<input
							type="text"
							required
							value={formData.title}
							onChange={(e) =>
								setFormData({
									...formData,
									title: e.target.value,
								})
							}
							className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
							placeholder="What's happening?"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
								Start Time
							</label>
							<input
								type="datetime-local"
								required
								value={formData.start}
								onChange={(e) =>
									setFormData({
										...formData,
										start: e.target.value,
									})
								}
								className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
								End Time
							</label>
							<input
								type="datetime-local"
								required
								value={formData.end}
								onChange={(e) =>
									setFormData({
										...formData,
										end: e.target.value,
									})
								}
								className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
							Event Type
						</label>
						<div className="grid grid-cols-2 gap-2">
							{EVENT_TYPES.map((type) => (
								<button
									key={type.value}
									type="button"
									onClick={() =>
										setFormData({
											...formData,
											type: type.value,
										})
									}
									className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-xs font-bold ${
										formData.type === type.value
											? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200"
											: "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
									}`}>
									<div
										className="w-2 h-2 rounded-full"
										style={{ backgroundColor: type.color }}
									/>
									{type.label}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
							Description
						</label>
						<textarea
							value={formData.description}
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
							className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium min-h-[100px]"
							placeholder="Add some details..."
						/>
					</div>

					<div className="flex items-center gap-3 pt-2">
						<button
							type="submit"
							className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
							{initialData?.id ? "Update Event" : "Save Event"}
						</button>
						{initialData?.id && onDelete && (
							<button
								type="button"
								onClick={() => onDelete(Number(initialData.id))}
								className="bg-rose-50 text-rose-600 px-4 py-3.5 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all">
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