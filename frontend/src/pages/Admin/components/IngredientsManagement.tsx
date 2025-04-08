import { useState, useEffect } from 'react';
import { 
  PlusCircle, Edit, Trash2, Search, X, Save, 
  Upload, RefreshCw, AlertCircle, Filter 
} from 'lucide-react';
import { pb } from '../../../services/api';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  categoryId?: string; // Add categoryId to track the actual relation ID
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  available: boolean;
  image?: string;
  emoji?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function IngredientsManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    category: '',
    categoryId: '',
    price: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    available: true,
    emoji: '🥗'
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Categories for dropdown
  const [categories, setCategories] = useState<Category[]>([
    { id: 'base', name: 'Base' },
    { id: 'protein', name: 'Protein' },
    { id: 'toppings', name: 'Toppings' },
    { id: 'dressing', name: 'Dressing' },
    { id: 'extras', name: 'Extras' }
  ]);
  
  // Add state to track if categories are loading
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Fetch ingredient categories from PocketBase
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const records = await pb.collection('ingredient_category').getList(1, 50, {
        sort: 'order,name'
      });
      
      if (records.items.length > 0) {
        const fetchedCategories = records.items.map(item => ({
          id: item.id,
          name: item.name
        }));
        setCategories(fetchedCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Keep default categories if fetch fails
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  // Fetch ingredients from PocketBase with expanded category
  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const records = await pb.collection('ingredients').getList(1, 200, {
        sort: 'category,name',
        expand: 'category' // Expand the category relation
      });
      
      // Process the records to handle expanded category
      const processedIngredients = records.items.map(item => {
        // Extract the category name from the expanded relation
        let categoryName = '';
        let categoryId = '';
        
        if (item.expand && item.expand.category) {
          categoryName = item.expand.category.name;
          categoryId = item.category;
        } else if (item.category) {
          // If not expanded but we have the ID, find it in our categories
          const foundCategory = categories.find(c => c.id === item.category);
          categoryName = foundCategory ? foundCategory.name : 'Unknown';
          categoryId = item.category;
        }
        
        return {
          ...item,
          category: categoryName,
          categoryId: categoryId
        };
      });
      
      setIngredients(processedIngredients as unknown as Ingredient[]);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      setError('Failed to load ingredients. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (categories.length > 0) {
      fetchIngredients();
    }
  }, [categories]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'category') {
      // When category dropdown changes, store both name and ID
      const selectedCategory = categories.find(c => c.id === value);
      setFormData(prev => ({ 
        ...prev, 
        category: selectedCategory?.name || value,
        categoryId: value
      }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create a data object with all necessary fields
      const data = { 
        ...formData,
        // Use categoryId for the relation
        category: formData.categoryId || categories[0]?.id,
        // Remove the categoryId from the submitted data
        categoryId: undefined,
        // Ensure numeric fields are properly typed
        price: parseFloat(formData.price?.toString() || '0'),
        calories: parseInt(formData.calories?.toString() || '0'),
        protein: parseFloat(formData.protein?.toString() || '0'),
        carbs: parseFloat(formData.carbs?.toString() || '0'),
        fats: parseFloat(formData.fats?.toString() || '0'),
        // Ensure boolean fields are properly set
        available: formData.available === undefined ? true : !!formData.available,
        // Add any missing required fields
        name: formData.name || 'New Ingredient'
      };
      
      // Log the data being sent for debugging
      console.log('Submitting ingredient data:', data);
      
      if (editingIngredient) {
        // Update existing ingredient
        if (imageFile) {
          await pb.collection('ingredients').update(editingIngredient.id, data, { 
            file: imageFile 
          });
        } else {
          await pb.collection('ingredients').update(editingIngredient.id, data);
        }
      } else {
        // Create new ingredient
        const formData = new FormData();
        
        // Add all fields to FormData
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'categoryId') {
            if (key === 'available') {
              // Convert boolean to string '0' or '1' for PocketBase
              formData.append(key, value ? '1' : '0');
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        
        // Add file if exists
        if (imageFile) {
          formData.append('image', imageFile);
        }
        
        // Send as FormData to properly handle file uploads
        await pb.collection('ingredients').create(formData);
      }
      
      // Reset form state
      setFormData({
        name: '',
        category: '',
        categoryId: '',
        price: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        available: true,
        emoji: '🥗'
      });
      setImageFile(null);
      setImagePreview(null);
      setShowAddForm(false);
      setEditingIngredient(null);
      
      // Refresh data
      fetchIngredients();
      
      // Show success message
      alert('Ingredient saved successfully!');
    } catch (err: unknown) {
      console.error('Error submitting ingredient:', err);
      
      // Show more specific error message
      let errorMessage = 'Failed to save ingredient. Please check your inputs and try again.';
      
      if (err && typeof err === 'object') {
        if ('response' in err && 
            err.response && 
            typeof err.response === 'object' && 
            'data' in err.response && 
            err.response.data && 
            typeof err.response.data === 'object' && 
            'message' in err.response.data) {
          errorMessage = `Error: ${err.response.data.message}`;
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };
  
  // Edit ingredient
  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      categoryId: ingredient.categoryId,
      price: ingredient.price,
      calories: ingredient.calories,
      protein: ingredient.protein,
      carbs: ingredient.carbs,
      fats: ingredient.fats,
      available: ingredient.available,
      emoji: ingredient.emoji || '🥗'
    });
    
    if (ingredient.image) {
      setImagePreview(pb.files.getURL(ingredient, ingredient.image));
    }
    
    setShowAddForm(true);
  };
  
  // Delete ingredient
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await pb.collection('ingredients').delete(id);
        fetchIngredients();
      } catch (err) {
        console.error('Error deleting ingredient:', err);
        setError('Failed to delete ingredient. It might be used in salads.');
      }
    }
  };
  
  // Filter ingredients based on search term and category
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col gap-2 p-6 border-b md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-gray-800">Ingredients Management</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search className="absolute text-gray-400 left-3 top-2.5" size={16} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute text-gray-400 transition-colors right-3 top-2.5 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingIngredient(null);
              setFormData({
                name: '',
                category: '',
                categoryId: '',
                price: 0,
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                available: true,
                emoji: '🥗'
              });
              setImageFile(null);
              setImagePreview(null);
            }}
            className="flex items-center px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Ingredient
          </button>
        </div>
      </div>
      
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center mr-4">
            <Filter size={16} className="mr-2 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === category.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw size={24} className="text-emerald-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading ingredients...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-red-600">
          <AlertCircle size={20} className="inline-block mr-2" />
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ingredient</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nutrition</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 text-xl bg-gray-100 rounded-md">
                          {ingredient.emoji || '🥗'}
                        </div>
                        <div className="font-medium text-gray-900">{ingredient.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                        {categories.find(c => c.id === ingredient.categoryId)?.name || ingredient.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">${ingredient.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div>{ingredient.calories} cal</div>
                        <div className="text-xs text-gray-400">
                          {ingredient.protein}g protein • {ingredient.carbs}g carbs • {ingredient.fats}g fats
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          ingredient.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ingredient.available ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="p-1 mr-3 text-blue-600 rounded hover:bg-blue-100"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="p-1 text-red-600 rounded hover:bg-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">No ingredients found</div>
                    <div className="mt-1 text-gray-400">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                      {selectedCategory !== 'all' && (
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="ml-4 text-sm text-emerald-600 hover:underline"
                        >
                          Show all categories
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingIngredient ? `Edit ${editingIngredient.name}` : 'Add New Ingredient'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Ingredient Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  {categoriesLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw size={16} className="text-emerald-600 animate-spin" />
                      <span className="text-sm text-gray-500">Loading categories...</span>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.categoryId || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || 0}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories || 0}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.protein || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Fats (g)</label>
                  <input
                    type="number"
                    name="fats"
                    value={formData.fats || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Emoji</label>
                  <input
                    type="text"
                    name="emoji"
                    value={formData.emoji || '🥗'}
                    onChange={handleInputChange}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Available</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available || false}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show this ingredient</span>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Ingredient Image (Optional)</label>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-center px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {imagePreview ? (
                            <div>
                              <img src={imagePreview} alt="Preview" className="mx-auto mb-3 rounded h-36" />
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview(null);
                                }}
                                className="text-sm text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 mx-auto text-gray-400" strokeWidth={1} />
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative font-medium cursor-pointer text-emerald-600 hover:text-emerald-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save size={16} className="mr-2" />
                  {editingIngredient ? 'Save Changes' : 'Add Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
