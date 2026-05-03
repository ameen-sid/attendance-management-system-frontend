import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	AreaChart,
	Area,
} from "recharts";
import { getDashboardStats, getRecentActivity } from "../services/attendance.service";
import type { DashboardStats, RecentActivity } from "../types";
import {
	Activity,
	CheckCircle2,
	TrendingUp,
	Map as MapIcon,
	RefreshCw,
	Users,
	UserCheck,
	UserMinus,
	Clock,
	ArrowUpRight,
	MapPin,
} from "lucide-react";

const Dashboard = () => {

	const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentLogs, setRecentLogs] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

	const fetchDashboardData = async () => {

		setLoading(true);
		try {
			const [statsRes, logsRes] = await Promise.all([
				getDashboardStats(),
				getRecentActivity(),
			]);
			setStats(statsRes.data);
			setRecentLogs(logsRes.data);
		} catch (error) {
			console.error("Failed to fetch dashboard data", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	if (loading) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-500 pb-20">
			{/* 1. HEADER */}
			<div className="flex justify-between items-end">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						Dashboard Overview
					</h1>
					<p className="text-gray-500 mt-1">
						Real-time team analytics and performance snapshots.
					</p>
				</div>
				<button
					onClick={fetchDashboardData}
					className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors bg-white border border-gray-100 shadow-sm"
					title="Refresh Data">
					<RefreshCw size={20} />
				</button>
			</div>

			{/* 2. ANALYTICS CARDS */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<AnalyticsCard
					label="Total Strength"
					value={stats?.totalEmployees || 0}
					icon={<Users />}
					trend="Registered Users"
					color="indigo"
				/>
				<AnalyticsCard
					label="Active Today"
					value={stats?.presentToday || 0}
					icon={<UserCheck />}
					trend="Checked In"
					color="emerald"
				/>
				<AnalyticsCard
					label="Late Arrivals"
					value={stats?.lateArrivals || 0}
					icon={<Clock />}
					trend="After 10:00 AM"
					color="amber"
				/>
				<AnalyticsCard
					label="Absent / Leave"
					value={stats?.onLeave || 0}
					icon={<UserMinus />}
					trend="Not Active Today"
					color="rose"
				/>
			</div>

			{/* 3. VISUALIZATIONS ROW 1: Attendance & Intensity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Attendance Trend Chart */}
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
					<div className="flex justify-between items-center mb-6">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<TrendingUp
									size={16}
									className="text-indigo-600"
								/>
								<h3 className="font-bold text-gray-900 tracking-tight">
									Attendance Trend
								</h3>
							</div>
							<p className="text-xs text-gray-500 font-medium">
								Daily participation (Present vs Late)
							</p>
						</div>
					</div>
					<div className="flex-1 w-full relative">
						<div className="absolute inset-0">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={stats?.trend || []}>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#F3F4F6"
									/>
									<XAxis
										dataKey="name"
										axisLine={false}
										tickLine={false}
										tick={{
											fontSize: 10,
											fontWeight: 700,
											fill: "#9CA3AF",
										}}
										dy={10}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{
											fontSize: 10,
											fontWeight: 700,
											fill: "#9CA3AF",
										}}
									/>
									<Tooltip
										cursor={{ fill: "#F9FAFB" }}
										contentStyle={{
											borderRadius: "12px",
											border: "none",
											boxShadow:
												"0 10px 15px -3px rgba(0,0,0,0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
									/>
									<Bar
										dataKey="present"
										name="Present"
										fill="#4F46E5"
										radius={[4, 4, 0, 0]}
										barSize={24}
									/>
									<Bar
										dataKey="late"
										name="Late"
										fill="#FB923C"
										radius={[4, 4, 0, 0]}
										barSize={24}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Productivity Intensity Chart */}
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
					<div className="flex justify-between items-center mb-6">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<Activity
									size={16}
									className="text-emerald-600"
								/>
								<h3 className="font-bold text-gray-900 tracking-tight">
									Workload Intensity
								</h3>
							</div>
							<p className="text-xs text-gray-500 font-medium">
								Average working hours per day
							</p>
						</div>
					</div>
					<div className="flex-1 w-full relative">
						<div className="absolute inset-0">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={stats?.trend || []}>
									<defs>
										<linearGradient
											id="colorHrs"
											x1="0"
											y1="0"
											x2="0"
											y2="1">
											<stop
												offset="5%"
												stopColor="#10B981"
												stopOpacity={0.1}
											/>
											<stop
												offset="95%"
												stopColor="#10B981"
												stopOpacity={0}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#F3F4F6"
									/>
									<XAxis
										dataKey="name"
										axisLine={false}
										tickLine={false}
										tick={{
											fontSize: 10,
											fontWeight: 700,
											fill: "#9CA3AF",
										}}
										dy={10}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{
											fontSize: 10,
											fontWeight: 700,
											fill: "#9CA3AF",
										}}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: "12px",
											border: "none",
											boxShadow:
												"0 10px 15px -3px rgba(0,0,0,0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
									/>
									<Area
										type="monotone"
										dataKey="avgHours"
										name="Avg Hours"
										stroke="#10B981"
										strokeWidth={3}
										fillOpacity={1}
										fill="url(#colorHrs)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			</div>

			{/* 4. VISUALIZATIONS ROW 2: Distribution & Task Status */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Workload Distribution */}
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
					<div className="flex justify-between items-center mb-6">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<MapIcon
									size={16}
									className="text-indigo-600"
								/>
								<h3 className="font-bold text-gray-900 tracking-tight">
									Client Workload Share
								</h3>
							</div>
							<p className="text-xs text-gray-500 font-medium">
								Manpower distribution across sites
							</p>
						</div>
					</div>
					<div className="flex-1 w-full relative">
						<div className="absolute inset-0">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={stats?.clientStats || []}
									layout="vertical">
									<CartesianGrid
										strokeDasharray="3 3"
										horizontal={false}
										stroke="#F3F4F6"
									/>
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										axisLine={false}
										tickLine={false}
										tick={{
											fontSize: 10,
											fontWeight: 700,
											fill: "#6B7280",
										}}
										width={110}
									/>
									<Tooltip
										cursor={{ fill: "#F9FAFB" }}
										contentStyle={{
											borderRadius: "12px",
											border: "none",
											boxShadow:
												"0 10px 15px -3px rgba(0,0,0,0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
									/>
									<Bar
										dataKey="value"
										name="Assigned Crew"
										fill="#6366F1"
										radius={[0, 4, 4, 0]}
										barSize={20}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Task Completion Donut */}
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
					<div className="mb-4">
						<div className="flex items-center gap-2 mb-1">
							<CheckCircle2
								size={16}
								className="text-emerald-600"
							/>
							<h3 className="font-bold text-gray-900 tracking-tight">
								Global Compliance
							</h3>
						</div>
						<p className="text-xs text-gray-500 font-medium">
							Task completion rate across all sites
						</p>
					</div>

					<div className="flex-1 relative flex flex-col items-center justify-center">
						<div className="h-[200px] w-full relative">
							<div className="absolute inset-0">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={[
												{
													name: "Completed",
													value:
														stats?.taskStats
															?.completed || 0,
												},
												{
													name: "Pending",
													value:
														stats?.taskStats
															?.pending || 0,
												},
											]}
											innerRadius={65}
											outerRadius={85}
											paddingAngle={8}
											dataKey="value">
											<Cell fill="#10B981" />
											<Cell fill="#F1F5F9" />
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
							<p className="text-3xl font-black text-gray-900">
								{stats?.taskStats && stats.taskStats.total > 0
									? Math.round(
											(stats.taskStats.completed /
												stats.taskStats.total) *
												100,
										)
									: 0}
								%
							</p>
							<p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-1">
								Completion
							</p>
						</div>
					</div>

					<div className="pt-6 space-y-3">
						<div className="flex justify-between items-center text-sm">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-emerald-500" />
								<span className="text-gray-500 font-medium">
									Fully Completed
								</span>
							</div>
							<span className="font-bold text-gray-900">
								{stats?.taskStats?.completed || 0}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-gray-200" />
								<span className="text-gray-500 font-medium">
									Remaining/In-Progress
								</span>
							</div>
							<span className="font-bold text-gray-900">
								{stats?.taskStats?.pending || 0}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* 5. RECENT ACTIVITY FEED */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="p-6 border-b border-gray-100 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Activity size={18} className="text-indigo-600" />
						<h3 className="font-bold text-gray-800">
							Timeline Activity
						</h3>
					</div>
					<button
						onClick={() => navigate("/attendance")}
						className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
						Full Logs
					</button>
				</div>

				<div className="divide-y divide-gray-50">
					{recentLogs.length === 0 ? (
						<div className="p-8 text-center text-gray-500 text-sm">
							No activity recorded for today.
						</div>
					) : (
						recentLogs.map((log) => (
							<div
								key={log.id}
								className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
								<div className="flex items-center gap-4">
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center ${
											log.type === "CLOCK_IN"
												? "bg-emerald-50 text-emerald-600"
												: "bg-orange-50 text-orange-600"
										}`}>
										{log.type === "CLOCK_IN" ? (
											<ArrowUpRight size={20} />
										) : (
											<Clock size={20} />
										)}
									</div>
									<div>
										<p className="text-sm font-bold text-gray-900">
											{log.name}
										</p>
										<p className="text-xs text-gray-500 flex items-center gap-1">
											<MapPin
												size={12}
												className="text-gray-400"
											/>{" "}
											{log.location}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-bold text-gray-900">
										{log.time}
									</p>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
										{log.type.replace("_", " ")}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

interface AnalyticsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactElement<{ size?: number }>;
    trend: string;
    color: 'indigo' | 'emerald' | 'amber' | 'rose';
}

// Helper Component
const AnalyticsCard = ({ label, value, icon, trend, color }: AnalyticsCardProps) => {
	const colors: Record<string, string> = {
		indigo: "bg-indigo-50 text-indigo-600",
		emerald: "bg-emerald-50 text-emerald-600",
		amber: "bg-amber-50 text-amber-600",
		rose: "bg-rose-50 text-rose-600",
	};

	return (
		<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
			<div className="flex justify-between items-start mb-4">
				<div className={`p-3 rounded-xl ${colors[color]}`}>
					{React.cloneElement(icon, { size: 24 })}
				</div>
			</div>
			<div>
				<p className="text-3xl font-black text-gray-900">{value}</p>
				<p className="text-sm font-bold text-gray-500 mt-1">{label}</p>
				<div className="flex items-center gap-1 mt-4 text-[11px] font-bold uppercase">
					<span
						className={
							color === "rose" || color === "amber"
								? "text-amber-500"
								: "text-emerald-500"
						}>
						{trend}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;