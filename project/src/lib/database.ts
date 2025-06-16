import { supabase } from './supabase';

export interface Pet {
  id: string;
  seller_id: string;
  name: string;
  breed: string;
  category: string;
  age: string;
  is_donation: boolean;
  description: string;
  image_url: string;
  location: string;
  status: 'available' | 'pending' | 'adopted';
  health_checked: boolean;
  vaccinated: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    rating: number;
    total_reviews: number;
  };
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  price_from: number;
  price_to: number;
  location: string;
  image_url: string;
  status: string;
  availability: any; // jsonb
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'toys' | 'accessories' | 'health' | 'other';
  stock: number;
  image_url: string;
  status: 'available' | 'unavailable';
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    rating: number;
    total_reviews: number;
  };
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  avatar_url: string;
  user_type: 'veterinarian' | 'seller' | 'consumer';
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  customer_id: string;
  provider_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  veterinarian_id: string;
  pet_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    phone: string;
  };
  pets?: {
    name: string;
    breed: string;
  };
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

// Pet functions
export const getPets = async (filters?: {
  category?: string;
  search?: string;
  location?: string;
}) => {
  let query = supabase
    .from('pets')
    .select(`
      *,
      profiles:seller_id (
        full_name,
        rating,
        total_reviews
      )
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Pet[];
};

export const getPetById = async (id: string) => {
  const { data, error } = await supabase
    .from('pets')
    .select(`
      *,
      profiles:seller_id (
        full_name,
        phone,
        location,
        rating,
        total_reviews
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Pet;
};

export const createPet = async (pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single();

  if (error) throw error;
  return data as Pet;
};

export const updatePet = async (id: string, updates: Partial<Pet>) => {
  const { data, error } = await supabase
    .from('pets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Pet;
};

export const deletePet = async (id: string) => {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Service functions
export const getServices = async (filters?: {
  category?: string;
  search?: string;
  location?: string;
  maxPrice?: number;
}) => {
  let query = supabase
    .from('services')
    .select(`
      *,
      profiles:provider_id (
        full_name,
        rating,
        total_reviews
      )
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Service[];
};

export const getServiceById = async (id: string) => {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      profiles:provider_id (
        full_name,
        phone,
        location,
        rating,
        total_reviews
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Service;
};

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single();

  if (error) throw error;
  return data as Service;
};

export const updateService = async (id: string, updates: Partial<Service>) => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Service;
};

export const deleteService = async (id: string) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

// Favorites functions
export const addToFavorites = async (itemId: string, itemType: 'pet' | 'service') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User must be authenticated to add favorites');
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromFavorites = async (itemId: string, itemType: 'pet' | 'service') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User must be authenticated to remove favorites');
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const getUserFavorites = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Booking functions
export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

export const getUserBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services (
        title,
        category
      ),
      profiles:provider_id (
        full_name,
        phone
      )
    `)
    .eq('customer_id', user.id)
    .order('booking_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getProviderBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return [];
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services (
        title,
        category
      ),
      profiles:customer_id (
        full_name,
        phone
      )
    `)
    .eq('provider_id', user.id)
    .order('booking_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Appointment functions
export const getAppointments = async (userId: string, userType: 'veterinarian' | 'consumer') => {
  const query = userType === 'veterinarian' 
    ? supabase
        .from('appointments')
        .select(`
          *,
          profiles:pet_id (
            full_name,
            phone
          ),
          pets:pet_id (
            name,
            breed
          )
        `)
        .eq('veterinarian_id', userId)
    : supabase
        .from('appointments')
        .select(`
          *,
          profiles:veterinarian_id (
            full_name,
            phone
          ),
          pets:pet_id (
            name,
            breed
          )
        `)
        .eq('pet_id', userId);

  const { data, error } = await query;
  if (error) throw error;
  return data as Appointment[];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
};

// Review functions
export const getReviews = async (userId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:reviewer_id (
        full_name,
        avatar_url
      )
    `)
    .eq('reviewed_id', userId);

  if (error) throw error;
  return data as Review[];
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
};

// Product functions
export const getProducts = async (filters?: {
  category?: string;
  search?: string;
  maxPrice?: number;
}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (
        full_name,
        rating,
        total_reviews
      )
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
};