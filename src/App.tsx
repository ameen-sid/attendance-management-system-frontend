import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import Clients from "./pages/Clients";
import ClientAttendance from "./pages/ClientAttendance";
import Clauses from "./pages/Clauses";
import Settings from "./pages/Settings";
import Schedule from "./pages/Schedule";
import { useAuth } from "./context/AuthContext";

function App() {

	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">Loading...</div>
		);
	}

	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route
				path="/"
				element={
					isAuthenticated ? (
						<DashboardLayout />
					) : (
						<Navigate to="/login" />
					)
				}>
				<Route index element={<Dashboard />} />
				<Route path="employees" element={<Employees />} />
				<Route path="attendance" element={<Attendance />} />
				<Route
					path="attendance/:employeeId"
					element={<EmployeeAttendance />}
				/>
				<Route path="clients" element={<Clients />} />
				<Route
					path="clients/:clientId"
					element={<ClientAttendance />}
				/>
				<Route path="clauses" element={<Clauses />} />
				<Route path="settings" element={<Settings />} />
				<Route path="schedule" element={<Schedule />} />
			</Route>
		</Routes>
	);
}

export default App;