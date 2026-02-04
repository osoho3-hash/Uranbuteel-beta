import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useRouter } from 'next/router'

const PostJob = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('projects').insert([
      { title, description, budget: parseFloat(budget), client_id: user?.id, status: 'open' }
    ])
    if (!error) router.push('/dashboard')
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Шинэ ажил нийтлэх</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input placeholder="Ажлын нэр" className="w-full border p-2 rounded" onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Дэлгэрэнгүй тайлбар" className="w-full border p-2 rounded" rows={5} onChange={e=>setDescription(e.target.value)} />
        <input placeholder="Төсөв (₮)" type="number" className="w-full border p-2 rounded" onChange={e=>setBudget(e.target.value)} />
        <button className="bg-indigo-600 text-white px-6 py-2 rounded">Нийтлэх</button>
      </form>
    </div>
  )
}
export default PostJob
