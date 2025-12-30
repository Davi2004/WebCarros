import { type ReactNode, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface PrivateProps {
    children: ReactNode
}

export function Private({ children }: PrivateProps): any {
    const { signed, loadingAuth } = useContext(AuthContext)

    if(loadingAuth) {
        return <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-zinc-900 rounded-full animate-spin"></div>
                </div>
    }

    if(!signed) {
        return <Navigate to="/login"/>
    }
    
    return children
}