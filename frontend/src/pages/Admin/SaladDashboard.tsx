import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Trash2, Image, 
  AlertCircle, CheckCircle, Upload, X, RefreshCw
} from 'lucide-react';
import { useSalads, Salad } from '../../hooks/useSalads';
import { pb } from '../../services/api';

// Salad categories options (you can extend this or make it dynamic)
const SALAD_CATEGORIES = [
  { id: 'featured', name: 'Featured' },
  { id: 'seasonal', name: 'Seasonal' },
  { id: 'protein', name: 'Protein Rich' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'light', name: 'Light & Fresh' },
  { id: 'signature', name: 'Signature' }
];

// Common salad tags
const COMMON_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
  'low-carb', 'high-protein', 'keto', 'mediterranean'
];

export default function SaladDashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  // Salad state
  const [formData, setFormData] = useState<Partial<Salad>>({
    name: '',
    price: 0,
    description: '',
    calories: 0,
    category: 'featured',
    available: true,
    tags: [],
    ingredients: '',
    protein: 0,
    carbs: 0,
    fats: 0,
    display_order: 0
  });
  
  // UI state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewTag, setPreviewTag] = useState('');
  
  // Custom hook for salad operations
  const { getSaladById, createSalad, updateSalad, deleteSalad } = useSalads();
  
  // Fetch salad data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchSalad = async () => {
        try {
          setLoading(true);
          const salad = await getSaladById(id);
          
          setFormData({
            name: salad.name,
            price: salad.price,
            description: salad.description,
            calories: salad.calories,
            category: salad.category,
            available: salad.available,
            tags: Array.isArray(salad.tags) ? salad.tags : [],
            ingredients: salad.ingredients,
            protein: salad.protein,
            carbs: salad.carbs,
            fats: salad.fats,
            display_order: salad.display_order
          });
          
          // Set image preview if exists
          if (salad.image) {
            setImagePreview(`http://127.0.0.1:8090/api/files/${salad.collectionId}/${salad.id}/${salad.image}`);
          }
        } catch (err) {
          console.error('Error fetching salad:', err);
          setError('Failed to load salad data.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSalad();
    }
  }, [id, isEditMode]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
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
  
  // Tag management
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    setFormData(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(trimmedTag)) return prev;
      
      return { ...prev, tags: [...currentTags, trimmedTag] };
    });
    
    setPreviewTag('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      // Ensure numeric fields are properly typed
      const data = {
        ...formData,
        price: parseFloat(formData.price?.toString() || '0'),
        calories: parseInt(formData.calories?.toString() || '0'),
        protein: parseFloat(formData.protein?.toString() || '0'),
        carbs: parseFloat(formData.carbs?.toString() || '0'),
        fats: parseFloat(formData.fats?.toString() || '0'),
        display_order: parseInt(formData.display_order?.toString() || '0'),
      };
      
      if (isEditMode && id) {
        await updateSalad(id, data, imageFile || undefined);
        setSuccess('Salad updated successfully!');
      } else {
        const result = await createSalad(data, imageFile || undefined);
        setSuccess('Salad created successfully!');
        
        // Navigate to edit view after creation
        setTimeout(() => {
          navigate(`/admin/salads/${result.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving salad:', err);
      setError('Failed to save salad. Please check your inputs and try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Delete salad
  const handleDelete = async () => {
    if (!id || !isEditMode) return;
    
    if (window.confirm('Are you sure you want to delete this salad? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deleteSalad(id);
        navigate('/admin/salads');
      } catch (err) {
        console.error('Error deleting salad:', err);
        setError('Failed to delete salad.');
        setLoading(false);
      }
    }
  };
  
  // Calculated nutrition totals
  const calculateTotalCalories = () => {
    if (!formData) return 0;
    
    // Simple direct calculation from the form's calorie value
    return formData.calories || 0;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 mr-2 text-emerald-600 animate-spin" />
        <p className="text-lg text-gray-700">Loading salad data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/salads')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit Salad' : 'Create New Salad'}
            </h1>
          </div>
          
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Salad
            </button>
          )}
        </div>
        
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}
        
        {/* Form */}
        <div className="bg-white shadow-sm rounded-xl p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Details Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salad Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Mediterranean Delight"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="A refreshing mix of fresh vegetables..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price ($)*
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price || 0}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category || 'featured'}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {SALAD_CATEGORIES.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredients (comma separated)
                      </label>
                      <textarea
                        name="ingredients"
                        value={formData.ingredients || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Lettuce, Tomatoes, Cucumbers, Feta"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="available"
                        name="available"
                        checked={formData.available || false}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label htmlFor="available" className="text-sm font-medium text-gray-700">
                        Available on Menu
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Tags Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Tags</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={previewTag}
                        onChange={(e) => setPreviewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-emerald-500 focus:border-emerald-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(previewTag);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => addTag(previewTag)}
                        className="py-2 px-4 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-emerald-600 hover:text-emerald-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Common tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            disabled={(formData.tags || []).includes(tag)}
                            className={`px-2 py-1 rounded text-xs ${
                              (formData.tags || []).includes(tag)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Salad Image</h2>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                    {imagePreview ? (
                      <div className="space-y-4 w-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer font-medium text-emerald-600 hover:text-emerald-500"
                          >
                            <span>Upload an image</span>
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
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Nutrition Information Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Nutrition Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        name="calories"
                        value={formData.calories || 0}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          name="protein"
                          value={formData.protein || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          name="carbs"
                          value={formData.carbs || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fats (g)
                        </label>
                        <input
                          type="number"
                          name="fats"
                          value={formData.fats || 0}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Nutrition Summary Card */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <h3 className="font-medium text-emerald-800 mb-3">Nutrition Summary</h3>
                  
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Calories</p>
                      <p className="font-bold text-gray-700">{calculateTotalCalories()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Protein</p>
                      <p className="font-bold text-gray-700">{formData.protein || 0}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carbs</p>
                      <p className="font-bold text-gray-700">{formData.carbs || 0}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fat</p>
                      <p className="font-bold text-gray-700">{formData.fats || 0}g</p>
                    </div>
                  </div>
                </div>
                
                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order (lower numbers shown first)
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/salads')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {isEditMode ? 'Update Salad' : 'Create Salad'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
