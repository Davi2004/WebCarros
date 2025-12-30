import { type RegisterOptions, type UseFormRegister } from 'react-hook-form'

interface InputProps {
    type: string;
    placeholder: string;
    name: string;
    register: UseFormRegister<any>;
    error?: string; 
    rules?: RegisterOptions; 
}

export function Input({ type, placeholder, name, register, error, rules }: InputProps) {
    return(
        <div className='relative'>
            <input
                className="w-full border-2 rounded-md h-11 px-2 focus:outline-none focus:border-blue-500"
                type={type}
                placeholder={placeholder}
                {...register(name, rules)}
                id={name}
            />
            {error && <p className='my-1 text-red-500 font-medium'>{error}</p>}
        </div>
    )
}