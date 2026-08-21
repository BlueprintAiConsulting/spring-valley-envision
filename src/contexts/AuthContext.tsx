import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { SpringValleyRole } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  activeRole: SpringValleyRole;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  activeRole: 'Salesperson', // Default lowest permission
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<SpringValleyRole>('Salesperson');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.role) {
              setActiveRole(data.role as SpringValleyRole);
            }
          } else {
            console.warn('No user document found in Firestore. Defaulting to Salesperson role.');
            setActiveRole('Salesperson');
          }
        } catch (error) {
          console.error('Error fetching user role from Firestore:', error);
          setActiveRole('Salesperson');
        }
      } else {
        setActiveRole('Salesperson');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const value = {
    currentUser,
    activeRole,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
