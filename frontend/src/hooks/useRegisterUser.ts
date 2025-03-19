import { useState } from 'react';
import pb from '../pb/pocketbase'; // Adjust the import path as needed

interface RegisterUserData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  avatar?: File;
  role?: string;
  points?: number;
}

interface UseRegisterUser {
  loading: boolean;
  error: Error | null;
  registerUser: (data: RegisterUserData) => Promise<void>;
}

export const useRegisterUser = (): UseRegisterUser => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const registerUser = async (data: RegisterUserData) => {
    try {
      setLoading(true);
      setError(null);

      const formData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        role: data.role || 'customer',
        points: data.points || 0,
      };

      await pb.collection('users').create(formData);

      if (data.avatar) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('avatar', data.avatar);
        await pb.collection('users').update(pb.authStore.model?.id || '', formDataWithFile);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to register user'));
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, registerUser };
};