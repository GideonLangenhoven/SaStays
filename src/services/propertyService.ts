import { db, withRetry, supabase } from '@/lib/supabase'
// IMPORTANT: You must generate '@/types/database' using the Supabase CLI or provide your own Database type.
// For now, we provide fallback types to prevent TypeScript errors.
// Remove the fallbacks and use your real Database type for full type safety.
// import type { PropertyFormData, Property, Availability } from '@/types/database'
type PropertyFormData = any;
type Property = any;
type Availability = any;

export class PropertyService {
  // Create new property
  static async createProperty(ownerId: string, data: PropertyFormData): Promise<Property> {
    try {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      const propertyData = {
        ...data,
        owner_id: ownerId,
        slug: `${slug}-${Date.now()}`,
        is_active: false, // Start as inactive until owner activates
        main_image_url: data.image_urls?.[0] || null
      }

      const property = await db.properties.create(propertyData)

      // Initialize availability calendar for the next 2 years
      await this.initializeAvailabilityCalendar(property.id)

      return property
    } catch (error) {
      console.error('Error creating property:', error)
      throw new Error('Failed to create property')
    }
  }

  // Update existing property
  static async updateProperty(propertyId: string, data: Partial<PropertyFormData>): Promise<Property> {
    try {
      const updateData = {
        ...data,
        main_image_url: data.image_urls?.[0] || null,
        updated_at: new Date().toISOString()
      }

      return await db.properties.update(propertyId, updateData)
    } catch (error) {
      console.error('Error updating property:', error)
      throw new Error('Failed to update property')
    }
  }

  // Get property by ID with reviews
  static async getPropertyById(propertyId: string): Promise<Property | null> {
    try {
      return await db.properties.getById(propertyId)
    } catch (error) {
      console.error('Error fetching property:', error)
      return null
    }
  }

