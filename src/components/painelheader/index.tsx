import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebaseConnection'
import toast from 'react-hot-toast'

export function DashboardHeader() {

    async function handleLogout() {
        await signOut(auth)
        toast.success("Saindo da conta... Até a próxima!")
    }
    
    return (
        <div className='w-full rounded-lg flex items-center gap-4 h-10 p-4 mb-4 bg-red-600 text-white font-medium'>
            
            <Link to="/dashboard"> Dashboard </Link>
                
            <Link to="/dashboard/new"> Novo Carro </Link>
            
            <button className="cursor-pointer ml-auto" onClick={handleLogout}>
                Sair da conta
            </button>
            
        </div>
    )
}