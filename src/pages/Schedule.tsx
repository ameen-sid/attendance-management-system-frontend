import { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction";
import { Plus, Loader2 } from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../services/event.service";
import { employeeService } from "../services/employee.service";
import { clientService } from "../services/client.service";
import { useAuth } from "../context/AuthContext";
import type { CalendarEvent } from "../types";
import EventModal from "../components/EventModal";

const Schedule = () => {

    const { user } = useAuth();
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] =
		useState<Partial<CalendarEvent> | null>(null);
	const calendarRef = useRef<FullCalendar>(null);
	const [allEmployees, setAllEmployees] = useState<any[]>([]);
	const [allClients, setAllClients] = useState<any[]>([]);

	const fetchEvents = useCallback(async () => {

		setLoading(true);
		try {
			const response = await getEvents();
			// FullCalendar expects 'id' as string usually or just keeps it as is
			const formatted = response.data.map((e: CalendarEvent) => ({
				...e,
				id: String(e.id),
			}));
			setEvents(formatted);
		} catch (error) {
			console.error("Failed to fetch events", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const loadData = async () => {
			try {
				await fetchEvents();
				
				const [empRes, clientRes] = await Promise.all([
					employeeService.getAll(1, "", 100),
					clientService.getAll(1, "", 100)
				]);

				console.log("Employees fetched:", empRes);
				console.log("Clients fetched:", clientRes);

				if (empRes.success) {
					setAllEmployees(empRes.data.employees || []);
				}
				if (clientRes.success) {
					setAllClients(clientRes.data.clients || []);
				}
			} catch (err) {
				console.error("Failed to load schedule metadata:", err);
			}
		};

		loadData();
	}, [fetchEvents]);

	const handleSelect = (arg: DateSelectArg) => {

		setSelectedEvent({
			start: arg.startStr,
			end: arg.endStr,
			allDay: arg.allDay,
		});
		setModalOpen(true);
	};

	const handleDateClick = (arg: DateClickArg) => {
	
		setSelectedEvent({
			start: arg.dateStr,
			end: arg.dateStr,
			allDay: arg.allDay,
		});
		setModalOpen(true);
	};

	const handleEventClick = (arg: EventClickArg) => {

		const props = arg.event.extendedProps;
		setSelectedEvent({
			id: arg.event.id,
			title: arg.event.title,
			description: props["description"] || "",
			start: arg.event.start?.toISOString() || "",
			end: arg.event.end?.toISOString() || "",
			allDay: arg.event.allDay,
			type: props["type"] || "",
			color: arg.event.backgroundColor,
			clientId: props["clientId"],
			participants: props["participants"],
			managers: props["managers"],
		});
		setModalOpen(true);
	};

	const handleEventDrop = async (arg: EventDropArg) => {
		try {
			await updateEvent(Number(arg.event.id), {
				start: arg.event.start?.toISOString() || "",
				end: arg.event.end?.toISOString() || "",
				allDay: arg.event.allDay,
			});
		} catch (error) {
			arg.revert();
			console.error("Failed to update event position", error);
		}
	};

	const handleEventResize = async (arg: EventResizeDoneArg) => {
		try {
			await updateEvent(Number(arg.event.id), {
				start: arg.event.start?.toISOString() || "",
				end: arg.event.end?.toISOString() || "",
				allDay: arg.event.allDay,
			});
		} catch (error) {
			arg.revert();
			console.error("Failed to update event duration", error);
		}
	};

	const handleSaveEvent = async (data: Partial<CalendarEvent>) => {

		try {
			const eventId = selectedEvent?.id;
			if (eventId) {
				await updateEvent(Number(eventId), data);
			} else {
				if (user) {
					await createEvent({ ...data, userId: user.id });
				}
			}
			setModalOpen(false);
			fetchEvents();
		} catch (error) {
			console.error("Error saving event", error);
		}
	};

	const handleDeleteEvent = async (id: number) => {
		if (!window.confirm("Are you sure you want to delete this event?"))
			return;
		try {
			await deleteEvent(id);
			setModalOpen(false);
			fetchEvents();
		} catch (error) {
			console.error("Error deleting event", error);
		}
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* HEADER */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						Organization Schedule
					</h1>
					<p className="text-gray-500 mt-1">
						Manage meetings, visits, and team tasks effectively.
					</p>
				</div>

				<button
					onClick={() => {
						setSelectedEvent(null);
						setModalOpen(true);
					}}
					className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
					<Plus size={18} />
					<span>SCHEDULE EVENT</span>
				</button>
			</div>

			{/* CALENDAR CONTAINER */}
			<div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-4 md:p-6 lg:p-8">
				{loading && (
					<div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
						<Loader2
							className="text-indigo-600 animate-spin"
							size={40}
						/>
					</div>
				)}

				<div className="calendar-wrapper">
					<FullCalendar
						ref={calendarRef}
						plugins={[
							dayGridPlugin,
							timeGridPlugin,
							interactionPlugin,
						]}
						initialView="dayGridMonth"
						headerToolbar={{
							left: "prev,next today",
							center: "title",
							right: "dayGridMonth,timeGridWeek,timeGridDay",
						}}
						events={events as unknown as EventInput[]}
						editable={true}
						selectable={true}
						selectMirror={true}
						dayMaxEvents={true}
						weekends={true}
						dateClick={handleDateClick}
						select={handleSelect}
						eventClick={handleEventClick}
						eventDrop={handleEventDrop}
						eventResize={handleEventResize}
						height="auto"
						eventTimeFormat={{
							hour: "2-digit",
							minute: "2-digit",
							meridiem: "short",
						}}
					/>
				</div>
			</div>

			<style>{`
        .fc {
          --fc-button-bg-color: transparent;
          --fc-button-border-color: #E5E7EB;
          --fc-button-hover-bg-color: #F9FAFB;
          --fc-button-hover-border-color: #D1D5DB;
          --fc-button-active-bg-color: #F3F4F6;
          --fc-button-active-border-color: #D1D5DB;
          --fc-button-text-color: #374151;
          --fc-border-color: #F3F4F6;
          --fc-today-bg-color: #EEF2FF;
          font-family: inherit;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.025em;
        }
        .fc .fc-button {
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          transition: all 0.2s;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active, 
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #4F46E5 !important;
          border-color: #4F46E5 !important;
          color: white !important;
        }
        .fc .fc-event {
          border-radius: 6px;
          border: none;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          cursor: pointer;
        }
        .fc th {
          padding: 12px 0 !important;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9CA3AF;
          border: none !important;
        }
        .fc-daygrid-day-number {
          font-size: 0.85rem;
          font-weight: 600;
          color: #4B5563;
          padding: 8px !important;
        }
        .fc-col-header-cell {
          background-color: #F9FAFB;
        }
      `}</style>

			<EventModal
				key={modalOpen ? (selectedEvent?.id || "new") : "closed"}
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				onSave={handleSaveEvent}
				onDelete={handleDeleteEvent}
				initialData={selectedEvent}
				employees={allEmployees}
				clients={allClients}
			/>
		</div>
	);
};

export default Schedule;