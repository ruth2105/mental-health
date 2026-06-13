import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'patient' | 'therapist' | 'admin';
  name?: string;
  full_name?: string;
  language?: string;
  is_superuser?: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'patient' | 'therapist';
  language: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token & user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const fetchProfile = async (accessToken: string) => {
    const res = await fetch(`${API_BASE}/api/users/profile/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch profile');

    const userData = await res.json();
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // backend should accept 'email'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await res.json();
      // token response usually contains { access, refresh }
      const access = data.access || data.tokens?.access;
      const refresh = data.refresh || data.tokens?.refresh;
      setToken(access);
      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);

      // Fetch user profile immediately
      await fetchProfile(access);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        full_name: userData.name,
        role: userData.role,
        language: userData.language,
      };

      console.log('Sending registration request:', payload);

      const res = await fetch(`${API_BASE}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Registration failed:', errorData);
        
        // Handle different error formats
        let errorMessage = 'Registration failed';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (typeof errorData === 'object') {
          // Get first error message from any field
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('Registration successful:', data);
      
      const access = data.tokens?.access || data.access;
      const refresh = data.tokens?.refresh || data.refresh;
      setToken(access);
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('access_token');
    if (currentToken) {
      await fetchProfile(currentToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
