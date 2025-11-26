import { type ReactNode, createContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConnection';

type AuthContextData = {
    signed: boolean;
    loadingAuth: boolean;
    handleInfoUser: ({uid, name, email}: UserProps) => void;
    user: UserProps | null;
}

interface AuthProviderProps {
    children: ReactNode;
}

interface UserProps {
    uid: string;
    name: string | null;
    email: string | null;
}

export const AuthContext = createContext({} as AuthContextData)

function AuthProvider({ children }: AuthProviderProps ) {
    const [user, setUser] = useState<UserProps | null>(null)
    const [loadingAuth, setLoadingAuth] = useState(true)

    useEffect(() => {

        const unsub = onAuthStateChanged(auth, (user) => {
            if(user) { // Tem usuário logado
                setUser({
                    uid: user.uid,
                    name: user?.displayName,
                    email: user?.email
                })

                setLoadingAuth(false);
            } else { // Não tem usuário logado
                setUser(null)
                setLoadingAuth(false);
            }

        })

        return () => {
            unsub();
        }; 

    }, [])

    function handleInfoUser({ uid, name, email }: UserProps) {
        setUser({
            uid,
            name,
            email,
        })
    }
    
    return(
        <AuthContext.Provider 
            value={{ 
                signed: !!user,
                loadingAuth,
                handleInfoUser,
                user,
            }}

        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;