import React, { useState, useEffect, useCallback } from "react";
import {
	Plus,
	Search,
	Edit2,
	Trash2,
	X,
	ChevronRight,
	ChevronDown,
	LayoutList,
} from "lucide-react";
import { taskService } from "../services/task.service";
import type { Task, TaskCategory } from "../types";
import Modal from "../components/Modal";

const Tasks = () => {

	// Data State
	const [categories, setCategories] = useState<TaskCategory[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

	// Modal State
	const [modalMode, setModalMode] = useState<"CATEGORY" | "TASK">("CATEGORY");
	const [editMode, setEditMode] = useState<"ADD" | "EDIT">("ADD");
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	// Form State
	const [categoryForm, setCategoryForm] = useState({ name: "", order: 0 });
	const [taskForm, setTaskForm] = useState({
		title: "",
		order: 0,
		categoryId: 0,
	});

	const fetchAll = useCallback(async () => {
		setLoading(true);
		try {
			const resp = await taskService.getCategories();
			if (resp.success) {
				setCategories(resp.data);
				// Expand all by default initially
				if (expandedCategories.length === 0) {
					setExpandedCategories(resp.data.map((c: TaskCategory) => c.id));
				}
			}
		} catch (error) {
			console.error("Fetch failed", error);
		} finally {
			setLoading(false);
		}
	}, [expandedCategories.length]);

	useEffect(() => {
		fetchAll();
	}, [fetchAll]);

	// --- ACTIONS ---
	const toggleCategory = (id: number) => {
		setExpandedCategories((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
		);
	};

	const handleOpenCategory = (cat: TaskCategory | null = null) => {

		setModalMode("CATEGORY");
		if (cat) {
			setEditMode("EDIT");
			setSelectedCategory(cat);
			setCategoryForm({ name: cat.name, order: cat.order });
		} else {
			setEditMode("ADD");
			setCategoryForm({ name: "", order: categories.length + 1 });
		}
		setIsOpen(true);
	};

	const handleOpenTask = (catId: number, task: Task | null = null) => {

		setModalMode("TASK");
		if (task) {
			setEditMode("EDIT");
			setSelectedTask(task);
			setTaskForm({
				title: task.title,
				order: task.order,
				categoryId: catId,
			});
		} else {
			setEditMode("ADD");
			// Find max order in this category
			const cat = categories.find((c) => c.id === catId);
			const nextOrder = (cat?.tasks?.length || 0) + 1;
			setTaskForm({ title: "", order: nextOrder, categoryId: catId });
		}
		setIsOpen(true);
	};

	const handleDeleteCategory = async (id: number) => {

		if (window.confirm("Delete category and all its tasks?")) {
			await taskService.deleteCategory(id);
			fetchAll();
		}
	};

	const handleDeleteTask = async (id: number) => {

		if (window.confirm("Delete this task?")) {
			await taskService.deleteTask(id);
			fetchAll();
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {

		e.preventDefault();
		try {
			if (modalMode === "CATEGORY") {
				if (editMode === "ADD")
					await taskService.createCategory(categoryForm);
				else {
					if (selectedCategory) {
						await taskService.updateCategory(
							selectedCategory.id,
							categoryForm,
						);
					}
				}
			} else {
				if (editMode === "ADD")
					await taskService.createTask(taskForm);
				else {
					if (selectedTask) {
						await taskService.updateTask(
							selectedTask.id,
							taskForm,
						);
					}
				}
			}
			setIsOpen(false);
			fetchAll();
		} catch {
			alert("Operation failed");
		}
	};

	// Filter categories based on search
	const filteredCategories = categories.filter(
		(cat) =>
			cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cat.tasks?.some((cl: Task) =>
				cl.title.toLowerCase().includes(searchTerm.toLowerCase()),
			) || false,
	);

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* HEADER */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 tracking-tight">
						Tasks Management
					</h1>
					<p className="text-gray-500 mt-1 text-sm font-medium">
						Define hierarchical tasks and categories.
					</p>
				</div>
				<button
					onClick={() => handleOpenCategory()}
					className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 active:scale-95 transition-all">
					<Plus size={18} />
					<span>Add Category</span>
				</button>
			</div>

			{/* SEARCH BAR */}
			<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
				<div className="relative w-full">
					<Search
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<input
						type="text"
						placeholder="Search categories or tasks..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 text-sm"
					/>
				</div>
			</div>

			{/* LIST */}
			<div className="space-y-4">
				{loading ? (
					<div className="text-center py-12 text-gray-400 font-medium">
						Loading schema...
					</div>
				) : filteredCategories.length > 0 ? (
					filteredCategories.map((cat) => (
						<div
							key={cat.id}
							className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
							{/* Category Row */}
							<div
								className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
								onClick={() => toggleCategory(cat.id)}>
								<div className="flex items-center gap-4">
									<div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
										{expandedCategories.includes(cat.id) ? (
											<ChevronDown size={20} />
										) : (
											<ChevronRight size={20} />
										)}
									</div>
									<div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm">
										{cat.order}
									</div>
									<div>
										<h3 className="font-bold text-gray-900">
											{cat.name}
										</h3>
										<p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
											{cat.tasks?.length || 0} Tasks
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleOpenTask(cat.id);
										}}
										className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold">
										<Plus size={14} /> Add Task
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleOpenCategory(cat);
										}}
										className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
										<Edit2 size={16} />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteCategory(cat.id);
										}}
										className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
										<Trash2 size={16} />
									</button>
								</div>
							</div>

							{/* Tasks List */}
							{expandedCategories.includes(cat.id) && (
								<div className="border-t border-gray-100 divide-y divide-gray-50 bg-white">
									{cat.tasks && cat.tasks.length > 0 ? (
										cat.tasks.map((task: Task) => (
											<div
												key={task.id}
												className="flex items-center justify-between p-4 pl-16 hover:bg-gray-50/50 transition-colors group/task">
												<div className="flex items-center gap-4 flex-1">
													<span className="text-xs font-bold text-gray-400 w-8">
														{task.order}
													</span>
													<span className="text-sm font-medium text-gray-700">
														{task.title}
													</span>
												</div>
												<div className="flex items-center gap-2 opacity-0 group-hover/task:opacity-100 transition-opacity">
													<button
														onClick={() =>
															handleOpenTask(
																cat.id,
																task,
															)
														}
														className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
														<Edit2 size={14} />
													</button>
													<button
														onClick={() =>
															handleDeleteTask(
																task.id,
															)
														}
														className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
														<Trash2 size={14} />
													</button>
												</div>
											</div>
										))
									) : (
										<div className="p-8 text-center text-gray-400 text-xs italic">
											No tasks added yet.
										</div>
									)}
								</div>
							)}
						</div>
					))
				) : (
					<div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
						<LayoutList
							className="mx-auto text-gray-300 mb-4"
							size={48}
						/>
						<p className="text-gray-500 font-medium">
							No results found for your search.
						</p>
					</div>
				)}
			</div>

			{/* MODAL */}
			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
					<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 rounded-t-2xl">
						<h2 className="text-lg font-bold text-gray-900">
							{editMode === "ADD" ? "Add" : "Edit"}{" "}
							{modalMode === "CATEGORY" ? "Category" : "Task"}
						</h2>
						<button
							onClick={() => setIsOpen(false)}
							className="text-gray-400 hover:text-gray-600">
							<X size={20} />
						</button>
					</div>

					<div className="p-6">
						<form onSubmit={handleSubmit} className="space-y-5">
							{modalMode === "CATEGORY" ? (
								<>
									<div>
										<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
											Category Name
										</label>
										<input
											type="text"
											required
											value={categoryForm.name}
											onChange={(e) =>
												setCategoryForm({
													...categoryForm,
													name: e.target.value,
												})
											}
											className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
											placeholder="e.g. APQP, ISC"
										/>
									</div>
									<div>
										<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
											Display Order
										</label>
										<input
											type="number"
											required
											value={categoryForm.order}
											onChange={(e) =>
												setCategoryForm({
													...categoryForm,
													order: parseInt(
														e.target.value,
													),
												})
											}
											className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono"
										/>
									</div>
								</>
							) : (
								<>
									<div>
										<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
											Task Title
										</label>
										<input
											type="text"
											required
											value={taskForm.title}
											onChange={(e) =>
												setTaskForm({
													...taskForm,
													title: e.target.value,
												})
											}
											className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
											placeholder="Enter task description..."
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
												Sequence #
											</label>
											<input
												type="number"
												required
												value={taskForm.order}
												onChange={(e) =>
													setTaskForm({
														...taskForm,
														order: parseInt(
															e.target.value,
														),
													})
												}
												className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono"
											/>
										</div>
										<div>
											<label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
												Category
											</label>
											<select
												value={taskForm.categoryId}
												onChange={(e) =>
													setTaskForm({
														...taskForm,
														categoryId: parseInt(
															e.target.value,
														),
													})
												}
												className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-indigo-500 transition-all text-sm font-bold text-gray-700">
												{categories.map((c) => (
													<option
														key={c.id}
														value={c.id}>
														{c.name}
													</option>
												))}
											</select>
										</div>
									</div>
								</>
							)}

							<div className="pt-4 flex gap-3">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
									Cancel
								</button>
								<button
									type="submit"
									className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all">
									{editMode === "ADD" ? "Save" : "Update"}{" "}
									Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default Tasks;
