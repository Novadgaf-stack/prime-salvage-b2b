'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { getUser, createUser, UserDoc } from '@/lib/firebase/db';

interface AuthContextType {
  user: UserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userDoc = await getUser(firebaseUser.uid);
        
        if (!userDoc) {
          // If no doc exists, default to new user tech
          userDoc = {
            uid: firebaseUser.uid,
            shopName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown Tech',
            email: firebaseUser.email || '',
            verifiedTech: false,
            createdAt: new Date().toISOString()
          };
          await createUser(firebaseUser.uid, {
            shopName: userDoc.shopName,
            email: userDoc.email,
            verifiedTech: userDoc.verifiedTech,
            createdAt: userDoc.createdAt
          });
        }
        setUser(userDoc);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
