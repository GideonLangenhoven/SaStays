// IMPORTANT: You must generate '@/types/database' using the Supabase CLI or provide your own Database type.
// If you do not have this file, see: https://supabase.com/docs/reference/javascript/typescript-support
// For now, we provide a fallback type to prevent TypeScript errors.
// Remove the fallback and use your real Database type for full type safety.
// import type { Database } from '@/types/database'
type Database = any;

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// If Supabase environment variables are missing, provide fallback values
// This allows the app to run without Supabase configured
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder_key'

const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey

// Client-side Supabase client
export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-client-info': 'property-management-app@1.0.0'
    }
  }
})

// Service role client for server-side operations
export const supabaseAdmin = createClient<Database>(
  finalUrl,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || fallbackKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Retry wrapper for critical operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      )
    }
  }

  throw lastError!
}

// Database types for type safety
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Common database operations with retry logic
export const db = {
  // Properties
  properties: {
    async getAll() {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
      })
    },

    async getById(id: string) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            reviews (
              overall_rating,
              review_text,
              guest_name,
              created_at
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single()
        
        if (error) throw error
        return data
      })
    },

    async create(property: InsertTables<'properties'>) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('properties')
          .insert(property)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    },

    async update(id: string, updates: UpdateTables<'properties'>) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('properties')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    }
  },

  // Bookings
  bookings: {
    async create(booking: InsertTables<'bookings'>) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('bookings')
          .insert(booking)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    },

    async getByProperty(propertyId: string) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('property_id', propertyId)
          .order('check_in', { ascending: true })
        
        if (error) throw error
        return data
      })
    },

    async updateStatus(id: string, status: string, paymentStatus?: string) {
      return withRetry(async () => {
        const updates: Record<string, unknown> = { status }
        if (paymentStatus) updates.payment_status = paymentStatus
        
        const { data, error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        return data
      })
    }
  },

  // Availability
  availability: {
    async getRange(propertyId: string, startDate: string, endDate: string) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('property_availability')
          .select('*')
          .eq('property_id', propertyId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })
        
        if (error) throw error
        return data
      })
    },

    async updateRange(propertyId: string, updates: InsertTables<'property_availability'>[]) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from('property_availability')
          .upsert(updates, { 
            onConflict: 'property_id,date',
            ignoreDuplicates: false 
          })
          .select()
        
        if (error) throw error
        return data
      })
    }
  }
}

// Real-time subscriptions
export const subscriptions = {
  bookings: (propertyId: string, callback: (payload: unknown) => void) => {
    return supabase
      .channel(`bookings:${propertyId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `property_id=eq.${propertyId}`
        }, 
        callback
      )
      .subscribe()
  },

  availability: (propertyId: string, callback: (payload: unknown) => void) => {
    return supabase
      .channel(`availability:${propertyId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'property_availability',
          filter: `property_id=eq.${propertyId}`
        }, 
        callback
      )
      .subscribe()
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    return !error
  } catch {
    return false
  }
} 