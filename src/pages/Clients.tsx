import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Briefcase, FileText
} from 'lucide-react';
import { clientService } from '../services/client.service';
import Modal from '../components/Modal';

const Clients = () => {
  const navigate = useNavigate();
  // Data State
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [currentClient, setCurrentClient] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // --- API FETCHING ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.getAll(currentPage, searchTerm);
      if (response.success) {
        setClients(response.data.clients);
        setTotalPages(response.data.totalPages);
        setTotalResults(response.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, searchTerm]);

  // Reset to page 1 whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setModalMode('ADD');
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: any) => {
    setModalMode('EDIT');
    setCurrentClient(client);
    setFormData({
      name: client.name,
      description: client.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.delete(id);
        fetchClients(); // Refresh list
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete client");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'ADD') {
        await clientService.create(formData);
      } else {
        await clientService.update(currentClient.id, formData);
      }
      setIsModalOpen(false);
      fetchClients(); // Refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-8 relative">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Management</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage your project clients and business entities.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Add Client</span>
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
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <th className="p-5">Client Name</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                          <Briefcase size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">CLNT-{client.id.toString().padStart(3, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="text-sm text-gray-600 line-clamp-1 max-w-md">
                        {client.description || <span className="text-gray-300 italic">No description</span>}
                      </p>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 text-gray-400">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="hover:text-amber-600 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                          title="View Attendance Report"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <p className="text-sm font-medium">{loading ? 'Fetching Clients...' : 'No clients found'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && clients.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs font-bold text-gray-500">
            <span>SHOWING {clients.length} OF {totalResults} CLIENTS</span>
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
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20 shrink-0 rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-900">{modalMode === 'ADD' ? 'Add New Client' : 'Edit Client'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Client Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Acme Corp, Globex, Initech"
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Description (Optional)</label>
                  <textarea 
                    rows={4}
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm resize-none"
                    placeholder="Briefly describe the client..."
                  />
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100 transition-all">
                    {modalMode === 'ADD' ? 'Create Client' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
      </Modal>

    </div>
  );
};

export default Clients;
