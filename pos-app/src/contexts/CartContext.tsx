import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateDiscount: (id: number, discount: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Update quantity if product already in cart
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: Date.now(),
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        discount: 0,
        total: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(cart.map(item => {
      if (item.id === id) {
        const total = (item.price * quantity) - item.discount;
        return { ...item, quantity, total };
      }
      return item;
    }));
  };

  const updateDiscount = (id: number, discount: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const total = (item.price * item.quantity) - discount;
        return { ...item, discount, total };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateDiscount,
      clearCart,
      getCartTotal,
      getCartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
