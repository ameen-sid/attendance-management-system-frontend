import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ErrorModal from "../components/ErrorModal";

const Login = () => {

	const navigate = useNavigate();
	const { login } = useAuth();

	const [formData, setFormData] = useState({ username: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showErrorModal, setShowErrorModal] = useState(false);

	// Automatically show modal when error is set
	useEffect(() => {
		if (error) {
			setShowErrorModal(true);
		}
	}, [error]);

	const handleLogin = async (e: React.FormEvent) => {

		e.preventDefault();
		e.stopPropagation();

		setLoading(true);
		setError("");
		setShowErrorModal(false);

		try {
			await login(formData);
			navigate("/");
		} catch (err) {
			console.error("Login error:", err);
			let errorMessage = "Invalid credentials. Please try again.";
			if (axios.isAxiosError(err)) {
				errorMessage = err.response?.data?.message || errorMessage;
			}
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ErrorModal
				isOpen={showErrorModal}
				onClose={() => {
					setShowErrorModal(false);
					setError("");
				}}
				title="Login Failed"
				message={error}
			/>

			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-100">
					<div className="flex flex-col items-center mb-8">
						<img
							src="/logo.png"
							alt="Sarvagya"
							className="h-32 object-contain mb-4"
						/>
						<p className="text-gray-500">
							Sign in to manage your workforce
						</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Username
							</label>
							<div className="relative">
								<User
									className="absolute left-3 top-3 text-gray-400"
									size={20}
								/>
								<input
									type="text"
									value={formData.username}
									onChange={(e) =>
										setFormData({
											...formData,
											username: e.target.value,
										})
									}
									className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
									placeholder="Enter your username"
									required
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<Lock
									className="absolute left-3 top-3 text-gray-400"
									size={20}
								/>
								<input
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={(e) =>
										setFormData({
											...formData,
											password: e.target.value,
										})
									}
									className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600 transition-colors"
									tabIndex={-1}>
									{showPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
							{loading ? (
								<>
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									Signing In...
								</>
							) : (
								"Sign In"
							)}
						</button>
					</form>
				</div>
			</div>
		</>
	);
};

export default Login;