import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'

const Dashboard = () => {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/signup')
      else {
        setRole(user.user_metadata.role)
        setLoading(false)
      }
    }
    checkUser()
  }, [])

  if (loading) return <p className="p-10">Уншиж байна...</p>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Тавтай морил!</h1>
      <p className="text-gray-600">Та {role === 'client' ? 'Захиалагч' : 'Гүйцэтгэгч'}-ийн эрхээр нэвтэрсэн байна.</p>
    </div>
  )
}
export default Dashboard
