import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, Star, Camera, Shield } from 'lucide-react';
import { getPets, addToFavorites, removeFromFavorites, getUserFavorites } from '../lib/database';
import type { Pet } from '../lib/database';

export const PetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [pets, setPets] = useState<Pet[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Pets' },
    { id: 'dogs', name: 'Dogs' },
    { id: 'cats', name: 'Cats' },
    { id: 'birds', name: 'Birds' },
    { id: 'fish', name: 'Fish' },
    { id: 'rabbits', name: 'Rabbits' },
    { id: 'hamsters', name: 'Hamsters' }
  ];

  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: '0-500', name: 'Under $500' },
    { id: '500-1000', name: '$500 - $1,000' },
    { id: '1000-2000', name: '$1,000 - $2,000' },
    { id: '2000+', name: '$2,000+' }
  ];

  useEffect(() => {
    fetchPets();
    fetchFavorites();
  }, [selectedCategory, searchQuery]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const data = await getPets(filters);
      setPets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await getUserFavorites();
      const petFavorites = data
        .filter(fav => fav.item_type === 'pet')
        .map(fav => fav.item_id);
      setFavorites(petFavorites);
    } catch (err) {
      // User might not be logged in
      setFavorites([]);
    }
  };

  const toggleFavorite = async (petId: string) => {
    try {
      const isFavorited = favorites.includes(petId);
      
      if (isFavorited) {
        await removeFromFavorites(petId, 'pet');
        setFavorites(favorites.filter(id => id !== petId));
      } else {
        await addToFavorites(petId, 'pet');
        setFavorites([...favorites, petId]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredPets = pets.filter(pet => {
    if (priceRange === 'all') return true;
    
    const price = pet.price;
    switch (priceRange) {
      case '0-500':
        return price < 500;
      case '500-1000':
        return price >= 500 && price < 1000;
      case '1000-2000':
        return price >= 1000 && price < 2000;
      case '2000+':
        return price >= 2000;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Encontre Seu Amigo Pet Perfeito
          </h1>
          <p className="text-lg text-gray-600">
            Descubra pets amorosos de vendedores verificados e resgates
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Procurar por nome ou raça..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredPets.length} de {pets.length} pets
          </p>
        </div>

        {/* Pet Grid */}
        {filteredPets.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pet encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus critérios de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img
                    src={pet.image_url || 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={pet.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button 
                    onClick={() => toggleFavorite(pet.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart className={`h-5 w-5 transition-colors ${
                      favorites.includes(pet.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600 hover:text-red-500'
                    }`} />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${pet.price.toLocaleString()}
                  </div>
                  {pet.health_checked && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white p-1.5 rounded-full">
                      <Shield className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{pet.name}</h3>
                      <p className="text-gray-600">{pet.breed} • {pet.age}</p>
                    </div>
                    {pet.profiles && pet.profiles.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{pet.profiles.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{pet.location}</span>
                  </div>

                  {pet.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{pet.description}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Vendedor</p>
                      <p className="text-sm font-medium text-gray-900">
                        {pet.profiles?.full_name || 'Anonymous'}
                      </p>
                    </div>
                    <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                      Contato
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredPets.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium">
              Carregar mais pets
            </button>
          </div>
        )}
      </div>
    </div>
  );
};