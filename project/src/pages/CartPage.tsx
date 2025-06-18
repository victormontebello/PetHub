import React from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Trash2 } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Carrinho de Compras
          </h1>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seu carrinho está vazio</h3>
            <p className="text-gray-500">Adicione produtos para comprar com o fornecedor</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">
            <ul className="divide-y divide-gray-200 mb-6">
              {cart.map(item => (
                <li key={item.id} className="flex items-center py-4">
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-gray-500 text-sm">Qtd: {item.quantity}</div>
                  </div>
                  <div className="text-lg font-bold text-primary-600 mr-4">R${item.price * item.quantity}</div>
                  <button onClick={() => removeFromCart(item.id)} className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary-600">R${total}</span>
            </div>
            <button className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium mb-2">
              Finalizar Compra com o Fornecedor
            </button>
            <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium" onClick={clearCart}>
              Limpar Carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 