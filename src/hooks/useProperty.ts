import { useState, useEffect } from 'react'
import { PropertyService } from '@/services/propertyService'
import { useAuth } from '@/lib/auth'
// IMPORTANT: You must generate '@/types/database' using the Supabase CLI or provide your own Database type.
// For now, we provide fallback types to prevent TypeScript errors.
// Remove the fallbacks and use your real Database type for full type safety.
// import type { Property, PropertyFormData } from '@/types/database'
type Property = any;
type PropertyFormData = any;

export function useProperty(propertyId?: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = async () => {
    if (!propertyId) return

    setLoading(true)
    setError(null)

    try {
      const data = await PropertyService.getPropertyById(propertyId)
      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch property')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  return { property, loading, error, refetch: fetchProperty }
}

export function useProperties() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const data = await PropertyService.getPropertiesByOwner(user.id)
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }

  const createProperty = async (data: PropertyFormData) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    try {
      const newProperty = await PropertyService.createProperty(user.id, data)
      setProperties(prev => [newProperty, ...prev])
      return newProperty
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProperty = async (propertyId: string, data: Partial<PropertyFormData>) => {
    setLoading(true)
    try {
      const updatedProperty = await PropertyService.updateProperty(propertyId, data)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p)
      )
      return updatedProperty
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const togglePropertyStatus = async (propertyId: string, isActive: boolean) => {
    try {
      const updatedProperty = await PropertyService.togglePropertyStatus(propertyId, isActive)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property status')
      throw err
    }
  }

  const deleteProperty = async (propertyId: string) => {
    try {
      await PropertyService.deleteProperty(propertyId)
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property')
      throw err
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [user])

  return {
    properties,
    loading,
    error,
    createProperty,
    updateProperty,
    togglePropertyStatus,
    deleteProperty,
    refetch: fetchProperties
  }
} 