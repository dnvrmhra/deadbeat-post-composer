import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { decodeToken, type DecodedJWT, type JWTHeader } from "../api/mockApi";

export interface User {
  username: string;
  role: "Admin" | "Editor" | "Viewer";
  name?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  decodedHeader: JWTHeader | null;
  decodedPayload: DecodedJWT | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [decodedHeader, setDecodedHeader] = useState<JWTHeader | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<DecodedJWT | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const decoded = decodeToken(storedToken);
        if (decoded && decoded.payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setDecodedHeader(decoded.header);
          setDecodedPayload(decoded.payload);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  function login(newToken: string, newUser: User) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    const decoded = decodeToken(newToken);
    if (decoded) {
      setDecodedHeader(decoded.header);
      setDecodedPayload(decoded.payload);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setDecodedHeader(null);
    setDecodedPayload(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        decodedHeader,
        decodedPayload,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}