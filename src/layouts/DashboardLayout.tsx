import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	CalendarClock,
	LogOut,
	ChevronRight,
	ChevronLeft,
	Menu,
	X,
	Settings,
	Briefcase,
	LayoutList,
	Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {

    const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	const closeMobileSidebar = () => setIsMobileOpen(false);

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const userInitials = user?.fullname
		? user.fullname
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
				.substring(0, 2)
		: "U";

	return (
		<div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
			{/* MOBILE OVERLAY */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			{/* SIDEBAR */}
			<aside
				className={`bg-white border-r border-gray-200 flex flex-col fixed lg:static h-full z-40 transition-all duration-300 ease-in-out 
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isCollapsed ? "lg:w-20" : "lg:w-64"}
                `}>
				{/* 1. BRAND LOGO & TOGGLE */}
				<div
					className={`h-16 flex items-center border-b border-gray-100 transition-all duration-300 ${
						isCollapsed
							? "justify-center px-0"
							: "justify-between px-5"
					}`}>
					<div className="flex items-center gap-2.5 overflow-hidden">
						<div
							className={`flex items-center justify-center shrink-0 ${isCollapsed ? "w-10 h-10" : "w-8 h-8"}`}>
							<img
								src="/logo-icon.png"
								alt="Logo Icon"
								className="w-full h-full object-contain"
							/>
						</div>
						{!isCollapsed && (
							<span className="font-bold text-sm tracking-tight text-gray-900 whitespace-nowrap">
								Sarvagya
							</span>
						)}
					</div>

					{/* Desktop Collapse Button */}
					{!isCollapsed && (
						<button
							onClick={() => setIsCollapsed(true)}
							className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
							<ChevronLeft size={18} />
						</button>
					)}

					{/* Mobile Close Button */}
					<button
						className="lg:hidden p-2 text-gray-500"
						onClick={() => setIsMobileOpen(false)}>
						<X size={20} />
					</button>
				</div>

				{/* 2. NAVIGATION LINKS */}
				<nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
					{!isCollapsed && (
						<p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 transition-opacity">
							Main Menu
						</p>
					)}

					<NavItem
						to="/"
						icon={<LayoutDashboard size={20} />}
						label="Dashboard"
						collapsed={isCollapsed}
						onClick={closeMobileSidebar}
					/>
					<NavItem
						to="/employees"
						icon={<Users size={20} />}
						label="Employees"
						collapsed={isCollapsed}
						onClick={closeMobileSidebar}
					/>
					<NavItem
						to="/clients"
						icon={<Briefcase size={20} />}
						label="Clients"
						collapsed={isCollapsed}
						onClick={closeMobileSidebar}
					/>
					<NavItem
						to="/tasks"
						icon={<LayoutList size={20} />}
						label="Tasks"
						collapsed={isCollapsed}
						onClick={closeMobileSidebar}
					/>
					<NavItem
						to="/schedule"
						icon={<Calendar size={20} />}
						label="Schedule"
						collapsed={isCollapsed}
						onClick={closeMobileSidebar}
					/>
					<NavItem
						to="/attendance"
						icon={<CalendarClock size={20} />}
						label="Attendance Logs"
						collapsed={isCollapsed}
						onClick={closeMobileSidebar}
					/>

					<div className="pt-6">
						{!isCollapsed && (
							<p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 transition-opacity">
								System
							</p>
						)}
						<NavItem
							to="/settings"
							icon={<Settings size={20} />}
							label="Settings"
							collapsed={isCollapsed}
							onClick={closeMobileSidebar}
						/>
					</div>
				</nav>

				{/* 3. USER PROFILE FOOTER */}
				<div className="p-3 border-t border-gray-100 bg-gray-50/50">
					{!isCollapsed ? (
						<div className="animate-in fade-in duration-300">
							<div className="flex items-center gap-3 mb-4 px-2">
								<div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shrink-0 text-sm">
									{userInitials}
								</div>
								<div className="flex-1 min-w-0">
									<p
										className="text-sm font-semibold text-gray-900 truncate"
										title={user?.fullname || "User"}>
										{user?.fullname || "User"}
									</p>
									<p
										className="text-[11px] text-gray-500 truncate"
										title={
											user?.username
												? `@${user.username}`
												: ""
										}>
										{user?.username
											? `@${user.username}`
											: ""}
									</p>
								</div>
							</div>

							<button
								onClick={handleLogout}
								className="flex items-center justify-center gap-2 text-red-600 bg-white border border-gray-200 p-2 rounded-xl hover:bg-red-50 hover:border-red-100 w-full transition-all text-xs font-bold">
								<LogOut size={14} />
								<span>SIGN OUT</span>
							</button>
						</div>
					) : (
						<div className="flex flex-col gap-4 items-center py-2">
							<div
								className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200"
								title={user?.fullname}>
								{userInitials}
							</div>
							<button
								onClick={handleLogout}
								className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
								title="Sign Out">
								<LogOut size={20} />
							</button>
						</div>
					)}
				</div>

				{/* Desktop Expand Button (Visible when collapsed) */}
				{isCollapsed && (
					<button
						onClick={() => setIsCollapsed(false)}
						className="hidden lg:flex absolute -right-3 top-8 bg-white border border-gray-200 p-1 rounded-full shadow-sm text-gray-500 hover:text-indigo-600">
						<ChevronRight size={14} />
					</button>
				)}
			</aside>

			{/* MAIN CONTENT AREA */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* MOBILE TOPBAR */}
				<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:hidden shrink-0">
					<div className="flex items-center gap-2">
						<img
							src="/logo-icon.png"
							alt="Logo"
							className="w-8 h-8 object-contain"
						/>
						<span className="font-bold text-sm text-gray-900">
							Sarvagya
						</span>
					</div>
					<button
						onClick={() => setIsMobileOpen(true)}
						className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
						<Menu size={24} />
					</button>
				</header>

				{/* PAGE CONTENT */}
				<main className="flex-1 overflow-y-auto p-4 md:p-8">
					<div className="max-w-7xl mx-auto">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

interface NavItemProps {
	to: string;
	icon: React.ReactNode;
	label: string;
	collapsed: boolean;
	onClick?: () => void;
}

const NavItem = ({ to, icon, label, collapsed, onClick }: NavItemProps) => (
	<NavLink
		to={to}
		onClick={onClick}
		className={({ isActive }) =>
			`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
				isActive
					? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100"
					: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
			} ${collapsed ? "justify-center" : "justify-between"}`
		}>
		<div className="flex items-center gap-3">
			<span className="shrink-0">{icon}</span>
			<span
				className={`whitespace-nowrap transition-all duration-300 ${
					collapsed
						? "w-0 opacity-0 hidden"
						: "w-auto opacity-100 block text-sm"
				}`}>
				{label}
			</span>
		</div>
		{!collapsed && (
			<ChevronRight
				size={14}
				className="opacity-0 group-[.active]:opacity-100 transition-opacity text-indigo-300"
			/>
		)}
	</NavLink>
);

export default DashboardLayout;