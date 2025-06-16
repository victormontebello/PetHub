import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  Star,
  PawPrint,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { ContactCard } from '../components/ContactCard';
import { getUserFavorites, getPetById, getServiceById, createService } from '../lib/database';

interface Pet {
  id: string;
  seller_id: string;
  name: string;
  breed: string;
  age: string;
  is_donation: boolean;
  description: string;
  image_url: string;
  category: string;
  location: string;
  status: 'available' | 'adopted' | 'pending';
  created_at: string;
  vaccines?: string[];
}

interface Service {
  id: string;
  title: string;
  description: string;
  price_from: number;
  price_to: number;
  category: string;
  location: string;
  image_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'pets' | 'services' | 'favorites' | 'settings'>('overview');
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: '',
    user_type: 'consumer'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
    category: '',
    location: '',
    status: 'available',
    is_donation: true
  });
  const [addingPet, setAddingPet] = useState(false);
  const [vaccineInput, setVaccineInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [availableVaccines, setAvailableVaccines] = useState<{id: string, name: string}[]>([]);
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [favoritePets, setFavoritePets] = useState<any[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<any[]>([]);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price_from: '',
    price_to: '',
    category: '',
    location: '',
    status: 'active',
    availability: '',
  });
  const [addingService, setAddingService] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  // Lista de categorias possíveis
  const petCategories = [
    { value: 'dogs', label: 'Cachorro' },
    { value: 'cats', label: 'Gato' },
    { value: 'birds', label: 'Pássaro' },
    { value: 'fish', label: 'Peixe' },
    { value: 'rabbits', label: 'Coelho' },
    { value: 'hamsters', label: 'Hamster' },
    { value: 'other', label: 'Outro' },
  ];

  const serviceCategories = [
    { value: 'grooming', label: 'Banho & Tosa' },
    { value: 'veterinary', label: 'Veterinário' },
    { value: 'training', label: 'Adestramento' },
    { value: 'boarding', label: 'Hotelzinho' },
    { value: 'other', label: 'Outro' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      // Garante que o perfil existe na tabela 'profiles'
      supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email || '',
        // outros campos podem ser preenchidos aqui se necessário
      });
      fetchUserProfile();
      fetchUserPets();
      fetchUserServices();
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    const fetchVaccines = async () => {
      const { data, error } = await supabase.from('vaccines').select('*').order('name');
      if (!error && data) setAvailableVaccines(data);
    };
    fetchVaccines();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        return;
      }

      if (data && data.length > 0) {
        const petsWithVaccines = await Promise.all(data.map(async (pet: any) => {
          const { data: petVaccines } = await supabase
            .from('pet_vaccines')
            .select('vaccine_id, vaccines(name)')
            .eq('pet_id', pet.id);
          type PetVaccineRow = { vaccines?: { name?: string } };
          const vaccinesArr = (petVaccines as PetVaccineRow[] | null) || [];
          return {
            ...pet,
            vaccines: vaccinesArr.map(v => v.vaccines?.name || '').filter(Boolean)
          };
        }));
        setUserPets(petsWithVaccines);
      } else {
        setUserPets([]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setUserServices(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favorites = await getUserFavorites();
      setUserFavorites(favorites);
      // Separar por tipo
      const petFavorites = favorites.filter((fav: any) => fav.item_type === 'pet');
      const serviceFavorites = favorites.filter((fav: any) => fav.item_type === 'service');
      // Buscar detalhes dos pets favoritos
      const pets = await Promise.all(petFavorites.map(async (fav: any) => {
        try {
          return await getPetById(fav.item_id);
        } catch {
          return null;
        }
      }));
      setFavoritePets(pets.filter(Boolean));
      // Buscar detalhes dos serviços favoritos
      const services = await Promise.all(serviceFavorites.map(async (fav: any) => {
        try {
          return await getServiceById(fav.item_id);
        } catch {
          return null;
        }
      }));
      setFavoriteServices(services.filter(Boolean));
    } catch (err) {
      setUserFavorites([]);
      setFavoritePets([]);
      setFavoriteServices([]);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet listing?')) return;

    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) {
        console.error('Error deleting pet:', error);
        return;
      }

      fetchUserPets();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service listing?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        return;
      }

      fetchUserServices();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingPet(true);
    let imageUrl = '';
    try {
      // Garante que o perfil existe e aguarda a operação
      await ensureProfile();

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage.from('pets').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
      const { data: petData, error } = await supabase.from('pets').insert({
        ...newPet,
        seller_id: user?.id,
        created_at: new Date().toISOString(),
        image_url: imageUrl,
      }).select().single();
      if (error || !petData) {
        alert('Erro ao adicionar pet!');
        setAddingPet(false);
        return;
      }
      for (const vaccineId of selectedVaccines) {
        await supabase.from('pet_vaccines').insert({ pet_id: petData.id, vaccine_id: vaccineId });
      }
      setShowAddPetForm(false);
      setNewPet({
        name: '', 
        breed: '', 
        age: '', 
        description: '', 
        category: '', 
        location: '', 
        status: 'available', 
        is_donation: true
      });
      setImageFile(null);
      setSelectedVaccines([]);
      setVaccineInput('');
      fetchUserPets();
    } catch (err) {
      alert('Erro ao adicionar pet!');
    }
    setAddingPet(false);
  };

  const ensureProfile = async () => {
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      full_name: user?.user_metadata?.full_name || user?.email || '',
      // outros campos default se quiser
    });
    if (error) {
      throw new Error('Erro ao criar perfil do usuário');
    }
  };

  const handleShowContact = async (ownerId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', ownerId)
      .single();
    if (!error && data) {
      setContactInfo(data);
      setShowContactModal(true);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingService(true);
    let imageUrl = '';
    try {
      await ensureProfile();
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage.from('services').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('services').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
      await createService({
        provider_id: user?.id as string,
        title: newService.title,
        description: newService.description,
        category: newService.category,
        price_from: Number(newService.price_from),
        price_to: Number(newService.price_to),
        location: newService.location,
        image_url: imageUrl,
        status: newService.status,
        availability: newService.availability ? JSON.parse(newService.availability) : null,
      });
      setShowAddServiceForm(false);
      setNewService({
        title: '',
        description: '',
        price_from: '',
        price_to: '',
        category: '',
        location: '',
        status: 'active',
        availability: '',
      });
      setImageFile(null);
      fetchUserServices();
    } catch (err) {
      alert('Erro ao adicionar serviço!');
    }
    setAddingService(false);
  };

  const handleProfileImageClick = () => {
    setShowProfileImageModal(true);
  };

  const handleProfileImageUpload = async () => {
    if (!profileImageFile || !user) return;
    setUploadingProfileImage(true);
    try {
      const fileExt = profileImageFile.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      // Remove imagem antiga se existir
      await supabase.storage.from('profiles').remove([`${user.id}`]);
      // Faz upload da nova imagem
      const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, profileImageFile, { upsert: true });
      if (uploadError) throw uploadError;
      // Pega a URL pública
      const { data: publicUrlData } = supabase.storage.from('profiles').getPublicUrl(fileName);
      // Atualiza o perfil no banco
      await supabase.from('profiles').update({ avatar_url: publicUrlData.publicUrl }).eq('id', user.id);
      setProfileData((prev: any) => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
      setShowProfileImageModal(false);
      setProfileImageFile(null);
    } catch (err) {
      alert('Erro ao atualizar foto de perfil!');
    }
    setUploadingProfileImage(false);
  };

  const handleProfileImageRemove = async () => {
    if (!user) return;
    setUploadingProfileImage(true);
    try {
      // Remove do storage
      await supabase.storage.from('profiles').remove([`${user.id}.png`, `${user.id}.jpg`, `${user.id}.jpeg`, `${user.id}`]);
      // Remove do banco
      await supabase.from('profiles').update({ avatar_url: '' }).eq('id', user.id);
      setProfileData((prev: any) => ({ ...prev, avatar_url: '' }));
      setShowProfileImageModal(false);
      setProfileImageFile(null);
    } catch (err) {
      alert('Erro ao remover foto de perfil!');
    }
    setUploadingProfileImage(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
              <button
                onClick={() => navigate('/create-listing')}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Criar Novo Anúncio
              </button>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-10 py-14">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
                <div className="text-white flex-1">
                  <h1 className="text-4xl font-extrabold mb-3">
                    Carregando...
                  </h1>
                  <p className="text-primary-100 mb-2 text-lg">
                    Aguarde um momento, estamos carregando suas informações.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: User },
    { id: 'pets', name: 'Meus Pets', icon: PawPrint },
    { id: 'services', name: 'Meus Serviços', icon: Sparkles },
    { id: 'favorites', name: 'Favoritos', icon: Heart },
    { id: 'settings', name: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            <button
              onClick={() => navigate('/create-listing')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Criar Novo Anúncio
            </button>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-10 py-14">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer" onClick={handleProfileImageClick} title="Alterar foto de perfil">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt={profileData.full_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-white flex-1">
                <h1 className="text-4xl font-extrabold mb-3">
                  {profileData.full_name || user.email}
                </h1>
                <p className="text-primary-100 mb-2 text-lg">
                  Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
                {profileData.location && (
                  <div className="flex items-center space-x-2 mt-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-primary-100 text-base">{profileData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-10 py-8 bg-white border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-primary-50 rounded-2xl shadow flex flex-col items-center py-6">
                <div className="text-3xl font-extrabold text-primary-600 mb-1">{userPets.length}</div>
                <div className="text-gray-700 text-lg">Pets Listados</div>
              </div>
              <div className="bg-secondary-50 rounded-2xl shadow flex flex-col items-center py-6">
                <div className="text-3xl font-extrabold text-secondary-600 mb-1">{userServices.length}</div>
                <div className="text-gray-700 text-lg">Serviços Oferecidos</div>
              </div>
              <div className="bg-white rounded-2xl shadow flex flex-col items-center py-6 border border-yellow-100">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  <span className="text-3xl font-extrabold">4.8</span>
                </div>
                <div className="text-gray-700 text-lg">Avaliação Média</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-10 px-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-5 px-2 border-b-4 font-semibold text-base flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-6 w-6" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow p-10">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral do Perfil</h2>
                
                {profileData.bio ? (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Sobre Mim</h3>
                    <p className="text-gray-700">{profileData.bio}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
                    <p className="text-gray-500 mb-4">Complete seu perfil para construir confiança com potenciais compradores e clientes.</p>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Completar Perfil
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-primary-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Pets Listados Recentemente</h3>
                    {userPets.slice(0, 3).map((pet) => (
                      <div key={pet.id} className="flex items-center space-x-3 mb-3 last:mb-0">
                        <img 
                          src={pet.image_url} 
                          alt={pet.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pet.status === 'available' ? 'bg-green-100 text-green-800' :
                              pet.status === 'adopted' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pet.status === 'available' ? 'Disponível' : pet.status === 'adopted' ? 'Adotado' : 'Pendente'}
                            </span>
                            <span className="text-xs text-green-600 font-semibold">Doação</span>
                          </div>
                        </div>
                        {pet.vaccines && pet.vaccines.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {pet.vaccines.map((vac: string) => (
                              <span key={vac} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">{vac}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Serviços Recentes</h3>
                    {userServices.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 mb-3 last:mb-0">
                        <img 
                          src={service.image_url} 
                          alt={service.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pets' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meus Pets Listados</h2>
                {!showAddPetForm && (
                  <button onClick={() => setShowAddPetForm(true)} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Adicionar Novo Pet</span>
                  </button>
                )}
              </div>

              {showAddPetForm ? (
                <form onSubmit={handleAddPet} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newPet.name} onChange={e => setNewPet({ ...newPet, name: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newPet.breed} onChange={e => setNewPet({ ...newPet, breed: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newPet.age} onChange={e => setNewPet({ ...newPet, age: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newPet.category} onChange={e => setNewPet({ ...newPet, category: e.target.value })}>
                      <option value="">Selecione uma categoria</option>
                      {petCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newPet.location} onChange={e => setNewPet({ ...newPet, location: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                    <input required type="file" accept="image/*" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newPet.description} onChange={e => setNewPet({ ...newPet, description: e.target.value })} />
                    <div className="flex space-x-2 mt-2">
                      <button type="submit" disabled={addingPet} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">{addingPet ? 'Salvando...' : 'Salvar'}</button>
                      <button type="button" onClick={() => setShowAddPetForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    </div>
                  </div>
                </form>
              ) : (
                userPets.length === 0 ? (
                  <div className="text-center py-12">
                    <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pet listado ainda</h3>
                    <p className="text-gray-500 mb-6">Comece adicionando seu primeiro pet listado</p>
                    <button className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors">
                      Listar Seu Primeiro Pet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPets.map((pet) => (
                      <div key={pet.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="relative">
                          <img src={pet.image_url} alt={pet.name} className="w-full h-48 object-cover" />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pet.status === 'available' ? 'bg-green-100 text-green-800' :
                                pet.status === 'adopted' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {pet.status === 'available' ? 'Disponível' : pet.status === 'adopted' ? 'Adotado' : 'Pendente'}
                              </span>
                              <span className="text-xs text-green-600 font-semibold">Doação</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{pet.breed} • {pet.age}</p>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                              <Edit3 className="h-4 w-4" />
                              <span>Editar</span>
                            </button>
                            <button 
                              onClick={() => deletePet(pet.id)}
                              className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meus Serviços</h2>
                {!showAddServiceForm && (
                  <button onClick={() => setShowAddServiceForm(true)} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Adicionar Novo Serviço</span>
                  </button>
                )}
              </div>
              {showAddServiceForm ? (
                <form onSubmit={handleAddService} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Serviço</label>
                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Inicial</label>
                    <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.price_from} onChange={e => setNewService({ ...newService, price_from: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Final</label>
                    <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.price_to} onChange={e => setNewService({ ...newService, price_to: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade (JSON opcional)</label>
                    <input className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.availability} onChange={e => setNewService({ ...newService, availability: e.target.value })} placeholder='Ex: {"dias": ["seg", "ter"]}' />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })}>
                      <option value="">Selecione uma categoria</option>
                      {serviceCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <input required className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" value={newService.location} onChange={e => setNewService({ ...newService, location: e.target.value })} />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                    <input required type="file" accept="image/*" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
                    <div className="flex space-x-2 mt-2">
                      <button type="submit" disabled={addingService} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">{addingService ? 'Salvando...' : 'Salvar'}</button>
                      <button type="button" onClick={() => setShowAddServiceForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                    </div>
                  </div>
                </form>
              ) : (
                userServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço oferecido ainda</h3>
                    <p className="text-gray-500 mb-6">Comece adicionando seu primeiro serviço</p>
                    <button className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors">
                      Oferecer Seu Primeiro Serviço
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userServices.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={service.image_url} 
                            alt={service.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {service.status === 'active' ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{service.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-bold text-primary-600">
                                  R${service.price_from} - R${service.price_to}
                                </span>
                                <span className="text-sm text-gray-500">{service.category}</span>
                              </div>
                              <div className="flex space-x-2">
                                <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
                                  <Edit3 className="h-4 w-4" />
                                  <span>Editar</span>
                                </button>
                                <button 
                                  onClick={() => deleteService(service.id)}
                                  className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Favoritos</h2>
              {favoritePets.length === 0 && favoriteServices.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum favorito ainda</h3>
                  <p className="text-gray-500 mb-6">Marque pets ou serviços como favoritos para vê-los aqui.</p>
                </div>
              ) : (
                <>
                  {favoritePets.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Pets Favoritos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoritePets.map((pet: any) => (
                          <div key={pet.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <img src={pet.image_url} alt={pet.name} className="w-full h-40 object-cover" />
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-1">{pet.name}</h4>
                              <p className="text-gray-600 text-sm mb-2">{pet.breed} • {pet.age}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${pet.status === 'available' ? 'bg-green-100 text-green-800' : pet.status === 'adopted' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>{pet.status === 'available' ? 'Disponível' : pet.status === 'adopted' ? 'Adotado' : 'Pendente'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {favoriteServices.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Serviços Favoritos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteServices.map((service: any) => (
                          <div key={service.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                              <img src={service.image_url} alt={service.title} className="w-16 h-16 rounded-lg object-cover" />
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h4>
                                <p className="text-gray-600 mb-2">{service.description}</p>
                                <span className="text-sm text-gray-500">{service.category}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configurações do Perfil</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={updateProfile}
                      className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <select
                    value={profileData.user_type}
                    onChange={(e) => setProfileData({ ...profileData, user_type: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="consumer">Consumidor</option>
                    <option value="veterinarian">Veterinário</option>
                    <option value="seller">Vendedor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Telefone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Cidade, Estado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia (Opcional)
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Diga aos potenciais compradores e clientes sobre você e sua experiência com pets..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Contato */}
        {showContactModal && contactInfo && (
          <ContactCard contactInfo={contactInfo} onClose={() => setShowContactModal(false)} />
        )}

        {/* Modal de edição de imagem de perfil */}
        {showProfileImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">Alterar foto de perfil</h3>
              <div className="flex flex-col items-center mb-4">
                {profileImageFile ? (
                  <img src={URL.createObjectURL(profileImageFile)} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-2" />
                ) : profileData.avatar_url ? (
                  <img src={profileData.avatar_url} alt="Atual" className="w-24 h-24 rounded-full object-cover mb-2" />
                ) : (
                  <User className="w-24 h-24 text-gray-300 mb-2" />
                )}
                <input type="file" accept="image/*" onChange={e => setProfileImageFile(e.target.files ? e.target.files[0] : null)} className="mb-2" />
              </div>
              <div className="flex justify-between">
                <button onClick={handleProfileImageRemove} disabled={uploadingProfileImage} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200">Remover</button>
                <button onClick={() => setShowProfileImageModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button onClick={handleProfileImageUpload} disabled={uploadingProfileImage || !profileImageFile} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">{uploadingProfileImage ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};