"use client";

import { createContext } from "react";

export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);