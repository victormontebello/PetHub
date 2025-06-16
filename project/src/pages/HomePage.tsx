import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  PawPrint, 
  Heart, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign,
  Stethoscope,
  ShoppingBag,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Seguro & Verificado',
      description: 'Todos os vendedores são verificados e os pets são checados para sua tranquilidade.'
    },
    {
      icon: Users,
      title: 'Comunidade Confiável',
      description: 'Junte-se a milhares de amantes de animais, criadores e fornecedores de serviços em todo o Brasil.'
    },
    {
      icon: Star,
      title: 'Qualidade Garantida',
      description: 'Pets premium e serviços profissionais com avaliações e classificações.'
    }
  ];

  const categories = [
    { name: 'Dogs', count: '2,500+', image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400', color: 'bg-primary-500' },
    { name: 'Cats', count: '1,800+', image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400', color: 'bg-secondary-500' },
    { name: 'Birds', count: '650+', image: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=400', color: 'bg-accent-500' },
    { name: 'Fish', count: '400+', image: 'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=400', color: 'bg-primary-600' }
  ];

  const services = [
    { name: 'Pet Grooming', providers: '200+', icon: ShoppingBag },
    { name: 'Pet Sitting', providers: '150+', icon: Heart },
    { name: 'Veterinary', providers: '80+', icon: Stethoscope },
    { name: 'Training', providers: '120+', icon: Star }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-16 pb-24">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Encontre Seu Amigo Pet
                <span className="text-primary-600 block">Pet</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Descubra pets amorosos, criadores confiáveis e serviços de animais profissionais
                em um único marketplace seguro. Seu caminho com os pets começa aqui.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/pets"
                  className="bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group font-semibold"
                >
                  Navegar Pets
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-lg hover:bg-primary-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center font-semibold"
                >
                  Serviços de Pets
                </Link>
              </div>
            </div>
            <div className="relative animate-bounce-gentle">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/4587955/pexels-photo-4587955.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Happy pets"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" alt="" />
                        <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100" alt="" />
                        <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">10,000+ Famílias Felizes</p>
                        <p className="text-xs text-gray-600">Encontraram seus pets perfeitos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher PetHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos comprometidos em criar a plataforma mais segura e confiável para adoção de pets e serviços.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pet Categories */}
      <section className="py-20 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Categorias de Pets Populares
            </h2>
            <p className="text-xl text-gray-600">
              Encontre seu companheiro perfeito entre nossa diversa seleção
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/pets"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="aspect-square">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-primary-200">{category.count} disponíveis</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serviços de Pets Profissionais
            </h2>
            <p className="text-xl text-gray-600">
              Conecte-se com profissionais confiáveis em sua área
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary-50 transition-colors group">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <service.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-primary-600 font-medium">{service.providers} fornecedores</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="bg-secondary-500 text-white px-8 py-4 rounded-lg hover:bg-secondary-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center font-semibold"
            >
              Ver Todos os Serviços
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <PawPrint className="h-16 w-16 text-primary-200 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Encontrar Seu Novo Melhor Amigo?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de proprietários de pets felizes que encontraram seus companheiros perfeitos através do PetHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pets"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Iniciar Navegação
            </Link>
            <Link
              to="/auth"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              Listar Seu Pet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};