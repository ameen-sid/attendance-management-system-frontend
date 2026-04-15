import React, { useState } from "react";
import { Save, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "../services/auth.service";
import axios from "axios";

const Settings = () => {

	const [loading, setLoading] = useState(false);
	const [showPasswords, setShowPasswords] = useState(false);

	// Direct password fields
	const [passwords, setPasswords] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleUpdatePassword = async (e: React.FormEvent) => {

        e.preventDefault();
		if (passwords.newPassword !== passwords.confirmPassword) {
			alert("New passwords do not match!");
			return;
		}

		setLoading(true);
		try {

			await updatePassword(passwords);
			alert("Password updated successfully!");
			setPasswords({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error: unknown) {

			let message = "Failed to update password";
			if (axios.isAxiosError(error)) {
				message = error.response?.data?.message || message;
			}
			alert(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
			{/* HEADER */}
			<div className="flex justify-between items-center border-b border-gray-100 pb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						Security Settings
					</h1>
					<p className="text-gray-500 mt-1 text-sm">
						Update your administrative password to keep the system
						secure.
					</p>
				</div>
			</div>

			{/* PASSWORD UPDATE CARD */}
			<div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
							<ShieldCheck size={20} />
						</div>
						<h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
							Change Password
						</h2>
					</div>

					<button
						type="button"
						onClick={() => setShowPasswords(!showPasswords)}
						className="text-gray-400 hover:text-indigo-600 transition-colors"
						title={
							showPasswords ? "Hide Passwords" : "Show Passwords"
						}>
						{showPasswords ? (
							<EyeOff size={20} />
						) : (
							<Eye size={20} />
						)}
					</button>
				</div>

				<form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
					<div className="space-y-5">
						<PasswordField
							label="Current Password"
							value={passwords.currentPassword}
							show={showPasswords}
							onChange={(v: string) =>
								setPasswords({
									...passwords,
									currentPassword: v,
								})
							}
						/>

						<hr className="border-gray-50" />

						<PasswordField
							label="New Password"
							value={passwords.newPassword}
							show={showPasswords}
							onChange={(v: string) =>
								setPasswords({ ...passwords, newPassword: v })
							}
						/>

						<PasswordField
							label="Confirm New Password"
							value={passwords.confirmPassword}
							show={showPasswords}
							onChange={(v: string) =>
								setPasswords({
									...passwords,
									confirmPassword: v,
								})
							}
						/>
					</div>

					<div className="pt-4">
						<button
							type="submit"
							disabled={loading || !passwords.newPassword}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2">
							{loading ? (
								<div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									<Save size={18} />
									<span>Update Password</span>
								</>
							)}
						</button>
					</div>
				</form>
			</div>

			{/* LOGOUT HINT */}
			<div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start">
				<div className="text-amber-600 mt-0.5">
					<Lock size={18} />
				</div>
				<p className="text-xs text-amber-800 leading-relaxed font-medium">
					Note: Changing your password will require you to log back in
					on all devices to verify your identity.
				</p>
			</div>
		</div>
	);
};

interface PasswordFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	show: boolean;
}

// Sub-component for clean code
const PasswordField = ({ label, value, onChange, show }: PasswordFieldProps) => (
	<div className="space-y-2">
		<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
			{label}
		</label>
		<div className="relative group">
			<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
				<Lock size={18} />
			</div>
			<input
				type={show ? "text" : "password"}
				required
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					onChange(e.target.value)
				}
				className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
				placeholder="••••••••"
			/>
		</div>
	</div>
);

export default Settings;