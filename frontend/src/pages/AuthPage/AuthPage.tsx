import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
  Eye, EyeOff, Loader, CheckCircle, AlertCircle, ArrowRight, 
  AtSign, Lock, User, Sparkles, CheckCheck, ShieldCheck
} from 'lucide-react';

// Add proper type definitions for component props
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon: React.ReactNode;
  required?: boolean;
  toggleVisible?: () => void; // Function to toggle password visibility
  showPassword?: boolean;
  error?: string;
}

interface LoginFormProps {
  redirectPath: string;
}

interface RegisterFormProps {
  setIsLogin: (value: boolean) => void;
}

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
    <div className="flex flex-col w-full min-h-screen md:flex-row">
      {/* Left side - Illustration & Benefits (hidden on small screens) */}
      <div className="hidden text-white md:flex md:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="flex flex-col justify-between h-full max-w-md px-8 py-12 mx-auto">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="mb-2 text-3xl font-bold">Salad Shark</h1>
              <p className="text-emerald-100">Fresh, healthy meals at your fingertips</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-6 text-2xl font-bold">Why join us?</h2>
              
              <div className="space-y-6">
                <BenefitItem 
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Exclusive Deals"
                  description="Members get special discounts and early access to seasonal items"
                />
                
                <BenefitItem 
                  icon={<CheckCheck className="w-5 h-5" />}
                  title="Order Faster"
                  description="Save your favorites and reorder with just one click"
                />
                
                <BenefitItem 
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title="Secure Checkout"
                  description="Your payment and personal info are always protected"
                />
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-12 mt-auto"
          >
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <p className="text-sm italic text-emerald-100">
                "The ordering process is so smooth, and the salads are amazing! 
                Creating an account was the best decision for my lunch routine."
              </p>
              <div className="flex items-center mt-3">
                <div className="flex items-center justify-center w-8 h-8 font-bold rounded-full bg-emerald-300 text-emerald-800">J</div>
                <div className="ml-2">
                  <p className="text-sm font-medium">Jamie L.</p>
                  <p className="text-xs text-emerald-200">Member since 2023</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Auth Forms */}
      <div className="flex items-center justify-center w-full p-4 bg-white md:w-1/2 md:p-0">
        <div className="w-full max-w-md px-6 py-8">
          {/* Green leaf pattern visible on mobile only */}
          <div className="mb-8 md:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-20 h-20 mx-auto mb-4"
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-4xl">🥗</span>
              </div>
            </motion.div>
            <h1 className="mb-1 text-2xl font-bold text-center text-gray-800">Salad Shark</h1>
            <p className="text-sm text-center text-gray-500">Fresh, healthy meals at your fingertips</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden bg-white rounded-xl"
          >
            {/* Auth header tabs */}
            <div className="flex mb-8">
              <TabButton 
                active={isLogin} 
                onClick={() => setIsLogin(true)}
                label="Sign In"
              />
              <TabButton 
                active={!isLogin} 
                onClick={() => setIsLogin(false)}
                label="Create Account"
              />
            </div>
            
            {/* Animated form switching */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? (
                  <LoginForm redirectPath={redirectPath} />
                ) : (
                  <RegisterForm setIsLogin={setIsLogin} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Tab Button Component with types
const TabButton = ({ active, onClick, label }: TabButtonProps) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2 text-center relative`}
  >
    <span className={`text-sm sm:text-base font-medium ${active ? 'text-emerald-700' : 'text-gray-500'}`}>
      {label}
    </span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

// Benefit Item Component with types
const BenefitItem = ({ icon, title, description }: BenefitItemProps) => (
  <div className="flex items-start">
    <div className="p-2 mt-1 mr-4 rounded-full bg-white/20">{icon}</div>
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-emerald-100">{description}</p>
    </div>
  </div>
);

// Fixed Form Input Component - The main bug fix is here
const FormInput = ({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder = "", 
  icon, 
  required = true, 
  toggleVisible, // This is a function, not a boolean
  showPassword, 
  error = "" 
}: FormInputProps) => (
  <div>
    <label htmlFor={id} className="block mb-1.5 text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <div className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2">
        {icon}
      </div>
      <input
        type={type}
        id={id}
        value={typeof value === 'string' ? value : value ? 'true' : 'false'}
        onChange={onChange}
        className={`w-full pl-10 pr-${toggleVisible ? '10' : '4'} py-2.5 border ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all`}
        placeholder={placeholder}
        required={required}
      />
      {/* Fix: Only render the button if toggleVisible is provided */}
      {toggleVisible && (
        <button 
          type="button"
          onClick={toggleVisible} // This is now correctly used as a handler
          className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

// Login Form with proper type annotation
const LoginForm = ({ redirectPath }: LoginFormProps) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific error when user types
    if (id in fieldErrors) {
      setFieldErrors(prev => ({
        ...prev,
        [id as keyof typeof fieldErrors]: ''
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({ email: '', password: '' });
    
    // Basic validation
    let hasErrors = false;
    if (!formData.email.includes('@')) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      hasErrors = true;
    }
    
    if (formData.password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    try {
      await login(formData.email, formData.password, formData.remember);
      navigate(redirectPath);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start p-3 text-sm text-red-700 rounded-lg bg-red-50"
        >
          <AlertCircle className="min-w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}
      
      <FormInput
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="you@example.com"
        icon={<AtSign size={18} />}
        error={fieldErrors.email}
      />
      
      <FormInput
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        icon={<Lock size={18} />}
        toggleVisible={() => setShowPassword(!showPassword)}
        showPassword={showPassword}
        error={fieldErrors.password}
      />
      
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
          <motion.div 
            className="flex items-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span>Sign in</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.div>
        )}
      </button>
      
      <div className="relative flex items-center pt-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-3 text-xs text-gray-400">OR CONTINUE WITH</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20">
            <path d="M18.896 0H1.104C.494 0 0 .494 0 1.104v17.792C0 19.506.494 20 1.104 20h9.578v-7.745H8.076V9.237h2.606V7.01c0-2.583 1.578-3.99 3.883-3.99 1.104 0 2.052.082 2.329.119v2.7h-1.598c-1.254 0-1.496.597-1.496 1.47v1.927h2.989l-.39 3.018h-2.6V20h5.098c.608 0 1.102-.494 1.102-1.104V1.104C20 .494 19.506 0 18.896 0z" fill="#3B5998"/>
          </svg>
          Facebook
        </button>
      </div>
      
      <p className="mt-4 text-xs text-center text-gray-500">
        By signing in, you agree to our 
        <a href="#" className="text-emerald-600 hover:text-emerald-500"> Terms of Service</a> and 
        <a href="#" className="text-emerald-600 hover:text-emerald-500"> Privacy Policy</a>
      </p>
    </form>
  );
};

// Register Form with proper type annotation
const RegisterForm = ({ setIsLogin }: RegisterFormProps) => {
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
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  // Use useEffect to safely handle the timeout
  useEffect(() => {
    let timeoutId: number;
    
    if (success) {
      timeoutId = window.setTimeout(() => {
        setIsLogin(true);
      }, 2000);
    }
    
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
    
    // Clear field error on change
    if (id in fieldErrors) {
      setFieldErrors(prev => ({
        ...prev,
        [id as keyof typeof fieldErrors]: ''
      }));
    }
  };

  const validateStep1 = () => {
    let valid = true;
    const errors = { ...fieldErrors };
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      valid = false;
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      valid = false;
    }
    
    if (!formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
      valid = false;
    }
    
    setFieldErrors(errors);
    return valid;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password fields
    let valid = true;
    const errors = { ...fieldErrors };
    
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Passwords don't match";
      valid = false;
    }
    
    setFieldErrors(errors);
    if (!valid) return;
    
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
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Registration failed';
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">Welcome aboard!</h3>
        <p className="mb-4 text-gray-600">Your account has been created successfully.</p>
        <p className="text-sm text-gray-500">Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              step > 1 ? 'bg-emerald-600' : 'bg-emerald-600'
            } text-white font-medium text-sm`}>1</div>
            <div className={`ml-2 text-sm ${step === 1 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
              Personal Info
            </div>
          </div>
          <div className={`w-10 h-1 ${step > 1 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
              step === 2 ? 'bg-emerald-600' : 'bg-gray-200'
            } ${step === 2 ? 'text-white' : 'text-gray-500'} font-medium text-sm`}>2</div>
            <div className={`ml-2 text-sm ${step === 2 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
              Security
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start p-3 mb-4 text-sm text-red-700 rounded-lg bg-red-50"
        >
          <AlertCircle className="min-w-5 h-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <FormInput
                id="firstName"
                label="First name"
                value={formData.firstName}
                onChange={handleChange}
                icon={<User size={18} />}
                error={fieldErrors.firstName}
              />
              
              <FormInput
                id="lastName"
                label="Last name"
                value={formData.lastName}
                onChange={handleChange}
                icon={<User size={18} />}
                error={fieldErrors.lastName}
              />
              
              <FormInput
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={<AtSign size={18} />}
                error={fieldErrors.email}
              />
              
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
              >
                <motion.div 
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <FormInput
                id="password"
                label="Create password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                icon={<Lock size={18} />}
                toggleVisible={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
                error={fieldErrors.password}
              />
              
              <FormInput
                id="passwordConfirm"
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                value={formData.passwordConfirm}
                onChange={handleChange}
                icon={<Lock size={18} />}
                error={fieldErrors.passwordConfirm}
              />
              
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
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span>Create account</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.div>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default AuthPage;