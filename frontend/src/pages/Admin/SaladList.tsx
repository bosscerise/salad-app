import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Edit, Trash2, Search, RefreshCw, AlertCircle, 
  ChevronUp, ChevronDown, Eye, Filter, X, Image 
} from 'lucide-react';
import { useSalads } from '../../hooks/useSalads';
import { pb } from '../../services/api';

export default function SaladList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('display_order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Custom hook for salad operations
  const { 
    salads,
    loading,
    error,
    setFilter,
    setSort,
    deleteSalad
  } = useSalads();
  
  // Apply search and category filter
  const handleFilterChange = () => {
    let filterQuery = '';
    
    if (searchTerm) {
      filterQuery += `name~"${searchTerm}" || description~"${searchTerm}"`;
    }
    
    if (filterCategory) {
      if (filterQuery) filterQuery += ' && ';
      filterQuery += `category="${filterCategory}"`;
    }
    
    setFilter(filterQuery);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilter('');
  };
  
  // Apply sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      setSort(`${field}${newDirection === 'desc' ? '-' : ''}`);
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
      setSort(field);
    }
  };
  
  // Delete a salad
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteSalad(id);
      } catch (error) {
        console.error('Error deleting salad:', error);
        alert('Failed to delete salad. Please try again.');
      }
    }
  };
  
  // RenderSortIcon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} className="ml-1" />
    ) : (
      <ChevronDown size={16} className="ml-1" />
    );
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Salad Management</h1>
          
          <button
            onClick={() => navigate('/admin/salads/new')}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <PlusCircle size={18} className="mr-2" />
            Add New Salad
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error.message}</p>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search salads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFilterChange();
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleFilterChange();
                    }}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="min-w-[150px]">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="featured">Featured</option>
                <option value="seasonal">Seasonal</option>
                <option value="protein">Protein Rich</option>
                <option value="vegan">Vegan</option>
                <option value="light">Light & Fresh</option>
                <option value="signature">Signature</option>
              </select>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleFilterChange}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
              >
                <Filter size={16} className="mr-2" />
                Apply Filters
              </button>
              
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Salad List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-32 flex justify-center items-center">
              <RefreshCw size={24} className="text-emerald-600 animate-spin mr-3" />
              <p className="text-gray-600">Loading salads...</p>
            </div>
          ) : salads.length === 0 ? (
            <div className="py-16 text-center">
              <Image className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No salads found</h3>
              <p className="mt-1 text-gray-500">Get started by creating a new salad.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/admin/salads/new')}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add New Salad
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Salad Name
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price
                        {renderSortIcon('price')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {renderSortIcon('category')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('calories')}
                    >
                      <div className="flex items-center">
                        Calories
                        {renderSortIcon('calories')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('display_order')}
                    >
                      <div className="flex items-center">
                        Order
                        {renderSortIcon('display_order')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salads.map((salad) => (
                    <tr key={salad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {salad.image ? (
                            <img
                              src={`http://127.0.0.1:8090/api/files/${salad.collectionId}/${salad.id}/${salad.image}`}
                              alt={salad.name}
                              className="h-10 w-10 rounded-md object-cover mr-4"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/default-salad.jpg';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center mr-4">
                              <Image size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{salad.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">${salad.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {salad.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {salad.calories} cal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {salad.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          salad.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {salad.available ? 'Available' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => navigate(`/salads/${salad.id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/salads/${salad.id}`)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Edit salad"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(salad.id, salad.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete salad"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
