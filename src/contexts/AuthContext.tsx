import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há uma sessão ativa no localStorage
    const savedUser = localStorage.getItem('caixa_user');
    const lastLogin = localStorage.getItem('caixa_last_login');
    
    if (savedUser && lastLogin) {
      const lastLoginTime = new Date(lastLogin).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLogin = (currentTime - lastLoginTime) / (1000 * 60 * 60);
      
      // Logout automático após 8 horas
      if (hoursSinceLogin < 8) {
        setIsAuthenticated(true);
        setUser(savedUser);
      } else {
        localStorage.removeItem('caixa_user');
        localStorage.removeItem('caixa_last_login');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simula uma pequena latência para parecer mais real
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'Admin' && password === 'Admin') {
      setIsAuthenticated(true);
      setUser(username);
      localStorage.setItem('caixa_user', username);
      localStorage.setItem('caixa_last_login', new Date().toISOString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('caixa_user');
    localStorage.removeItem('caixa_last_login');
  };

  const value: AuthContextType = {
    isAuthenticated,
    login,
    logout,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
