import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, FileText
} from 'lucide-react';
import { employeeService } from '../services/employee.service';
import Modal from '../components/Modal';

const Employees = () => {
  const navigate = useNavigate();
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullname: '',
    role: '',
    username: '', // Added for backend requirement
    password: '', // Added for backend requirement
    shift_hours: 9
  });

  // --- API FETCHING ---
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAll(currentPage, searchTerm);
      if (response.success) {
        setUsers(response.data.employees);
        setTotalPages(response.data.totalPages);
        setTotalResults(response.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm]);

  // Reset to page 1 whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setModalMode('ADD');
    setFormData({ fullname: '', role: '', username: '', password: '', shift_hours: 9 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setModalMode('EDIT');
    setCurrentUser(user);
    setFormData({
      fullname: user.fullname,
      role: user.role,
      username: user.username,
      password: '', // Keep blank unless changing
      shift_hours: user.shift_hours || 9
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also remove their logs.')) {
      try {
        await employeeService.delete(id);
        fetchEmployees(); // Refresh list
      } catch (error) {
        alert("Failed to delete employee");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'ADD') {
        await employeeService.create(formData);
      } else {
        await employeeService.update(currentUser.id, formData);
      }
      setIsModalOpen(false);
      fetchEmployees(); // Refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-8 relative">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team Members</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage your employees, roles, and work hours.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="relative w-full">
          {loading ? (
            <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          )}
          <input
            type="text"
            placeholder="Search employees by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <th className="p-5">Employee</th>
                <th className="p-5">Role & ID</th>
                <th className="p-5 text-center">Required Hours</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                          {getInitials(user.fullname)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.fullname}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{user.role}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">EMP-{user.id.toString().padStart(4, '0')}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                        {user.shift_hours}h / Day
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 text-right">
                        <button
                          onClick={() => navigate(`/attendance/${user.id}`)}
                          className="text-gray-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                          title="Attendance History"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm font-medium">{loading ? 'Fetching Team...' : 'No employees found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && users.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-gray-500">
            <span>SHOWING {users.length} OF {totalResults} EMPLOYEES</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4">PAGE {currentPage} OF {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Header - Sticky & Blurred */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0 rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-900">{modalMode === 'ADD' ? 'Add New Employee' : 'Edit Employee'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                  <input type="text" required value={formData.fullname} onChange={e => setFormData({ ...formData, fullname: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                    <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role</label>
                    <input type="text" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                  </div>
                </div>
                {modalMode === 'ADD' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Initial Password</label>
                    <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Required Work Hours</label>
                  <input type="number" required value={formData.shift_hours} onChange={e => setFormData({ ...formData, shift_hours: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 text-sm" />
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100 transition-all">
                    {modalMode === 'ADD' ? 'Create Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
      </Modal>

    </div>
  );
};

const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export default Employees;