import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
	ArrowLeft,
	Calendar,
	Clock,
	MapPin,
	AlertCircle,
	CheckCircle,
	ArrowRight,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import {
	format,
	eachDayOfInterval,
	startOfMonth,
	endOfMonth,
	isWeekend,
	getMonth,
	getYear,
} from "date-fns";
import { getEmployeeHistory } from "../services/attendance.service";
import type { Attendance, EmployeeHistoryResponse } from "../types";
import * as XLSX from "xlsx";

const EmployeeAttendance = () => {

	const { employeeId } = useParams();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	// Initialize with query params if available
	const initialMonth = () => {
		const m = searchParams.get("month");
		const y = searchParams.get("year");
		if (m && y) {
			return new Date(parseInt(y), parseInt(m) - 1, 1);
		}
		return new Date();
	};

	const [currentMonth, setCurrentMonth] = useState(initialMonth); // State for selected month
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<EmployeeHistoryResponse | null>(null);

	const fetchHistory = useCallback(async () => {
		if (!employeeId) return;
		setLoading(true);
		try {
			const month = getMonth(currentMonth) + 1; // 1-indexed for backend
			const year = getYear(currentMonth);
			const response = await getEmployeeHistory(employeeId, month, year);
			setData(response.data);
		} catch (error) {
			console.error("Failed to fetch history", error);
		} finally {
			setLoading(false);
		}
	}, [employeeId, currentMonth]);
 
	useEffect(() => {
		fetchHistory();
	}, [fetchHistory]);

	const handlePrevMonth = () => {
		const prev = new Date(currentMonth);
		prev.setMonth(prev.getMonth() - 1);
		setCurrentMonth(prev);
	};

	const handleNextMonth = () => {
		const next = new Date(currentMonth);
		next.setMonth(next.getMonth() + 1);
		setCurrentMonth(next);
	};

	const handleExportExcel = () => {

		if (!data || !data.logs || data.logs.length === 0) return;
		const exportData = logs.map((log: Attendance) => ({
			Date: format(new Date(log.date), "dd MMM yyyy (EEE)"),
			Status: log.status || "Absent",
			"Check In": log.clockIn || "--",
			"Check Out": log.clockOut || "--",
			"Total Hours": log.totalHrs || "0.00",
			"Required Hours": log.requiredHrs || REQUIRED_HOURS,
			"Is Late": log.isLate ? "YES" : "NO",
			Client: (log.clients && log.clients.length > 0) ? log.clients.join(", ") : (typeof log.plannedClient === 'string' ? log.plannedClient : log.plannedClient?.name || "--"),
			Location: log.location || "--",
		}));

		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

		// Auto-size columns
		const colWidths = [
			{ wch: 20 }, // Date
			{ wch: 10 }, // Status
			{ wch: 12 }, // In
			{ wch: 12 }, // Out
			{ wch: 12 }, // Total Hrs
			{ wch: 15 }, // Req Hrs
			{ wch: 10 }, // Is Late
			{ wch: 40 }, // Client
			{ wch: 25 }, // Location
		];
		ws["!cols"] = colWidths;

		XLSX.writeFile(
			wb,
			`Attendance_${employee.fullname.replace(/\s+/g, "_")}_${format(currentMonth, "MMM_yyyy")}.xlsx`,
		);
	};

	if (loading) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!data)
		return (
			<div className="p-8 text-center">
				Employee not found or error loading data.
			</div>
		);

	const { employee, logs } = data;
	const today = new Date();
	const isCurrentMonth =
		getMonth(currentMonth) === getMonth(today) &&
		getYear(currentMonth) === getYear(today);
	const endDate = isCurrentMonth ? today : endOfMonth(currentMonth);
	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endDate,
	}).reverse();

	// Create a Map for easy lookup by date string
	const logsMap = new Map<string, Attendance>();
	logs.forEach((log: Attendance) => {
		logsMap.set(log.date, log);
	});
	const REQUIRED_HOURS = employee.shift_hours || 9;

	// Calculators
	const presentCount = logs.filter((l: Attendance) => l.status === "Present").length;
	const lateCount = logs.filter((l: Attendance) => l.isLate).length;

	// Calculate average hours (only for days with valid totalHrs)
	const validHoursLogs = logs.filter(
		(l: Attendance) => l.totalHrs && !isNaN(parseFloat(l.totalHrs)),
	);
	const totalHours = validHoursLogs.reduce(
		(sum: number, l: Attendance) => sum + parseFloat(l.totalHrs || "0"),
		0,
	);
	const avgHours =
		validHoursLogs.length > 0
			? (totalHours / validHoursLogs.length).toFixed(2)
			: "0";

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* 1. HEADER & NAVIGATION */}
			<div>
				<button
					onClick={() => navigate("/employees")}
					className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium group">
					<ArrowLeft
						size={18}
						className="group-hover:-translate-x-1 transition-transform"
					/>
					Back to Employees
				</button>

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-100">
							{employee.fullname.charAt(0)}
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
								{employee.fullname}
							</h1>
							<p className="text-gray-500 font-medium">
								{employee.role} •{" "}
								<span className="text-indigo-600">
									ID: #{employeeId}
								</span>
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-1">
							<button
								onClick={handlePrevMonth}
								className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
								<ChevronLeft size={18} />
							</button>
							<div className="px-4 py-1 flex items-center gap-2 text-sm font-bold text-gray-700 min-w-[140px] justify-center">
								<Calendar
									size={18}
									className="text-indigo-600"
								/>
								{format(currentMonth, "MMMM yyyy")}
							</div>
							<button
								onClick={handleNextMonth}
								disabled={
									format(currentMonth, "MM-yyyy") ===
									format(new Date(), "MM-yyyy")
								}
								className={`p-2 rounded-lg transition-colors ${format(currentMonth, "MM-yyyy") === format(new Date(), "MM-yyyy") ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100 text-gray-500"}`}>
								<ChevronRight size={18} />
							</button>
						</div>

						<button
							onClick={handleExportExcel}
							className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95">
							<ArrowRight
								size={18}
								className="rotate-[-90deg] translate-y-[1px]"
							/>
							Export Excel
						</button>
					</div>
				</div>
			</div>

			{/* 2. MONTHLY SUMMARY STATS */}
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<SummaryCard
					icon={<CheckCircle />}
					label="Days Present"
					value={presentCount}
					color="text-emerald-600 bg-emerald-50"
				/>
				<SummaryCard
					icon={<Clock />}
					label="Late Arrivals"
					value={lateCount}
					color="text-amber-600 bg-amber-50"
				/>
				{/* Note: Absent count is tricky without checking every past weekday, simplifying for now */}
				<SummaryCard
					icon={<AlertCircle />}
					label="Days Logged"
					value={logs.length}
					color="text-blue-600 bg-blue-50"
				/>
				<SummaryCard
					icon={<Clock />}
					label="Avg. Daily Hrs"
					value={`${avgHours}h`}
					color="text-indigo-600 bg-indigo-50"
				/>
			</div>

			{/* 3. DETAILED LOGS TABLE */}
			<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
				<div className="p-5 border-b border-gray-200 bg-gray-50/30">
					<h3 className="font-bold text-gray-800">
						Monthly Timecard
					</h3>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse min-w-[900px]">
						<thead>
							<tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
								<th className="p-4">Date</th>
								<th className="p-4">Status</th>
								<th className="p-4">Check In</th>
								<th className="p-4">Check Out</th>
								<th className="p-4">Work Hours</th>
								<th className="p-4">Client</th>
								<th className="p-4">Location</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{daysInMonth.map((date) => {
								const dateStr = format(date, "yyyy-MM-dd");
								const log = logsMap.get(dateStr);
								const isWeekendDay = isWeekend(date);

								// If future date, skip or show empty? Let's show empty rows for past/today, nothing for future?
								// For simplicity, showing all days in month.

								// If no log found
								const checkIn = log ? log.clockIn : "--";
								const checkOut = log ? log.clockOut : "--";
								const status = log
									? log.status
									: isWeekendDay
										? "Weekend"
										: "Absent";
								const location = log ? log.location : "--";
								const actualHrs = log
									? parseFloat(log.totalHrs || "0")
									: 0;

								return (
									<tr
										key={date.toString()}
										className="hover:bg-gray-50/50 transition-colors">
										<td className="p-4 font-bold text-gray-900 text-sm">
											{format(date, "dd MMM, EEE")}
										</td>
										<td className="p-4">
											<AttendanceBadge
												status={status}
												isLate={log?.isLate}
											/>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
												{checkIn !== "--" && (
													<Clock
														size={14}
														className="text-indigo-400"
													/>
												)}
												{checkIn}
											</div>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
												{checkOut !== "--" && (
													<ArrowRight
														size={14}
														className="text-orange-400"
													/>
												)}
												{checkOut}
											</div>
										</td>
										<td className="p-4">
											{log ? (
												<div className="flex flex-col">
													<span
														className={`text-sm font-bold ${actualHrs < REQUIRED_HOURS ? "text-amber-600" : "text-gray-900"}`}>
														{actualHrs}h /{" "}
														{REQUIRED_HOURS}h
													</span>
												</div>
											) : (
												<span className="text-gray-300">
													-
												</span>
											)}
										</td>
										<td className="p-4">
											<span className="text-xs font-bold text-gray-700 max-w-[200px] inline-block whitespace-normal leading-relaxed">
												{(log?.clients && log.clients.length > 0) 
													? log.clients.join(", ") 
													: (typeof log?.plannedClient === 'string' ? log.plannedClient : log?.plannedClient?.name || "--")}
											</span>
										</td>
										<td className="p-4">
											{location !== "--" && (
												<div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
													<MapPin
														size={14}
														className="text-gray-300"
													/>
													{location}
												</div>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

interface SummaryCardProps {
	icon: React.ReactElement<{ size?: number }>;
	label: string;
	value: string | number;
	color: string;
}

const SummaryCard = ({ icon, label, value, color }: SummaryCardProps) => (
	<div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-colors">
		<div className={`p-3 rounded-xl ${color}`}>
			{React.cloneElement(icon, { size: 24 })}
		</div>
		<div>
			<p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
				{label}
			</p>
			<p className="text-xl font-black text-gray-900">{value}</p>
		</div>
	</div>
);

const AttendanceBadge = ({
	status,
	isLate,
}: {
	status: string;
	isLate?: boolean;
}) => {
	const styles: Record<string, string> = {
		Present: "bg-emerald-50 text-emerald-700 border-emerald-100",
		Working: "bg-blue-50 text-blue-700 border-blue-100",
		Late: "bg-amber-50 text-amber-700 border-amber-100",
		Absent: "bg-rose-50 text-rose-700 border-rose-100",
		Weekend: "bg-gray-50 text-gray-400 border-gray-100",
	};

	return (
		<div className="flex gap-1">
			<span
				className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[status] || styles.Absent} uppercase tracking-tighter`}>
				{status}
			</span>
			{isLate && (
				<span
					className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles.Late} uppercase tracking-tighter`}>
					Late
				</span>
			)}
		</div>
	);
};

export default EmployeeAttendance;