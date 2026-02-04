// pages/signup.tsx
// -----------------------------------------------------------------------------
// Registration page for UranButeel.  This page allows new users to create an
// account by providing an email, password and selecting whether they are a
// “Захиалагч” (client) or “Гүйцэтгэгч” (freelancer).  Upon successful sign
// up, the user's role is stored as metadata in Supabase Auth and a row is
// created in the `profiles` table.  The page uses Tailwind CSS for styling.

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'

const SignupPage = () => {
  const router = useRouter()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'client' | 'freelancer'>('freelancer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handles the sign‑up event
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна')
      return
    }
    setLoading(true)
    try {
      // 1. Create the auth user and attach the selected role as metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      })
      if (signUpError || !signUpData.user) {
        throw signUpError || new Error('Sign up failed')
      }

      // 2. Insert a row into the profiles table (roles and other info)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        role,
        full_name: null,
      })
      if (profileError) {
        // If profile insertion fails you might want to delete the auth user or
        // handle the error gracefully.  For simplicity we just throw here.
        throw profileError
      }

      // 3. Redirect to dashboard (or ask user to verify email if email
      // confirmation is enforced in your Supabase project)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">Бүртгүүлэх</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="my-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Имэйл
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="my-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="my-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Нууц үг давтах
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="my-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Үүрэг
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'client' | 'freelancer')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="client">Захиалагч</option>
                <option value="freelancer">Гүйцэтгэгч</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Бүртгүүлж байна...' : 'Бүртгүүлэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
