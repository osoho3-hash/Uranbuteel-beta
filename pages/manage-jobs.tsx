import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

const ManageJobs = () => {
  const [myJobs, setMyJobs] = useState<any[]>([])

  useEffect(() => {
    const fetchMyJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('projects').select('*').eq('client_id', user?.id)
      if (data) setMyJobs(data)
    }
    fetchMyJobs()
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Миний нийтэлсэн ажлууд</h1>
      {myJobs.map(job => (
        <div key={job.id} className="border-b py-4">
          <h3 className="font-bold">{job.title}</h3>
          <p className="text-sm text-gray-500">Төлөв: {job.status}</p>
        </div>
      ))}
    </div>
  )
}
export default ManageJobs
