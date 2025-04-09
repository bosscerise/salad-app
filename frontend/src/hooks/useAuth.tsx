import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import pb from '../pb/pocketbase';

// Auth types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  points: number;
}

// Define the return types for auth operations
interface AuthResponse {
  token: string;
  record: User;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthResponse>;
  loginWithOAuth2: (provider: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (data: RegisterUserData) => Promise<User>;
  isLoading: boolean;
  error: Error | null;
}

interface RegisterUserData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  avatar?: File;
  role?: string;
  points?: number;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(pb.authStore.isValid);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUserData) => {
      const formData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        role: data.role || 'customer',
        points: data.points || 0,
      };

      const record = await pb.collection('users').create(formData);
      
      // Upload avatar if provided
      if (data.avatar) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('avatar', data.avatar);
        await pb.collection('users').update(record.id, formDataWithFile);
      }
      
      // Automatically log in after registration
      await pb.collection('users').authWithPassword(data.email, data.password);
      
      return record;
    },
    onSuccess: () => {
      loadUserData();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: 
      { email: string; password: string; remember?: boolean }) => {
      return await pb.collection('users').authWithPassword(email, password);
    },
    onSuccess: () => {
      loadUserData();
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  // OAuth2 login function
  const loginWithOAuth2 = async (provider: string) => {
    setIsLoading(true);
    try {
      // Use the popup method instead of redirect
      const authData = await pb.collection('users').authWithOAuth2({ provider });
      
      setIsLoading(false);
      loadUserData();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Transform the PocketBase response to match the AuthResponse type
      const authResponse: AuthResponse = {
        token: authData.token,
        record: {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name,
          avatar: authData.record.avatar ? pb.files.getURL(authData.record, authData.record.avatar, { thumb: '100x100' }) : undefined,
          role: authData.record.role || 'customer',
          points: authData.record.points || 0
        }
      };
      
      return authResponse;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(`${provider} login failed`));
      throw err;
    }
  };

  // Function to load user data
  const loadUserData = async () => {
    try {
      if (pb.authStore.isValid) {
        setIsAuthenticated(true);
        
        // Get the full user record
        const userData = pb.authStore.model;
        
        if (userData) {
          const avatarUrl = userData.avatar 
            ? pb.files.getURL(userData, userData.avatar, { thumb: '100x100' })
            : undefined;
            
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: avatarUrl,
            role: userData.role || 'customer',
            points: userData.points || 0
          });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load user data'));
    }
  };

  // Listen for auth changes
  useEffect(() => {
    // Initial load
    const initializeAuth = async () => {
      setIsLoading(true);
      await loadUserData();
      setIsLoading(false);
    };
    
    initializeAuth();
    
    // Listen to auth store changes
    pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
      loadUserData();
    });
  }, []);

  // Auth functions
  const login = async (email: string, password: string, remember = true) => {
    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password, remember });
      setIsLoading(false);
      
      // Transform the PocketBase response to match the AuthResponse type
      const authResponse: AuthResponse = {
        token: result.token,
        record: {
          id: result.record.id,
          email: result.record.email,
          name: result.record.name,
          avatar: result.record.avatar ? pb.files.getURL(result.record, result.record.avatar, { thumb: '100x100' }) : undefined,
          role: result.record.role || 'customer',
          points: result.record.points || 0
        }
      };
      
      return authResponse;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    setUser(null);
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const register = async (data: RegisterUserData) => {
    setIsLoading(true);
    try {
      const result = await registerMutation.mutateAsync(data);
      setIsLoading(false);
      
      // Transform the PocketBase response to match the User type
      const user: User = {
        id: result.id,
        email: result.email,
        name: result.name,
        avatar: result.avatar ? pb.files.getURL(result, result.avatar, { thumb: '100x100' }) : undefined,
        role: result.role || 'customer',
        points: result.points || 0
      };
      
      return user;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error('Registration failed'));
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    loginWithOAuth2,
    logout,
    register,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
