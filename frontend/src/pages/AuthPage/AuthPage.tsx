import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to "/"
  const redirectPath = (location.state as any)?.from?.pathname || '/';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4 relative">
      {/* Decorative backdrop pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Auth header tabs */}
          <div className="flex divide-x divide-gray-200">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-center font-medium text-sm sm:text-base transition-colors ${isLogin ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)} 
              className={`flex-1 py-4 text-center font-medium text-sm sm:text-base transition-colors ${!isLogin ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}
            >
              Register
            </button>
          </div>
          
          <div className="p-6 sm:p-8">
            {isLogin ? (
              <LoginForm redirectPath={redirectPath} />
            ) : (
              <RegisterForm setIsLogin={setIsLogin} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Login Form
const LoginForm = ({ redirectPath }: { redirectPath: string }) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(formData.email, formData.password, formData.remember);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-start">
          <AlertCircle className="min-w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 pr-10"
            placeholder="••••••••"
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={formData.remember}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
          Forgot password?
        </a>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
      >
        {isLoading ? (
          <Loader className="animate-spin h-5 w-5" />
        ) : (
          <>Sign in<ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </button>
    </form>
  );
};

// Register Form
const RegisterForm = ({ setIsLogin }: { setIsLogin: (value: boolean) => void }) => {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    terms: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords don't match");
      return;
    }
    
    if (!formData.terms) {
      setError("You must agree to the Terms of Service");
      return;
    }
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        name: `${formData.firstName} ${formData.lastName}`.trim()
      });
      
      setSuccess(true);
      setTimeout(() => {
        setIsLogin(true);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration successful!</h3>
        <p className="text-gray-600 mb-4">Your account has been created.</p>
        <p className="text-sm text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-start">
          <AlertCircle className="min-w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 pr-10"
            required
            minLength={8}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 pr-10"
            required
          />
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            required
          />
        </div>
        <div className="ml-3">
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-500">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:text-emerald-500">Privacy Policy</a>
          </label>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
      >
        {isLoading ? (
          <Loader className="animate-spin h-5 w-5" />
        ) : (
          <>Create account<ArrowRight className="ml-2 h-4 w-4" /></>
        )}
      </button>
    </form>
  );
};

export default AuthPage;