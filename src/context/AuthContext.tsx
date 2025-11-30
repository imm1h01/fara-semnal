import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasCompletedQuestionnaire: boolean;
    setHasCompletedQuestionnaire: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                try {
                    const userRef = ref(database, `users/${user.uid}/profile`);
                    const snapshot = await get(userRef);
                    setHasCompletedQuestionnaire(snapshot.exists());
                } catch (error) {
                    console.error('Error checking user profile:', error);
                    setHasCompletedQuestionnaire(false);
                }
            } else {
                setHasCompletedQuestionnaire(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Actualizează profilul utilizatorului cu numele
            await updateProfile(userCredential.user, {
                displayName: name,
            });

            // Creează un nod pentru utilizatorul nou în database
            await set(ref(database, `users/${userCredential.user.uid}`), {
                email: userCredential.user.email,
                name: name,
                createdAt: new Date().toISOString(),
            });

            toast({
                title: "Cont creat cu succes!",
                description: "Bine ai venit la Fără semnal!",
            });
        } catch (error: any) {
            let errorMessage = "A apărut o eroare la înregistrare";

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Acest email este deja înregistrat";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Parola trebuie să aibă cel puțin 6 caractere";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Email invalid";
            }

            toast({
                title: "Eroare",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Autentificare reușită!",
                description: "Bine ai revenit!",
            });
        } catch (error: any) {
            let errorMessage = "A apărut o eroare la autentificare";

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Email sau parolă incorectă";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Email invalid";
            }

            toast({
                title: "Eroare",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast({
                title: "Deconectare reușită",
                description: "La revedere!",
            });
        } catch (error) {
            toast({
                title: "Eroare",
                description: "A apărut o eroare la deconectare",
                variant: "destructive",
            });
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        logout,
        hasCompletedQuestionnaire,
        setHasCompletedQuestionnaire,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};