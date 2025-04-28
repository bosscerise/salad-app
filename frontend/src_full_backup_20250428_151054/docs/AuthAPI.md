# Authentication API Documentation

The Salad App provides a comprehensive authentication system built on top of PocketBase, with support for email/password authentication and OAuth2 providers.

## Authentication Context - `useAuth`

The main authentication system is implemented as a React context that provides authentication state and methods throughout your application.

### Setup

Wrap your application with the `AuthProvider`:

```tsx
import { AuthProvider } from '../hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### Usage

```tsx
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
  const { 
    isAuthenticated, 
    user, 
    login, 
    loginWithOAuth2, 
    logout, 
    register,
    isLoading, 
    error 
  } = useAuth();
  
  // Example login form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect or show success message
    } catch (err) {
      // Handle error
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          {/* Login form fields */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p>{error.message}</p>}
          
          {/* OAuth2 login */}
          <button onClick={() => loginWithOAuth2('google')} disabled={isLoading}>
            Login with Google
          </button>
        </form>
      )}
    </div>
  );
}
```

### Available Methods

#### Check Authentication Status

```tsx
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log('User is logged in:', user);
}
```

#### Login with Email/Password

```tsx
const { login } = useAuth();

try {
  const result = await login(email, password, rememberMe);
  console.log('Logged in successfully:', result.record);
} catch (error) {
  console.error('Login failed:', error);
}
```

**Parameters:**
- `email`: User's email address
- `password`: User's password
- `remember` (optional): Boolean to enable persistent login (defaults to true)

**Returns:** Promise resolving to an object with `token` and `record` (user data)

#### Login with OAuth2

```tsx
const { loginWithOAuth2 } = useAuth();

try {
  const result = await loginWithOAuth2('google');
  console.log('OAuth2 login successful:', result.record);
} catch (error) {
  console.error('OAuth2 login failed:', error);
}
```

**Parameters:**
- `provider`: The OAuth2 provider ('google', 'facebook', etc.)

**Returns:** Promise resolving to an object with `token` and `record` (user data)

#### Register New User

```tsx
const { register } = useAuth();

try {
  const user = await register({
    email: 'user@example.com',
    password: 'securepassword',
    passwordConfirm: 'securepassword',
    name: 'John Doe',
    phone: '123-456-7890', // Optional
    avatar: imageFile, // Optional File object
  });
  console.log('Registration successful:', user);
} catch (error) {
  console.error('Registration failed:', error);
}
```

**Parameters:**
- `data`: Object containing registration data:
  - `email`: User's email address
  - `password`: User's password
  - `passwordConfirm`: Password confirmation
  - `name`: User's full name
  - `phone` (optional): User's phone number
  - `avatar` (optional): User's profile image as a File object
  - `role` (optional): User role (defaults to 'customer')

**Returns:** Promise resolving to the newly created user object

#### Logout

```tsx
const { logout } = useAuth();

logout();
// User is now logged out
```

### User Data

The `user` object contains the following properties:
- `id`: User's unique ID
- `email`: User's email address
- `name`: User's full name
- `avatar`: URL to the user's profile picture (if available)
- `role`: User's role ('admin', 'customer', etc.)
- `points`: User's reward points

## Standalone Registration - `useRegisterUser`

For simpler use cases, the app also provides a standalone hook for user registration.

### Usage

```tsx
import { useRegisterUser } from '../hooks/useRegisterUser';

function RegistrationForm() {
  const { registerUser, loading, error } = useRegisterUser();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await registerUser({
        email: 'user@example.com',
        password: 'securepassword',
        passwordConfirm: 'securepassword',
        name: 'John Doe',
        avatar: imageFile, // Optional
      });
      
      // Handle successful registration
    } catch (err) {
      // Error is already captured in the hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
}
```

### Method

#### Register User

```tsx
const { registerUser } = useRegisterUser();

await registerUser({
  email: 'user@example.com',
  password: 'securepassword',
  passwordConfirm: 'securepassword',
  name: 'John Doe',
  avatar: imageFile, // Optional
});
```

**Parameters:**
- `data`: Object containing registration data:
  - `email`: User's email address
  - `password`: User's password
  - `passwordConfirm`: Password confirmation
  - `name`: User's full name
  - `avatar` (optional): User's profile image as a File object
  - `role` (optional): User role (defaults to 'customer')
  - `points` (optional): Initial points (defaults to 0)

**Returns:** Promise that resolves when registration is complete