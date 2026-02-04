import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'

const JobDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    if (id) {
      supabase.from('projects').select('*').eq('id', id).single().then(({data}) => setJob(data))
    }
  }, [id])

  if (!job) return <p className="p-10">Уншиж байна...</p>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="text-xl text-green-600 my-4">Төсөв: {job.budget}₮</p>
      <div className="prose">{job.description}</div>
      <button className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded">Санал илгээх</button>
    </div>
  )
}
export default JobDetail
