import { useState, useEffect } from 'react';
import { 
  PlusCircle, Edit, Trash2, Search, X, Image, Save, 
  Upload, RefreshCw, AlertCircle, Minus 
} from 'lucide-react';
import { pb } from '../../../services/api';
const url = "https://597d-2a09-bac5-3071-1a78-00-2a3-17.ngrok-free.app"

interface NutrientInfo {
  name: string;
  value: string;
}

interface Salad {
  id: string;
  name: string;
  price: number;
  description: string;
  calories: number;
  category: string;
  image?: string;
  available: boolean;
  tags: string[];
  ingredients: SaladIngredient[];
  protein: number;
  carbs: number;
  fats: number;
  display_order: number;
  collectionId?: string;
  additional_nutrients?: NutrientInfo[];
}

interface SaladIngredient {
  id: string;
  quantity: number;
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  emoji?: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  available: boolean;
}

export default function SaladsManagement() {
  const [salads, setSalads] = useState<Salad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSalad, setEditingSalad] = useState<Salad | null>(null);
  
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SaladIngredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Salad>>({
    name: '',
    price: 0,
    description: '',
    calories: 0,
    category: 'featured',
    available: true,
    tags: [],
    ingredients: [],
    protein: 0,
    carbs: 0,
    fats: 0,
    display_order: 0
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nutrients, setNutrients] = useState<{name: string, value: string}[]>([]);
  const [newNutrient, setNewNutrient] = useState({name: '', value: ''});
  
  const fetchSalads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const records = await pb.collection('salads').getList(1, 100, {
        sort: 'display_order,name'
      });
      
      const processedSalads = records.items.map(item => {
        let ingredients = [];
        if (item.ingredients) {
          if (typeof item.ingredients === 'string') {
            try {
              ingredients = JSON.parse(item.ingredients);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              ingredients = item.ingredients.split(',').map(i => ({ 
                id: i.trim(), 
                quantity: 1 
              }));
            }
          } else if (Array.isArray(item.ingredients)) {
            ingredients = item.ingredients;
          }
        }
        
        return {
          ...item,
          ingredients
        };
      });
      
      setSalads(processedSalads as unknown as Salad[]);
    } catch (err) {
      console.error('Error fetching salads:', err);
      setError('Failed to load salads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    setIngredientsLoading(true);
    try {
      console.log("Fetching ingredients...");
      
      // First fetch categories to have the mapping ready
      const categoryRecords = await pb.collection('ingredient_category').getList(1, 50, {
        sort: 'order'
      });
      
      // Create a mapping from category ID to category name
      const categoryMap: Record<string, string> = categoryRecords.items.reduce((map, category) => {
        map[category.id] = category.name.toLowerCase();
        return map;
      }, {} as Record<string, string>);
      
      console.log("Category mapping:", categoryMap);
      
      // Now fetch ingredients
      const records = await pb.collection('ingredients').getList(1, 200, {
        sort: '+category,+name',
        filter: 'available = true',
        expand: 'category' // Expand the category relation
      });
      
      console.log("Raw ingredient records:", records.items);
      
      if (records.items.length === 0) {
        console.warn("No ingredients found in the database!");
      }
      
      // Process ingredients, handling the category as a relation
      const processedIngredients = records.items.map(item => {
        // Determine the category string
        let categoryString = 'base'; // Default
        
        // Try to get category from expanded relation
        if (item.expand && item.expand.category) {
          categoryString = item.expand.category.name.toLowerCase();
        } 
        // Or use the mapping if we have a category ID
        else if (item.category && categoryMap[item.category]) {
          categoryString = categoryMap[item.category];
        }
        
        return {
          id: item.id,
          name: item.name || 'Unnamed',
          // Store both the original category ID and the string name
          category: categoryString,
          categoryId: item.category,
          emoji: item.emoji || '🥗',
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
          calories: typeof item.calories === 'number' ? item.calories : parseInt(item.calories) || 0,
          protein: typeof item.protein === 'number' ? item.protein : parseFloat(item.protein) || 0,
          carbs: typeof item.carbs === 'number' ? item.carbs : parseFloat(item.carbs) || 0,
          fats: typeof item.fats === 'number' ? item.fats : parseFloat(item.fats) || 0,
          available: item.available === undefined ? true : !!item.available
        };
      });
      
      console.log("Processed ingredients:", processedIngredients);
      
      // Set all ingredients
      setAllIngredients(processedIngredients);
      
      // Log categories to debug
      const categories = ['base', 'protein', 'toppings', 'dressing', 'extras'];
      categories.forEach(category => {
        const itemsInCategory = processedIngredients.filter(i => i.category === category);
        console.log(`${category} ingredients after processing:`, itemsInCategory);
      });
      
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      
      // Use fallback data if API fails
      const fallbackIngredients = [
        // Bases
        { id: 'laitue', name: 'Laitue', category: 'base', emoji:'🥬', price: 2.99, calories: 15, protein: 1, carbs: 2, fats: 0, available: true },
        { id: 'romaine', name: 'Romaine', category: 'base', emoji:'🥬', price: 2.99, calories: 15, protein: 1, carbs: 2, fats: 0, available: true },
        { id: 'rocket', name: 'Rocket', category: 'base', emoji:'🍃', price: 3.49, calories: 25, protein: 2, carbs: 3, fats: 0, available: true },
        
        // Proteins
        { id: 'poulet', name: 'Poulet Grillé', category: 'protein', emoji:'🍗', price: 4.99, calories: 150, protein: 25, carbs: 0, fats: 6, available: true },
        { id: 'thon', name: 'Thon', category: 'protein', emoji:'🐟', price: 5.99, calories: 140, protein: 24, carbs: 0, fats: 5, available: true },
        
        // Toppings
        { id: 'tomate-cerise', name: 'Tomates Cerises', category: 'toppings', emoji:'🍅', price: 0.99, calories: 25, protein: 1, carbs: 5, fats: 0, available: true },
        { id: 'avocat', name: 'Avocat', category: 'toppings', emoji:'🥑', price: 1.99, calories: 80, protein: 1, carbs: 4, fats: 7, available: true },
        
        // Dressings
        { id: 'huile-olive', name: 'Huile d\'Olive', category: 'dressing', emoji:'🫒', price: 0.99, calories: 90, protein: 0, carbs: 0, fats: 10, available: true },
        
        // Extras
        { id: 'fromage', name: 'Fromage', category: 'extras', emoji:'🧀', price: 1.49, calories: 70, protein: 5, carbs: 0, fats: 6, available: true },
      ];
      
      console.log("Using fallback ingredients:", fallbackIngredients);
      setAllIngredients(fallbackIngredients);
    } finally {
      setIngredientsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSalads();
    fetchIngredients();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (name === 'tags') {
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, tags: tagsArray }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      const existing = prev.find(item => item.id === ingredientId);
      if (existing) {
        return prev.map(item => 
          item.id === ingredientId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { id: ingredientId, quantity: 1 }];
      }
    });
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      const existing = prev.find(item => item.id === ingredientId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === ingredientId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prev.filter(item => item.id !== ingredientId);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = { 
        ...formData,
        ingredients: selectedIngredients,
        price: parseFloat(formData.price?.toString() || '0'),
        calories: parseInt(formData.calories?.toString() || '0'),
        protein: parseFloat(formData.protein?.toString() || '0'),
        carbs: parseFloat(formData.carbs?.toString() || '0'),
        fats: parseFloat(formData.fats?.toString() || '0'),
        display_order: parseInt(formData.display_order?.toString() || '0'),
        available: formData.available === undefined ? true : !!formData.available,
        category: formData.category || 'featured',
        name: formData.name || 'New Salad',
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        additional_nutrients: nutrients,
      };
      
      console.log('Submitting salad data:', data);
      
      if (editingSalad) {
        if (imageFile) {
          const formData = new FormData();
          
          const dataWithStringifiedIngredients = {
            ...data,
            ingredients: JSON.stringify(selectedIngredients)
          };
          
          Object.entries(dataWithStringifiedIngredients).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (key === 'available') {
                formData.append(key, value ? 'true' : 'false');
              } else if (key === 'tags' && Array.isArray(value)) {
                formData.append('tags', value.join(','));
              } else if (key === 'additional_nutrients' && Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, value.toString());
              }
            }
          });
          
          formData.append('image', imageFile);
          
          await pb.collection('salads').update(editingSalad.id, formData);
        } else {
          const updateData = {
            ...data,
            ingredients: JSON.stringify(selectedIngredients),
            additional_nutrients: JSON.stringify(nutrients)
          };
          
          await pb.collection('salads').update(editingSalad.id, updateData);
        }
      } else {
        const formData = new FormData();
        
        const dataWithStringifiedIngredients = {
          ...data,
          ingredients: JSON.stringify(selectedIngredients),
          additional_nutrients: JSON.stringify(nutrients)
        };
        
        Object.entries(dataWithStringifiedIngredients).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'available') {
              formData.append(key, value ? 'true' : 'false');
            } else if (key === 'tags' && Array.isArray(value)) {
              if (value.length > 0) {
                formData.append('tags', value.join(','));
              }
            } else {
              formData.append(key, value.toString());
            }
          }
        });
        
        if (imageFile) {
          formData.append('image', imageFile);
        }
        
        await pb.collection('salads').create(formData);
      }
      
      setFormData({
        name: '',
        price: 0,
        description: '',
        calories: 0,
        category: 'featured',
        available: true,
        tags: [],
        ingredients: [],
        protein: 0,
        carbs: 0,
        fats: 0,
        display_order: 0
      });
      setSelectedIngredients([]);
      setImageFile(null);
      setImagePreview(null);
      setNutrients([]);
      setShowAddForm(false);
      setEditingSalad(null);
      
      fetchSalads();
      
      alert('Salad saved successfully!');
    } catch (err: unknown) {
      console.error('Error submitting salad:', err);
      
      let errorMessage = 'Failed to save salad. Please check your inputs and try again.';
      
      if (typeof err === 'object' && err !== null) {
        const error = err as { 
          response?: { data?: { message?: string } },
          data?: { message?: string },
          message?: string 
        };
        if (error.response?.data?.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        } else if (error.data?.message) {
          errorMessage = `Error: ${error.data.message}`;
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      console.log('Detailed error:', err);
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };
  
  const handleEdit = (salad: Salad) => {
    setEditingSalad(salad);
    
    let ingredientsList: SaladIngredient[] = [];
    
    if (salad.ingredients) {
      if (Array.isArray(salad.ingredients)) {
        ingredientsList = salad.ingredients;
      } else if (typeof salad.ingredients === 'string') {
        try {
          ingredientsList = JSON.parse(salad.ingredients);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          const ingredientsStr = salad.ingredients as string;
          ingredientsList = ingredientsStr
            .split(',')
            .map((ingredient: string) => ({
              id: ingredient.trim(),
              quantity: 1
            }));
        }
      }
    }
    
    setSelectedIngredients(ingredientsList);
    
    setFormData({
      name: salad.name,
      price: salad.price,
      description: salad.description,
      calories: salad.calories,
      category: salad.category,
      available: salad.available,
      tags: salad.tags,
      protein: salad.protein,
      carbs: salad.carbs,
      fats: salad.fats,
      display_order: salad.display_order
    });
    
    if (salad.image) {
      setImagePreview(`${url}/api/files/${salad.collectionId}/${salad.id}/${salad.image}`);
    } else {
      setImagePreview(null);
    }

    if (salad.additional_nutrients) {
      setNutrients(
        typeof salad.additional_nutrients === 'string'
          ? JSON.parse(salad.additional_nutrients)
          : salad.additional_nutrients
      );
    } else {
      setNutrients([]);
    }
    
    setShowAddForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this salad?')) {
      try {
        await pb.collection('salads').delete(id);
        fetchSalads();
      } catch (err) {
        console.error('Error deleting salad:', err);
        setError('Failed to delete salad. Please try again.');
      }
    }
  };
  
  const filteredSalads = salads.filter(salad =>
    salad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salad.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col gap-2 p-6 border-b md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-gray-800">Salads Management</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search salads..."
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
              setEditingSalad(null);
              setFormData({
                name: '',
                price: 0,
                description: '',
                calories: 0,
                category: 'featured',
                available: true,
                tags: [],
                ingredients: [],
                protein: 0,
                carbs: 0,
                fats: 0,
                display_order: 0
              });
              setSelectedIngredients([]);
              setImageFile(null);
              setImagePreview(null);
            }}
            className="flex items-center px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Salad
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw size={24} className="text-emerald-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading salads...</span>
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
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Salad</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nutrition</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSalads.length > 0 ? (
                filteredSalads.map((salad) => (
                  <tr key={salad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {salad.image ? (
                          <img
                            src={`${url}/api/files/${salad.collectionId}/${salad.id}/${salad.image}`}
                            alt={salad.name}
                            className="object-cover w-10 h-10 mr-3 rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/default-salad.jpg';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-200 rounded-md">
                            <Image size={16} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{salad.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[300px]">{salad.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">${salad.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{salad.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div>{salad.calories} cal</div>
                        <div className="text-xs text-gray-400">
                          {salad.protein}g protein • {salad.carbs}g carbs • {salad.fats}g fats
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          salad.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {salad.available ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(salad)}
                        className="p-1 mr-3 text-blue-600 rounded hover:bg-blue-100"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(salad.id)}
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
                    <div className="text-gray-500">No salads found</div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-sm text-emerald-600 hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingSalad ? `Edit ${editingSalad.name}` : 'Add New Salad'}
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">Salad Name</label>
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category || 'featured'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="featured">Featured</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="protein">Protein Rich</option>
                    <option value="vegan">Vegan</option>
                    <option value="light">Light & Fresh</option>
                    <option value="signature">Signature</option>
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order || 0}
                    onChange={handleInputChange}
                    min="0"
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">Available</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available || false}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show on menu</span>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags?.join(', ') || ''}
                    onChange={handleInputChange}
                    placeholder="vegetarian, high-protein, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Ingredients</label>
                  
                  {ingredientsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <RefreshCw size={20} className="text-emerald-600 animate-spin" />
                      <span className="ml-2 text-gray-600">Loading ingredients...</span>
                    </div>
                  ) : (
                    <>
                      {/* Selected ingredients */}
                      <div className="p-3 mb-4 overflow-y-auto border border-gray-200 rounded-md max-h-48">
                        {selectedIngredients.length > 0 ? (
                          <div className="space-y-2">
                            {selectedIngredients.map((ingredient) => {
                              const ingredientDetails = allIngredients.find(i => i.id === ingredient.id);
                              
                              return (
                                <div key={ingredient.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                                  <div className="flex items-center">
                                    <span className="mr-2 text-lg">{ingredientDetails?.emoji || '🥗'}</span>
                                    <span>{ingredientDetails?.name || ingredient.id}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => handleRemoveIngredient(ingredient.id)}
                                      className="p-1 text-gray-500 rounded-full hover:bg-gray-200"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center">{ingredient.quantity}</span>
                                    <button 
                                      type="button"
                                      onClick={() => handleAddIngredient(ingredient.id)}
                                      className="p-1 text-gray-500 rounded-full hover:bg-gray-200"
                                    >
                                      <PlusCircle size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-gray-500">
                            No ingredients selected. Add some below.
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">Available Ingredients</h4>
                        
                        {['base', 'protein', 'toppings', 'dressing', 'extras'].map(categoryName => {
                          const categoryIngredients = allIngredients.filter(i => 
                            i.category && i.category.toLowerCase() === categoryName.toLowerCase()
                          );
                          
                          console.log(`${categoryName} ingredients:`, categoryIngredients);
                          
                          if (categoryIngredients.length === 0) return null;
                          
                          return (
                            <div key={categoryName} className="mb-4">
                              <h5 className="mb-2 text-xs font-medium text-gray-500 uppercase">
                                {categoryName}
                              </h5>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                {categoryIngredients.map(ingredient => (
                                  <button
                                    key={ingredient.id}
                                    type="button"
                                    onClick={() => handleAddIngredient(ingredient.id)}
                                    className={`flex items-center p-2 text-left border rounded-md transition-colors
                                      ${selectedIngredients.some(i => i.id === ingredient.id)
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 hover:bg-gray-50'}`}
                                  >
                                    <span className="mr-2">{ingredient.emoji || '🥗'}</span>
                                    <span className="text-sm">{ingredient.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Salad Image</label>
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

                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Additional Nutrients</label>
                  
                  <div className="mb-3 space-y-2">
                    {nutrients.map((nutrient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nutrient.name}
                          onChange={(e) => {
                            const updated = [...nutrients];
                            updated[index].name = e.target.value;
                            setNutrients(updated);
                          }}
                          placeholder="e.g. Vitamin C"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          value={nutrient.value}
                          onChange={(e) => {
                            const updated = [...nutrients];
                            updated[index].value = e.target.value;
                            setNutrients(updated);
                          }}
                          placeholder="e.g. 45%"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNutrients(nutrients.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-red-600 rounded-md hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNutrient.name}
                      onChange={(e) => setNewNutrient({...newNutrient, name: e.target.value})}
                      placeholder="Nutrient name (e.g. Vitamin C)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={newNutrient.value}
                      onChange={(e) => setNewNutrient({...newNutrient, value: e.target.value})}
                      placeholder="Value (e.g. 45%)"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newNutrient.name && newNutrient.value) {
                          setNutrients([...nutrients, newNutrient]);
                          setNewNutrient({name: '', value: ''});
                        }
                      }}
                      className="px-4 py-2 text-white rounded-md bg-emerald-600 hover:bg-emerald-700"
                    >
                      Add
                    </button>
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
                  {editingSalad ? 'Save Changes' : 'Add Salad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
