import React, { Component, createContext } from 'react';
import { UserRole, AuthUser } from '../types';

// Phase 9 — AuthContext using class component
// Stores user/token state and provides login/logout methods to the entire app

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

interface Props {
  children: React.ReactNode;
}

interface State {
  user: AuthUser | null;
}

export class AuthProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // Restore session from localStorage on mount
    const stored = localStorage.getItem('credwork_user');
    const token = localStorage.getItem('credwork_token');

    if (stored && token) {
      try {
        const parsed = JSON.parse(stored) as { userId: string; role: UserRole };
        this.state = {
          user: { userId: parsed.userId, role: parsed.role, token },
        };
      } catch {
        this.state = { user: null };
      }
    } else {
      this.state = { user: null };
    }

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  public login(token: string, userId: string, role: UserRole): void {
    const user: AuthUser = { token, userId, role };
    localStorage.setItem('credwork_token', token);
    localStorage.setItem('credwork_user', JSON.stringify({ userId, role }));
    this.setState({ user });
  }

  public logout(): void {
    localStorage.removeItem('credwork_token');
    localStorage.removeItem('credwork_user');
    this.setState({ user: null });
  }

  public render(): React.ReactNode {
    const { user } = this.state;
    const contextValue: AuthContextType = {
      user,
      isAuthenticated: user !== null,
      login: this.login,
      logout: this.logout,
    };

    return (
      <AuthContext.Provider value={contextValue}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}
