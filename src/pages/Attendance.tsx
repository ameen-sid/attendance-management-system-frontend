import { useState, useEffect, useCallback } from "react";
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Search,
	MapPin,
	Clock,
	ArrowRight,
	Loader2,
} from "lucide-react";
import { format, subDays, addDays, isSameDay } from "date-fns";
import { getDailyAttendance } from "../services/attendance.service";
import type { Attendance as AttendanceRecord } from "../types";

const Attendance = () => {

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [searchTerm, setSearchTerm] = useState("");
	const [logs, setLogs] = useState<AttendanceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	// Pagination State
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const handlePrevDay = () => setSelectedDate((curr) => subDays(curr, 1));
	const handleNextDay = () => setSelectedDate((curr) => addDays(curr, 1));
	const isToday = isSameDay(selectedDate, new Date());

	const fetchLogs = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getDailyAttendance(selectedDate);
			setLogs(response.data || []);
		} catch (error) {
			console.error("Failed to fetch logs", error);
		} finally {
			setLoading(false);
		}
	}, [selectedDate]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	// Client-side filtering & pagination
	const filteredLogs = logs.filter((log) => {
		const userName = typeof log.user === 'string' ? log.user : log.user?.fullname || "";
		return userName.toLowerCase().includes(searchTerm.toLowerCase());
	});

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedDate]);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

	// Status Rendering Logic
	const renderStatus = (log: AttendanceRecord) => {

		const badges = [];
		// Logic based on backend response structure
		if (log.status === "Present") {
			badges.push(<AttendanceBadge key="present" status="Present" />);
		} else if (log.status === "Working") {
			badges.push(<AttendanceBadge key="working" status="Working" />);
		} else {
			badges.push(<AttendanceBadge key="absent" status="Absent" />);
		}

		if (log.isLate) {
			badges.push(<AttendanceBadge key="late" status="Late" />);
		}
		return <div className="flex flex-wrap justify-end gap-2">{badges}</div>;
	};

	return (
		<div className="space-y-8">
			{/* HEADER */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						Attendance Logs
					</h1>
					<p className="text-gray-500 mt-1">
						Monitor daily check-ins and working hours.
					</p>
				</div>

				<div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm p-1">
					<button
						onClick={handlePrevDay}
						className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
						<ChevronLeft size={20} />
					</button>
					<div className="flex items-center gap-2 px-4 py-1 min-w-[180px] justify-center font-medium text-gray-700">
						<Calendar size={18} className="text-indigo-600" />
						<span>{format(selectedDate, "EEE, dd MMM yyyy")}</span>
					</div>
					<button
						onClick={handleNextDay}
						disabled={isToday}
						className={`p-2 rounded-lg transition-colors ${isToday ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"}`}>
						<ChevronRight size={20} />
					</button>
				</div>
			</div>

			{/* STATS CARDS - Placeholder for now as Backend Daily API doesn't return aggregate stats yet */}
			{/*
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Employees" value="50" color="bg-indigo-50 text-indigo-700" />
					<StatCard label="Present Today" value="42" color="bg-emerald-50 text-emerald-700" />
					<StatCard label="Late Arrivals" value="3" color="bg-amber-50 text-amber-700" />
					<StatCard label="Absent" value="5" color="bg-rose-50 text-rose-700" />
				</div>
			*/}

			{/* SEARCH */}
			<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
				<div className="relative w-full">
					{loading ? (
						<Loader2
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin"
							size={18}
						/>
					) : (
						<Search
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
							size={18}
						/>
					)}
					<input
						type="text"
						placeholder="Search employee..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 text-sm"
					/>
				</div>
			</div>

			{/* TABLE */}
			<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse min-w-[800px]">
						<thead>
							<tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
								<th className="p-5">Employee</th>
								<th className="p-5">Check In</th>
								<th className="p-5">Check Out</th>
								<th className="p-5">Location</th>
								<th className="p-5 text-right font-medium"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{!loading && currentLogs.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="p-8 text-center text-gray-500 text-sm">
										No logs found for this date.
									</td>
								</tr>
							) : (
								currentLogs.map((log) => (
									<tr key={log.id} className="group">
										<td colSpan={5} className="p-0">
											<div
												onClick={() =>
													setExpandedId(
														expandedId === log.id
															? null
															: log.id,
													)
												}
												className={`flex items-center w-full hover:bg-gray-50/80 transition-colors cursor-pointer ${expandedId === log.id ? "bg-indigo-50/30" : ""}`}>
												<div className="p-5 flex-[2] flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-600 border border-indigo-200">
														{(typeof log.user === 'string' ? log.user : log.user?.fullname || "?").charAt(0)}
													</div>
													<div>
														<p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
														{typeof log.user === 'string' ? log.user : log.user?.fullname}
														</p>
														<div className="flex flex-col">
															<p className="text-xs text-gray-500">
																{log.role}
															</p>
															{(log.clients && log.clients.length > 0) ? (
																<p className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-tight max-w-[180px] whitespace-normal leading-tight">
																	Work: {log.clients.join(", ")}
																</p>
															) : (log.plannedClient && log.plannedClient !== "--") && (
																<p className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-tight max-w-[180px] whitespace-normal leading-tight">
																	Meeting: {typeof log.plannedClient === 'string' ? log.plannedClient : log.plannedClient?.name || "--"}
																</p>
															)}
														</div>
													</div>
												</div>

												<div className="p-5 flex-1">
													<div className="flex items-center gap-2">
														<Clock
															size={14}
															className="text-indigo-500"
														/>
														<span className="text-sm font-medium text-gray-700">
															{log.clockIn}
														</span>
													</div>
												</div>

												<div className="p-5 flex-1">
													<div className="flex items-center gap-2">
														<ArrowRight
															size={14}
															className="text-orange-500"
														/>
														<span className="text-sm font-medium text-gray-700">
															{log.clockOut}
														</span>
													</div>
												</div>

												<div className="p-5 flex-1 overflow-hidden">
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<MapPin
															size={14}
															className="text-gray-400 shrink-0"
														/>
														<span
															className="truncate"
															title={
																log.location
															}>
															{log.location}
														</span>
													</div>
												</div>

												<div className="p-5 flex-1 text-right flex items-center justify-end gap-4">
													{renderStatus(log)}
													<ChevronRight
														size={18}
														className={`text-gray-300 transition-transform duration-200 ${expandedId === log.id ? "rotate-90 text-indigo-500" : ""}`}
													/>
												</div>
											</div>

											{/* Expanded Section */}
											{expandedId === log.id && (
												<div className="px-5 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-100/50 bg-indigo-50/10">
													<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/50 rounded-2xl p-6 border border-indigo-100/50">
														{/* PDCA / Task Checklist Section */}
														<div className="col-span-1 lg:col-span-2 space-y-6">
															<div className="flex items-center gap-2 pb-3 border-b border-indigo-100">
																<div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
																<h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
																	Task
																	Checklist &
																	Report
																</h4>
															</div>

															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																{log.attendanceTasks &&
																log
																	.attendanceTasks
																	.length >
																	0 ? (
																	log.attendanceTasks.map(
																		(
																			task,
																		) => (
																			<div
																				key={
																					task.id
																				}
																				className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
																				<div className="flex items-center justify-between gap-3">
																					<div className="flex-1">
																						<p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight mb-0.5">
																							{task.client}
																						</p>
																						<p className="text-sm font-bold text-gray-800">
																							{task.title}
																						</p>
																					</div>
																					<span
																						className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
																							task.isCompleted
																								? "bg-emerald-50 text-emerald-600 border-emerald-100"
																								: "bg-amber-50 text-amber-600 border-amber-100"
																						}`}>
																						{task.isCompleted
																							? "✓ Done"
																							: "⏳ Pending"}
																					</span>
																				</div>
																				{task.remarks && (
																					<div className="mt-1 pt-2 border-t border-gray-200/50">
																						<p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
																							Remarks
																						</p>
																						<p className="text-xs text-gray-600 italic leading-relaxed">
																							"
																							{
																								task.remarks
																							}
																							"
																						</p>
																					</div>
																				)}
																			</div>
																		),
																	)
																) : (
																	<div className="col-span-2 py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
																		<p className="text-xs text-gray-400 font-medium italic">
																			Legacy
																			log:{" "}
																			{log.reportTasksDone ||
																				"No detailed tasks recorded"}
																		</p>
																	</div>
																)}
															</div>

														</div>
													</div>
												</div>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* PAGINATION CONTROLS */}
				{totalPages > 1 && (
					<div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
						<p className="text-sm text-gray-500">
							Showing{" "}
							<span className="font-semibold text-gray-900">
								{indexOfFirstItem + 1}
							</span>{" "}
							to{" "}
							<span className="font-semibold text-gray-900">
								{Math.min(indexOfLastItem, filteredLogs.length)}
							</span>{" "}
							of{" "}
							<span className="font-semibold text-gray-900">
								{filteredLogs.length}
							</span>{" "}
							employees
						</p>
						<div className="flex gap-2">
							<button
								onClick={() =>
									setCurrentPage((p) => Math.max(1, p - 1))
								}
								disabled={currentPage === 1}
								className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
								<ChevronLeft size={18} />
							</button>
							<button
								onClick={() =>
									setCurrentPage((p) =>
										Math.min(totalPages, p + 1),
									)
								}
								disabled={currentPage === totalPages}
								className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">
								<ChevronRight size={18} />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};



const AttendanceBadge = ({ status }: { status: string }) => {

	const styles = {
		Present: "bg-emerald-100 text-emerald-700 border-emerald-200",
		Working: "bg-blue-100 text-blue-700 border-blue-200",
		Late: "bg-amber-100 text-amber-700 border-amber-200",
		Absent: "bg-gray-100 text-gray-600 border-gray-200",
		"On Leave": "bg-purple-100 text-purple-700 border-purple-200",
	};
	const currentStyle = styles[status as keyof typeof styles] || styles.Absent;
	return (
		<span
			className={`px-3 py-1 rounded-full text-[10px] font-bold border ${currentStyle} uppercase tracking-tight`}>
			{status}
		</span>
	);
};

export default Attendance;