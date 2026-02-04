import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import Link from 'next/link'

const BrowseJobs = () => {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'open')
      if (data) setProjects(data)
    }
    fetchJobs()
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Нээлттэй ажлууд</h1>
      <div className="grid gap-4">
        {projects.map(job => (
          <div key={job.id} className="border p-4 rounded hover:shadow-lg transition">
            <h2 className="text-xl font-bold">{job.title}</h2>
            <p className="text-gray-600 mb-2">{job.description}</p>
            <Link href={`/jobs/${job.id}`} className="text-indigo-600 font-semibold">Дэлгэрэнгүй харах</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
export default BrowseJobs
