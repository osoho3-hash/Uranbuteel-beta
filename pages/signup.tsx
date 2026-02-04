import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'

const SignupPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'client' | 'freelancer'>('freelancer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } }
    })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Бүртгүүлэх</h2>
        <input type="email" placeholder="И-мэйл" className="w-full border p-2 mb-4 rounded" onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Нууц үг" className="w-full border p-2 mb-4 rounded" onChange={(e)=>setPassword(e.target.value)} required />
        <select className="w-full border p-2 mb-4 rounded" value={role} onChange={(e)=>setRole(e.target.value as any)}>
          <option value="client">Захиалагч</option>
          <option value="freelancer">Гүйцэтгэгч</option>
        </select>
        <button className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">{loading ? 'Уншиж байна...' : 'Бүртгүүлэх'}</button>
      </form>
    </div>
  )
}
export default SignupPage
