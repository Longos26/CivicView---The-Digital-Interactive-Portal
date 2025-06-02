import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineTag, 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

// Constants
const ITEMS_PER_PAGE = 5;

// No search results component
const NoSearchResults = () => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-10 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No services match your search criteria</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or clear it to see all services.</p>
  </div>
);

export default function ServiceManager() {
  // State management
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    services: [],
    formData: { name: '', description: '' },
    error: null,
    loading: false,
    successMessage: '',
    showCreateForm: false,
    currentPage: 1,
    editingId: null,
    serviceToDelete: null,
    showModal: false,
    isPageLoading: true,
    searchTerm: '',
    isSearching: false
  });

  // Destructure state for easier access
  const {
    services,
    formData,
    error,
    loading,
    successMessage,
    showCreateForm,
    currentPage,
    editingId,
    serviceToDelete,
    showModal,
    isPageLoading,
    isSearching
  } = state;

  // Memoized pagination calculations
  const { currentItems, totalPages, filteredCount } = useMemo(() => {
    // If we're searching via API, don't filter locally
    if (state.searchTerm && isSearching) {
      const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
      const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
      const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
      const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
      
      return { currentItems, totalPages, filteredCount: services.length };
    }

    // Local filtering when not using search API
    const filteredServices = services.filter(service => 
      service.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(state.searchTerm.toLowerCase()))
    );

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    
    return { currentItems, totalPages, filteredCount: filteredServices.length };
  }, [services, currentPage, state.searchTerm, isSearching]);

  // State updater helper
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        updateState({ successMessage: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('/api/service', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        updateState({ 
          services: data, 
          isPageLoading: false,
          isSearching: false
        });
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      updateState({ error: err.message, isPageLoading: false });
    }
  }, [navigate]);

  // Search services using API
  const searchServices = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      // If search term is empty, fetch all services
      fetchServices();
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      updateState({ isSearching: true });

      const res = await fetch(`/api/service/search?q=${encodeURIComponent(searchTerm.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        updateState({ 
          services: data.services || [],
          isSearching: true,
          currentPage: 1 // Reset to first page for search results
        });
      } else {
        throw new Error(data.message || 'Failed to search services');
      }
    } catch (err) {
      console.error('Failed to search services:', err);
      updateState({ error: err.message, isSearching: false });
    }
  }, [navigate, fetchServices]);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (state.searchTerm) {
        searchServices(state.searchTerm);
      } else {
        fetchServices();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayedSearch);
  }, [state.searchTerm, searchServices, fetchServices]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Event handlers
  const handleChange = (e) => {
    updateState({ 
      formData: { ...formData, [e.target.id]: e.target.value },
      error: null 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.name.trim()) {
      updateState({ error: 'Service name is required' });
      return;
    }
  
    updateState({ loading: true, error: null });
  
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const url = editingId ? `/api/service/${editingId}` : '/api/service';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
  
      updateState({
        successMessage: editingId ? 'Service updated successfully!' : 'Service created successfully!',
        formData: { name: '', description: '' },
        editingId: null,
        showCreateForm: false,
        loading: false
      });

      // Refresh the services list
      if (state.searchTerm) {
        searchServices(state.searchTerm);
      } else {
        fetchServices();
      }
    } catch (err) {
      updateState({ 
        error: err.message || 'Network error. Please try again.',
        loading: false 
      });
    }
  };

  const handleEdit = (service) => {
    updateState({
      formData: {
        name: service.name,
        description: service.description || ''
      },
      editingId: service._id,
      showCreateForm: true,
      successMessage: '',
      error: null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (serviceId) => {
    updateState({ 
      serviceToDelete: serviceId,
      showModal: true 
    });
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`/api/service/${serviceToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
  
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete service');
      }
      
      updateState({
        successMessage: 'Service deleted successfully!',
        showModal: false,
        serviceToDelete: null
      });

      // Refresh the services list
      if (state.searchTerm) {
        searchServices(state.searchTerm);
      } else {
        fetchServices();
      }
    } catch (err) {
      updateState({ 
        error: err.message || 'Network error. Please try again.',
        showModal: false 
      });
    }
  };

  const paginate = (pageNumber) => {
    updateState({ currentPage: pageNumber });
  };

  const handleSearchChange = (value) => {
    updateState({ 
      searchTerm: value,
      currentPage: 1
    });
  };

  const clearSearch = () => {
    updateState({ 
      searchTerm: '',
      currentPage: 1,
      isSearching: false
    });
  };

  // Render loading state
  if (isPageLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header and Success/Error Messages */}
      <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
          <HiOutlineTag className="w-8 h-8 text-teal-400 dark:text-teal-500" />
          Service Management
        </h2>
        <button
          onClick={() => updateState({ 
            showCreateForm: !showCreateForm, 
            successMessage: '',
            error: null,
            editingId: null,
            formData: { name: '', description: '' }
          })}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-teal-500 hover:to-blue-600 hover:shadow-lg"
        >
          <HiOutlinePlus className="h-5 w-5" />
          {showCreateForm ? 'Hide Form' : 'Create Service'}
        </button>
      </div>

      {/* SearchBar */}
      <SearchBar 
        searchTerm={state.searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
        isSearching={isSearching}
      />

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3"
        >
          <HiOutlineCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">{successMessage}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-3"
        >
          <HiOutlineExclamationCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              {editingId ? 'Edit Service' : 'Create New Service'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter service name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter service description"
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    updateState({
                      showCreateForm: false,
                      editingId: null,
                      formData: { name: '', description: '' },
                      successMessage: '',
                      error: null
                    });
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-gray-500 hover:to-gray-600 hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-teal-500 hover:to-blue-600 hover:shadow-lg ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">{editingId ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    editingId ? 'Update Service' : 'Create Service'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Service List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {currentItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div className="max-w-xs">
                          {service.description 
                            ? service.description.length > 100 
                              ? `${service.description.substring(0, 100)}...` 
                              : service.description
                            : '—'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 flex items-center transition-colors duration-300"
                            title="Edit"
                          >
                            <HiOutlinePencil className="h-4 w-4 mr-1" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(service._id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center transition-colors duration-300"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4 mr-1" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{currentItems.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredCount)}
                      </span> of{' '}
                      <span className="font-medium">{filteredCount}</span> {state.searchTerm ? 'filtered' : ''} services
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number
                              ? 'z-10 bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-600 dark:text-teal-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : filteredCount === 0 && state.searchTerm ? (
          <NoSearchResults />
        ) : (
          <div className="p-8 text-center">
            <HiOutlineTag className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No services yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first service to get started!</p>
            <button
              onClick={() => updateState({ showCreateForm: true })}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 hover:from-teal-500 hover:to-blue-600 hover:shadow-lg mx-auto"
            >
              <HiOutlinePlus className="h-5 w-5" />
              Create Service
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => updateState({ showModal: false })}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
                    <HiOutlineExclamationCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
                  </div>
                </div>
                
                <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Delete Service
                </h3>
                
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this service? This action cannot be undone.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => updateState({ showModal: false, serviceToDelete: null })}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800                     rounded-lg font-medium transition-colors duration-300 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium transition-colors duration-300 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

// SearchBar Component
const SearchBar = ({ searchTerm, onSearchChange, onClearSearch, isSearching }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search services..."
          className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" color="teal" />
          </div>
        )}
      </div>
    </div>
  );
};