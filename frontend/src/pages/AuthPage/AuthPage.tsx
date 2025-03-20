import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  
  // Get the redirect path from location state or default to "/"
  interface LocationState {
    from?: {
      pathname: string;
    };
  }
  const redirectPath = (location.state as LocationState)?.from?.pathname || '/';
  
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      {/* Decorative backdrop pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden bg-white shadow-xl rounded-xl"
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
    } catch (err: unknown) {
      // Use a type guard for Error objects instead of 'any'
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start p-3 text-sm text-red-700 rounded-lg bg-red-50">
          <AlertCircle className="min-w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
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
        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="••••••••"
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
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
            className="w-4 h-4 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="remember" className="block ml-2 text-sm text-gray-700">
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
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <>Sign in<ArrowRight className="w-4 h-4 ml-2" /></>
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

  // Use useEffect to safely handle the timeout
  useEffect(() => {
    let timeoutId: number;
    
    if (success) {
      timeoutId = window.setTimeout(() => {
        setIsLogin(true);
      }, 2000);
    }
    
    // Cleanup function that runs when component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [success, setIsLogin]);

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
    } catch (err: unknown) {
      // Use a type guard instead of 'any'
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Registration failed';
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">Registration successful!</h3>
        <p className="mb-4 text-gray-600">Your account has been created.</p>
        <p className="text-sm text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start p-3 text-sm text-red-700 rounded-lg bg-red-50">
          <AlertCircle className="min-w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">
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
          <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700">
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
        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
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
        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            required
            minLength={8}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block mb-1 text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
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
            className="w-4 h-4 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
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
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <>Create account<ArrowRight className="w-4 h-4 ml-2" /></>
        )}
      </button>
    </form>
  );
};

export default AuthPage;