  // Get properties by owner
  static async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            reviews!inner(overall_rating)
          `)
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Calculate average ratings
        return data.map(property => ({
          ...property,
          average_rating: property.reviews?.length > 0 
            ? property.reviews.reduce((sum: number, review: any) => sum + review.overall_rating, 0) / property.reviews.length
            : 0,
          review_count: property.reviews?.length || 0
        }))
      })
    } catch (error) {
      console.error('Error fetching owner properties:', error)
      return []
    }
  }

  // Search properties
  static async searchProperties(filters: {
    city?: string
    checkIn?: string
    checkOut?: string
    guests?: number
    minPrice?: number
    maxPrice?: number
    amenities?: string[]
    propertyType?: string
  }): Promise<Property[]> {
    try {
      return await withRetry(async () => {
        let query = supabase
          .from('properties')
          .select(`
            *,
            reviews(overall_rating, review_text, guest_name, created_at)
          `)
          .eq('is_active', true)

        // Apply filters
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`)
        }

        if (filters.guests) {
          query = query.gte('max_guests', filters.guests)
        }

        if (filters.minPrice) {
          query = query.gte('base_price', filters.minPrice)
        }

        if (filters.maxPrice) {
          query = query.lte('base_price', filters.maxPrice)
        }

        if (filters.propertyType) {
          query = query.eq('property_type', filters.propertyType)
        }

        if (filters.amenities && filters.amenities.length > 0) {
          query = query.contains('amenities', filters.amenities)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        // Filter by availability if dates provided
        let filteredData = data || []
        if (filters.checkIn && filters.checkOut) {
          filteredData = await this.filterByAvailability(filteredData, filters.checkIn, filters.checkOut)
        }

        // Calculate average ratings
        return filteredData.map(property => ({
          ...property,
          average_rating: property.reviews?.length > 0 
            ? property.reviews.reduce((sum: number, review: any) => sum + review.overall_rating, 0) / property.reviews.length
            : 0,
          review_count: property.reviews?.length || 0
        }))
      })
    } catch (error) {
      console.error('Error searching properties:', error)
      return []
    }
  }

  // Filter properties by availability
  private static async filterByAvailability(properties: Property[], checkIn: string, checkOut: string): Promise<Property[]> {
    const availableProperties: Property[] = []

    for (const property of properties) {
      const isAvailable = await this.checkPropertyAvailability(property.id, checkIn, checkOut)
      if (isAvailable) {
        availableProperties.push(property)
      }
    }

    return availableProperties
  }

  // Check if property is available for given dates
  static async checkPropertyAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const availability = await db.availability.getRange(propertyId, checkIn, checkOut)
      
      // Check if all dates are available
      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)
      const dateRange = []
      
      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        dateRange.push(d.toISOString().split('T')[0])
      }

      // Check for existing bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'pending'])
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)

      if (error) throw error

      // If there are overlapping bookings, property is not available
      if (bookings && bookings.length > 0) {
        return false
      }

      // Check availability calendar
      for (const date of dateRange) {
        const dayAvailability = availability.find((a: any) => a.date === date)
        if (dayAvailability && !dayAvailability.is_available) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error checking availability:', error)
      return false
    }
  }

  // Initialize availability calendar for new property
  private static async initializeAvailabilityCalendar(propertyId: string): Promise<void> {
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(startDate.getFullYear() + 2) // 2 years ahead

      const availabilityData: any[] = []
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        availabilityData.push({
          property_id: propertyId,
          date: d.toISOString().split('T')[0],
          is_available: true,
          custom_price: null,
          minimum_stay: null,
          notes: null
        })
      }

      // Insert in batches to avoid timeout
      const batchSize = 100
      for (let i = 0; i < availabilityData.length; i += batchSize) {
        const batch = availabilityData.slice(i, i + batchSize)
        await db.availability.updateRange(propertyId, batch)
      }
    } catch (error) {
      console.error('Error initializing availability calendar:', error)
      throw error
    }
  }

  // Update property availability
  static async updateAvailability(
    propertyId: string, 
    updates: Array<{
      date: string
      is_available: boolean
      custom_price?: number
      minimum_stay?: number
      notes?: string
    }>
  ): Promise<void> {
    try {
      const availabilityData = updates.map(update => ({
        property_id: propertyId,
        ...update
      }))

      await db.availability.updateRange(propertyId, availabilityData)
    } catch (error) {
      console.error('Error updating availability:', error)
      throw new Error('Failed to update availability')
    }
  }

  // Toggle property active status
  static async togglePropertyStatus(propertyId: string, isActive: boolean): Promise<Property> {
    try {
      return await db.properties.update(propertyId, { 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error toggling property status:', error)
      throw new Error('Failed to update property status')
    }
  }

  // Delete property
  static async deleteProperty(propertyId: string): Promise<void> {
    try {
      await withRetry(async () => {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', propertyId)

        if (error) throw error
      })
    } catch (error) {
      console.error('Error deleting property:', error)
      throw new Error('Failed to delete property')
    }
  }

  // Get property analytics
  static async getPropertyAnalytics(propertyId: string, startDate: string, endDate: string) {
    try {
      const [bookings, views] = await Promise.all([
        // Get bookings data
        withRetry(async () => {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('property_id', propertyId)
            .gte('check_in', startDate)
            .lte('check_out', endDate)
            .in('status', ['confirmed', 'completed'])

          if (error) throw error
          return data || []
        }),

        // In a real app, you'd track views in a separate table
        // For now, we'll return mock data
        Promise.resolve(Math.floor(Math.random() * 1000) + 100)
      ])

      const totalEarnings = bookings.reduce((sum: number, booking: any) => sum + booking.total_amount, 0)
      const totalNights = bookings.reduce((sum: number, booking: any) => sum + booking.nights, 0)
      const averageNightlyRate = totalNights > 0 ? totalEarnings / totalNights : 0

      return {
        totalBookings: bookings.length,
        totalEarnings,
        totalNights,
        averageNightlyRate,
        totalViews: views,
        conversionRate: views > 0 ? (bookings.length / views) * 100 : 0,
        occupancyRate: totalNights > 0 ? (totalNights / 365) * 100 : 0
      }
    } catch (error) {
      console.error('Error fetching property analytics:', error)
      return {
        totalBookings: 0,
        totalEarnings: 0,
        totalNights: 0,
        averageNightlyRate: 0,
        totalViews: 0,
        conversionRate: 0,
        occupancyRate: 0
      }
    }
  }
} 