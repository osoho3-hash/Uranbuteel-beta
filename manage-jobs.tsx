// pages/manage-jobs.tsx
// -----------------------------------------------------------------------------
// Client management page.  Shows a list of jobs posted by the currently
// authenticated client.  Each job links to a proposals review page where the
// client can view and act on the proposals submitted by freelancers.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../utils/supabaseClient'

interface Project {
  id: string
  title: string
  status: string
  created_at: string
}

const ManageJobsPage = () => {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/signup')
        return
      }
      // Get user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profileError) {
        console.error(profileError)
        setRole(null)
        setLoading(false)
        return
      }
      setRole(profile?.role)
      if (profile?.role === 'client') {
        // fetch projects posted by this client
        const { data: projs, error: projsError } = await supabase
          .from('projects')
          .select('id, title, status, created_at')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
        if (!projsError && projs) {
          setProjects(projs as Project[])
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) {
    return <p className="p-4">Уншиж байна...</p>
  }
  if (role !== 'client') {
    return <p className="p-4">Зөвхөн захиалагчид өөрийн ажлыг удирдах боломжтой.</p>
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Миний ажлууд</h1>
      {projects.length === 0 ? (
        <p>Та одоогоор ажил нийтлээгүй байна.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <Link key={proj.id} href={`/manage-jobs/${proj.id}`} passHref>
              <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white">
                <h2 className="text-lg font-semibold">{proj.title}</h2>
                <p className="text-sm text-gray-600">Төлөв: {proj.status === 'open' ? 'Нээлттэй' : proj.status === 'in_progress' ? 'Явцын шатанд' : proj.status === 'completed' ? 'Дууссан' : 'Цуцлагдсан'}</p>
                <p className="text-xs text-gray-400">Оруулсан: {new Date(proj.created_at).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManageJobsPage