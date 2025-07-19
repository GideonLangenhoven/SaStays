import { supabase } from './supabase'
import type { User, AuthError } from '@supabase/supabase-js'
// IMPORTANT: You must generate '@/types/database' using the Supabase CLI or provide your own Database type.
// For now, we provide a fallback type to prevent TypeScript errors.
// Remove the fallback and use your real Database type for full type safety.
// import type { Database } from '@/types/database'
type Database = any;

export type UserProfile = Database['public']['Tables']['users']['Row']

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  // Sign up new user
  static async signUp({ email, password, fullName, phone }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null
          }
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            phone: phone || null,
            is_verified: false
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw here as auth was successful
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Sign in user
  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as AuthError }
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Verify email
  static async verifyEmail(token: string, type: string) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }
}

// src/hooks/useAuth.ts
import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<{ data: any; error: AuthError | null }>
  signIn: (data: SignInData) => Promise<{ data: any; error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const userProfile = await AuthService.getUserProfile(session.user.id)
          setProfile(userProfile)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const userProfile = await AuthService.getUserProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (data: SignUpData) => {
    setLoading(true)
    setError(null)
    
    const result = await AuthService.signUp(data)
    if (result.error) {
      setError(result.error.message)
    }
    
    setLoading(false)
    return result
  }

  const signIn = async (data: SignInData) => {
    setLoading(true)
    setError(null)
    
    const result = await AuthService.signIn(data)
    if (result.error) {
      setError(result.error.message)
    }
    
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    await AuthService.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    
    setLoading(true)
    const result = await AuthService.updateProfile(user.id, updates)
    if (result.data) {
      setProfile(result.data)
    }
    setLoading(false)
  }

  const refreshProfile = async () => {
    if (!user) return
    
    const userProfile = await AuthService.getUserProfile(user.id)
    setProfile(userProfile)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected route component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sea"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login page
    window.location.href = '/login'
    return null
  }

  return <>{children}</>
}

// Role-based access control
export function usePermissions() {
  const { user, profile } = useAuth()

  return {
    canManageProperty: (propertyOwnerId: string) => {
      return user?.id === propertyOwnerId
    },
    canViewBooking: (bookingPropertyOwnerId: string) => {
      return user?.id === bookingPropertyOwnerId
    },
    isVerified: () => {
      return profile?.is_verified || false
    },
    isAuthenticated: () => {
      return !!user
    }
  }
} 