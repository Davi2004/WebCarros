import { useEffect, useState } from 'react'

import Logo from '../../assets/logo.svg'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../../components/container'

import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../services/firebaseConnection'

import { FiEye, FiEyeOff } from "react-icons/fi";

import { toast } from 'react-hot-toast'

const schema = z.object({
  email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório!"),
  password: z.string().nonempty("O campo senha é obrigatório!")
})

type FormData = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth)
    }

    handleLogout()
    
  }, [])
  
  function onSubmit(data: FormData) {
    signInWithEmailAndPassword(auth, data.email, data.password)

    .then((user) => {
      toast.success("Login realizado com sucesso!")
      console.log(user)
      navigate('/dashboard', { replace: true });
    }) .catch((error) => {
      toast.error(`Erro ao fazer o login: ${error}`)
    })

    // Limpar os input's após envio
    reset();

  }
  
  return (
    <Container>
      <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
        <Link to="/" className='mb-6 max-w-sm w-full'>
          <img
            className='w-full'
            src={Logo}
            alt='Logo do Projeto'
          />
        </Link>

        <form className='bg-white max-w-xl w-full rounded-lg p-4'
          onSubmit={handleSubmit(onSubmit)}
        >

          <div className='mb-3'>
            <Input
              type="email"
              placeholder="Digite seu email..."
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className='mb-3'>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha..."
                name="password"
                error={errors.password?.message}
                register={register}
              />

              <button
                type='button'
                onClick={ () => setShowPassword(!showPassword) }
                className="absolute right-3 top-[13px] text-zinc-600 hover:text-black cursor-pointer"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button type='submit' className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium cursor-pointer'>
            Acessar
          </button>
          
        </form>
        
        <p> Ainda não possui uma conta? <Link to="/register" className='hover:underline'> Cadastre-se </Link> </p>
        
      </div>
    </Container>
  )
}