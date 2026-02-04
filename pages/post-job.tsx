// pages/post-job.tsx
// -----------------------------------------------------------------------------
// This page allows a "Захиалагч" (client) to post a new job.  It checks that
// the logged‑in user has the role `client` and then renders a form for
// entering the job's title, description, budget, and selecting an optional
// category.  The `budget` field is required because payments are handled
// through an escrow system.  After submission the job is inserted into the
// `projects` table and the user is redirected to the dashboard.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'

interface Category {
  id: string
  name: string
}

const PostJobPage = () => {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch user role and categories on mount
  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/signup')
        return
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profileError) {
        console.error(profileError)
        setRole(null)
      } else {
        setRole(profile?.role)
      }
      // Fetch job categories for dropdown
      const { data: cats, error: catsError } = await supabase
        .from('job_categories')
        .select('*')
      if (catsError) {
        console.error(catsError)
      } else {
        setCategories(cats as Category[])
      }
      setLoadingUser(false)
    }
    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title || !budget) {
      setError('Гарчиг болон төлөвлөсөн үнийг заавал бөглөнө үү.')
      return
    }
    const numericBudget = parseFloat(budget)
    if (isNaN(numericBudget) || numericBudget <= 0) {
      setError('Төлөвлөсөн үнэ зөв тоон утга байх ёстой.')
      return
    }
    setSubmitting(true)
    // Retrieve user again to get client id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Хэрэглэгч олдсонгүй')
      setSubmitting(false)
      return
    }
    // Insert the project
    const { error: insertError } = await supabase.from('projects').insert({
      client_id: user.id,
      title,
      description,
      budget: numericBudget,
      category_id: categoryId,
      status: 'open',
    })
    if (insertError) {
      setError(insertError.message)
    } else {
      // Redirect to dashboard or clear form
      router.push('/dashboard')
    }
    setSubmitting(false)
  }

  // Redirect non‑clients
  if (!loadingUser && role !== 'client') {
    return <p className="p-4">Зөвхөн захиалагчид ажлыг нийтлэх боломжтой.</p>
  }
  if (loadingUser) {
    return <p className="p-4">Уншиж байна...</p>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Ажил нийтлэх</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Гарчиг
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Төслийн дэлгэрэнгүй
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Төлөвлөсөн үнэ (төгрөг)
          </label>
          <input
            id="budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="1"
            step="0.01"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Ангилал (сонголттой)
          </label>
          <select
            id="category"
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">— Ангилал сонгох —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {submitting ? 'Нийтэлж байна...' : 'Ажил нийтлэх'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostJobPage
