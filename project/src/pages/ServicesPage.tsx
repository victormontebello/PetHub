import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Sparkles, Heart, Shield, Users } from 'lucide-react';
import { getServices, addToFavorites, removeFromFavorites, getUserFavorites } from '../lib/database';
import type { Service } from '../lib/database';

export const ServicesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceTypes = [
    { id: 'all', name: 'Todos os Serviços' },
    { id: 'grooming', name: 'Cuidados de Pets' },
    { id: 'sitting', name: 'Cuidado de Pets' },
    { id: 'walking', name: 'Caminhada de Cães' },
    { id: 'training', name: 'Treinamento de Pets' },
    { id: 'veterinary', name: 'Veterinária' },
    { id: 'boarding', name: 'Alojamento de Pets' }
  ];

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'grooming':
        return Sparkles;
      case 'sitting':
      case 'boarding':
        return Heart;
      case 'walking':
        return Users;
      case 'training':
      case 'veterinary':
        return Shield;
      default:
        return Heart;
    }
  };

  useEffect(() => {
    fetchServices();
    fetchFavorites();
  }, [selectedService, searchQuery]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedService !== 'all') {
        filters.category = selectedService;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const data = await getServices(filters);
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await getUserFavorites();
      const serviceFavorites = data
        .filter(fav => fav.item_type === 'service')
        .map(fav => fav.item_id);
      setFavorites(serviceFavorites);
    } catch (err) {
      // User might not be logged in
      setFavorites([]);
    }
  };

  const toggleFavorite = async (serviceId: string) => {
    try {
      const isFavorited = favorites.includes(serviceId);
      
      if (isFavorited) {
        await removeFromFavorites(serviceId, 'service');
        setFavorites(favorites.filter(id => id !== serviceId));
      } else {
        await addToFavorites(serviceId, 'service');
        setFavorites([...favorites, serviceId]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    </div>
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
            Serviços de Pets Profissionais
          </h1>
          <p className="text-lg text-gray-600">
            Conecte-se com profissionais confiáveis em sua área
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Procurar por serviços ou fornecedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Service Type Filter */}
            <div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {serviceTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
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
            Mostrando {services.length} serviços
          </p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus critérios de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => {
              const ServiceIcon = getServiceIcon(service.category);
              return (
                <div key={service.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Provider Image/Icon */}
                      <div className="relative">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.title}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                            <ServiceIcon className="h-8 w-8 text-primary-600" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-primary-500 p-1.5 rounded-full">
                          <ServiceIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                            <p className="text-sm text-gray-600">por {service.profiles?.full_name || 'Fornecedor'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              ${service.price_from}
                              {service.price_to && service.price_to !== service.price_from && ` - $${service.price_to}`}
                            </div>
                            {service.profiles && service.profiles.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">{service.profiles.rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-400">({service.profiles.total_reviews})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-500 mb-3">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{service.location}</span>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{service.description}</p>

                        {/* Category Badge */}
                        <div className="mb-4">
                          <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                            {service.category.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <button className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium">
                            Contato Fornecedor
                          </button>
                          <button 
                            onClick={() => toggleFavorite(service.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Heart className={`h-5 w-5 transition-colors ${
                              favorites.includes(service.id) 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-600'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {services.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium">
              Carregar mais serviços
            </button>
          </div>
        )}
      </div>
    </div>
  );
};