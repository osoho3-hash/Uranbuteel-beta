// pages/browse-jobs.tsx
// -----------------------------------------------------------------------------
// This page allows a "Гүйцэтгэгч" (freelancer) to browse open jobs.  It
// queries the `projects` table for jobs with status 'open' and displays
// them in a list.  Freelancers can optionally filter jobs by category.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'

interface Category {
  id: string
  name: string
}

interface Project {
  id: string
  title: string
  description: string | null
  budget: number | null
  category_id: string | null
  created_at: string
  client_id: string
}

const BrowseJobsPage = () => {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Initial fetch: user role and categories
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
      // Fetch categories
      const { data: cats, error: catsError } = await supabase
        .from('job_categories')
        .select('*')
      if (!catsError && cats) {
        setCategories(cats as Category[])
      }
      setLoadingUser(false)
    }
    init()
  }, [router])

  // Fetch projects whenever selectedCategory changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true)
      let query = supabase
        .from('projects')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }
      const { data: projs, error: projsError } = await query
      if (projsError) {
        console.error(projsError)
      } else {
        setProjects(projs as Project[])
      }
      setLoadingProjects(false)
    }
    if (!loadingUser && role === 'freelancer') {
      fetchProjects()
    }
  }, [selectedCategory, loadingUser, role])

  // Redirect non‑freelancers
  if (!loadingUser && role !== 'freelancer') {
    return <p className="p-4">Зөвхөн гүйцэтгэгчид ажлын жагсаалтыг үзэх боломжтой.</p>
  }
  if (loadingUser) {
    return <p className="p-4">Уншиж байна...</p>
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Нээлттэй ажлууд</h1>
      <div className="mb-4">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">
            Ангилалын шүүлтүүр
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">— Бүх ангилал —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
      </div>
      {loadingProjects ? (
        <p>Нээлттэй ажлуудыг ачааллаж байна...</p>
      ) : projects.length === 0 ? (
        <p>Илэрц алга.</p>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-md p-4 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-sm text-gray-700 mb-2 line-clamp-3">{project.description}</p>
              <p className="font-medium text-gray-900">Төлөвлөсөн үнэ: {project.budget?.toLocaleString()}₮</p>
              <p className="text-xs text-gray-500">Оруулсан: {new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowseJobsPage
