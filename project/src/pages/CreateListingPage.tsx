import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X } from 'lucide-react';
import { createService, createProduct } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

type ListingType = 'service' | 'product';

export const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<ListingType>('service');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    location: '',
    status: 'available' as const
  });

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    status: 'available' as const
  });

  const serviceCategories = [
    { value: 'grooming', label: 'Banho e Tosa' },
    { value: 'veterinary', label: 'Veterinário' },
    { value: 'training', label: 'Adestramento' },
    { value: 'boarding', label: 'Hospedagem' },
    { value: 'other', label: 'Outro' }
  ];

  const productCategories = [
    { value: 'food', label: 'Alimentação' },
    { value: 'toys', label: 'Brinquedos' },
    { value: 'accessories', label: 'Acessórios' },
    { value: 'health', label: 'Saúde' },
    { value: 'other', label: 'Outro' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('listings')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrlData.publicUrl;
      }

      if (listingType === 'service') {
        await createService({
          ...serviceData,
          price: Number(serviceData.price),
          provider_id: user?.id || '',
          image_url: imageUrl,
          category: serviceData.category as 'grooming' | 'veterinary' | 'training' | 'boarding' | 'other',
        });
      } else {
        await createProduct({
          ...productData,
          price: Number(productData.price),
          stock: Number(productData.stock),
          seller_id: user?.id || '',
          image_url: imageUrl,
          category: productData.category as 'food' | 'toys' | 'accessories' | 'health' | 'other',
        });
      }

      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Criar Novo Anúncio
            </h1>
            <p className="text-gray-600">
              Preencha os detalhes do seu serviço ou produto
            </p>
          </div>

          {/* Type Selector */}
          <div className="mb-8">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setListingType('service')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                  listingType === 'service'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Serviço
              </button>
              <button
                type="button"
                onClick={() => setListingType('product')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                  listingType === 'product'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Produto
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                        >
                          <span>Upload uma imagem</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={listingType === 'service' ? serviceData.name : productData.name}
                  onChange={(e) =>
                    listingType === 'service'
                      ? setServiceData({ ...serviceData, name: e.target.value })
                      : setProductData({ ...productData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={listingType === 'service' ? serviceData.description : productData.description}
                  onChange={(e) =>
                    listingType === 'service'
                      ? setServiceData({ ...serviceData, description: e.target.value })
                      : setProductData({ ...productData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={listingType === 'service' ? serviceData.category : productData.category}
                  onChange={(e) =>
                    listingType === 'service'
                      ? setServiceData({ ...serviceData, category: e.target.value })
                      : setProductData({ ...productData, category: e.target.value })
                  }
                >
                  <option value="">Selecione uma categoria</option>
                  {(listingType === 'service' ? serviceCategories : productCategories).map(
                    (category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={listingType === 'service' ? serviceData.price : productData.price}
                    onChange={(e) =>
                      listingType === 'service'
                        ? setServiceData({ ...serviceData, price: e.target.value })
                        : setProductData({ ...productData, price: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Service-specific fields */}
              {listingType === 'service' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={serviceData.location}
                    onChange={(e) =>
                      setServiceData({ ...serviceData, location: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Product-specific fields */}
              {listingType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={productData.stock}
                    onChange={(e) =>
                      setProductData({ ...productData, stock: e.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Criar Anúncio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 