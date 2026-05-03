import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
	ArrowLeft,
	Calendar,
	Briefcase,
	FileText,
	ChevronLeft,
	ChevronRight,
	ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { getClientHistory } from "../services/attendance.service";
import type { Attendance, ClientHistoryResponse } from "../types";
import * as XLSX from "xlsx";

const ClientAttendance = () => {

	const { clientId } = useParams();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const initialMonth = () => {
		const m = searchParams.get("month");
		const y = searchParams.get("year");
		if (m && y) {
			return new Date(parseInt(y), parseInt(m) - 1, 1);
		}
		return new Date();
	};

	const [currentMonth, setCurrentMonth] = useState(initialMonth);
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<ClientHistoryResponse | null>(null);

	const fetchHistory = useCallback(async () => {
		if (!clientId) return;
		setLoading(true);
		try {
			const month = currentMonth.getMonth() + 1;
			const year = currentMonth.getFullYear();
			const response = await getClientHistory(clientId, month, year);
			setData(response.data);
		} catch (error) {
			console.error("Failed to fetch client history", error);
		} finally {
			setLoading(false);
		}
	}, [clientId, currentMonth]);

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

	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const handleExportExcel = async (mode: "MONTH" | "OVERALL") => {

		setIsExportModalOpen(false);
		setIsExporting(true);
		try {
			let logsToExport = [];
			let filename = "";

			if (mode === "MONTH") {
				logsToExport = data ? data.logs : [];
				filename = `Report_${data ? data.client.name.replace(/\s+/g, "_") : "Client"}_${format(currentMonth, "MMM_yyyy")}.xlsx`;
			} else {
				// Fetch Overall
				const response = await getClientHistory(clientId!); // Omit month/year for 'Overall'
				logsToExport = response.data.logs || [];
				filename = `Overall_Report_${data ? data.client.name.replace(/\s+/g, "_") : "Client"}_${format(new Date(), "dd_MMM_yyyy")}.xlsx`;
			}

			if (!logsToExport || logsToExport.length === 0) {
				alert("No data found to export.");
				return;
			}

			const exportData = logsToExport.map((log: Attendance) => ({
				Date: format(new Date(log.date), "dd MMM yyyy"),
				Employee: log.employeeName || "Unknown",
				Role: log.employeeRole || "--",
				"Check In": log.clockIn,
				"Check Out": log.clockOut,
				"Hours Worked": log.totalHrs,
				Status: log.status || "Present",
				Tasks: log.taskCount || 0,
				"Tasks Done": log.reportTasksDone || "--",
				Location: log.location,
			}));

			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Client Attendance Report");

			ws["!cols"] = [
				{ wch: 15 }, // Date
				{ wch: 20 }, // Employee
				{ wch: 15 }, // Role
				{ wch: 12 }, // In
				{ wch: 12 }, // Out
				{ wch: 12 }, // Hours
				{ wch: 10 }, // Status
				{ wch: 10 }, // Tasks
				{ wch: 40 }, // Tasks Done
				{ wch: 25 }, // Location
			];

			XLSX.writeFile(wb, filename);
		} catch (e) {
			console.error(e);
			alert("Export failed.");
		} finally {
			setIsExporting(false);
		}
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
			<div className="p-8 text-center text-gray-500">
				Client not found or error loading data.
			</div>
		);
	const { client, logs } = data;

	return (
		<div className="space-y-8 animate-in fade-in duration-500 relative">
			{/* EXPORT MODE MODAL */}
			{isExportModalOpen && (
				<div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
					<div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-6">
						<div className="text-center">
							<div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<FileText size={32} />
							</div>
							<h3 className="text-xl font-bold text-gray-900">
								Export Report
							</h3>
							<p className="text-sm text-gray-500 mt-2">
								Which data would you like to export to Excel?
							</p>
						</div>

						<div className="space-y-3">
							<button
								onClick={() => handleExportExcel("MONTH")}
								className="w-full p-4 border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all flex flex-col items-start gap-1 group">
								<span className="font-bold text-gray-900">
									Selected Month
								</span>
								<span className="text-xs text-gray-500">
									{format(currentMonth, "MMMM yyyy")} records
									only
								</span>
							</button>

							<button
								onClick={() => handleExportExcel("OVERALL")}
								className="w-full p-4 border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all flex flex-col items-start gap-1 group">
								<span className="font-bold text-gray-900">
									Overall Report
								</span>
								<span className="text-xs text-gray-500">
									Full platform history for this client
								</span>
							</button>
						</div>

						<button
							onClick={() => setIsExportModalOpen(false)}
							className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
							Close
						</button>
					</div>
				</div>
			)}

			{/* 1. HEADER */}
			<div>
				<button
					onClick={() => navigate("/clients")}
					className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium group">
					<ArrowLeft
						size={18}
						className="group-hover:-translate-x-1 transition-transform"
					/>
					Back to Client List
				</button>

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-100">
							<Briefcase size={32} />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
								{client.name}
							</h1>
							<p className="text-gray-500 font-medium">
								Monthly Attendance Summary
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
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
							onClick={() => setIsExportModalOpen(true)}
							disabled={isExporting}
							className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
							<FileText size={18} />
							{isExporting ? "Exporting..." : "Export Report"}
						</button>
					</div>
				</div>
			</div>

			{/* 2. STATS OVERVIEW */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
						Total Tasks
					</p>
					<p className="text-3xl font-black text-gray-900">
						{data.totalTasks}
					</p>
				</div>
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
						Unique Developers
					</p>
					<p className="text-3xl font-black text-gray-900">
						{new Set(logs.map((l: Attendance) => l.employeeName || "Unknown")).size}
					</p>
				</div>
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
						Total Effort
					</p>
					<p className="text-3xl font-black text-indigo-600">
						{logs
							.reduce(
								(sum: number, l: Attendance) =>
									sum + parseFloat(l.totalHrs || "0"),
								0,
							)
							.toFixed(1)}
						h
					</p>
				</div>
			</div>

			{/* 3. LOGS TABLE */}
			<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
				<div className="p-6 border-b border-gray-100">
					<h3 className="font-bold text-gray-800 tracking-tight">
						Deployment Logs
					</h3>
				</div>

				{logs.length === 0 ? (
					<div className="p-12 text-center text-gray-400">
						<FileText
							size={48}
							className="mx-auto mb-4 opacity-10"
						/>
						<p>
							No activity recorded for this client in{" "}
							{format(currentMonth, "MMMM yyyy")}.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse min-w-[900px]">
							<thead>
								<tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
									<th className="p-5">Date</th>
									<th className="p-5">Employee</th>
									<th className="p-5">Check In/Out</th>
									<th className="p-5">Duration</th>
									<th className="p-5">Tasks</th>
									<th className="p-5">Task Summary</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{logs.map((log: Attendance) => (
									<tr
										key={log.id}
										className="hover:bg-gray-50/50 transition-colors">
										<td className="p-5 font-bold text-gray-900 text-sm">
											{format(
												new Date(log.date),
												"dd MMM, yyyy",
											)}
										</td>
										<td className="p-5">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
													{log.employeeName?.charAt(0) || "?"}
												</div>
												<div>
													<p className="text-sm font-bold text-gray-900">
														{log.employeeName || "Unknown"}
													</p>
													<p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">
														{log.employeeRole || "--"}
													</p>
												</div>
											</div>
										</td>
										<td className="p-5">
											<div className="flex items-center gap-4 text-xs font-bold">
												<div className="flex flex-col">
													<span className="text-gray-400 uppercase text-[9px] mb-0.5">
														IN
													</span>
													<span className="text-gray-700">
														{log.clockIn}
													</span>
												</div>
												<ArrowRight
													size={12}
													className="text-gray-300"
												/>
												<div className="flex flex-col">
													<span className="text-gray-400 uppercase text-[9px] mb-0.5">
														OUT
													</span>
													<span className="text-gray-700">
														{log.clockOut}
													</span>
												</div>
											</div>
										</td>
										<td className="p-5">
											<span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">
												{log.totalHrs} hrs
											</span>
										</td>
										<td className="p-5">
											<span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
												{log.taskCount || 0} tasks
											</span>
										</td>
										<td className="p-5 max-w-sm">
											<p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
												{log.reportTasksDone !== "--"
													? log.reportTasksDone
													: log.plannedTasks}
											</p>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClientAttendance;