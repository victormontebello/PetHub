// Definições globais de interfaces para o projeto

export interface Pet {
  id: string;
  seller_id: string;
  name: string;
  breed: string;
  category: string;
  age: string;
  description: string;
  image_url: string;
  location: string;
  status: string;
  health_checked: boolean;
  created_at: string;
  updated_at: string;
  is_donation: boolean;
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
  availability?: any;
  created_at: string;
} 