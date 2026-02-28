import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { getToken } from '@/utils/storage';

interface User {
  email: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  reload: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({ user: null, reload: async () => {} });

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function extractUser(payload: Record<string, unknown>): User {
  const email =
    (payload['email'] as string) ??
    (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string) ??
    '';
  const rawRole =
    payload['role'] ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const role = Array.isArray(rawRole) ? rawRole[0] : (rawRole as string) ?? 'User';
  return { email, role };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const reload = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const payload = decodeJwtPayload(token);
    setUser(extractUser(payload));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <UserContext.Provider value={{ user, reload }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
