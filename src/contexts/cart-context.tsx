"use client";
import type { CartItem, Product } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, maxStock?: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  itemCount: number;
  getCurrentQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cartItems', []);
  const { toast } = useToast();

  const getCurrentQuantity = (productId: string) => {
    const existingItem = cartItems.find(item => item.id === productId);
    return existingItem ? existingItem.quantity : 0;
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const currentQuantity = getCurrentQuantity(product.id);
    const newTotalQuantity = currentQuantity + quantity;
    
    if (newTotalQuantity > product.stock) {
      toast({
        title: "Cannot add to cart",
        description: `Only ${product.stock} items available in stock. You already have ${currentQuantity} in your cart.`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        imageUrl: product.imageUrl, 
        quantity,
        stock: product.stock
      }];
    });
    
    toast({
      title: "Added to cart",
      description: (
        <div className="flex flex-col items-start gap-2">
          <span>{`${product.name} was added to your cart.`}</span>
          <Button asChild variant="default" size="sm">
            <Link href="/cart">Check Cart</Link>
          </Button>
        </div>
      ),
      duration: 4000,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({ 
      title: "Removed from cart", 
      description: `Item was removed from your cart.`,
      duration: 4000,
    });
  };

  const updateQuantity = (productId: string, quantity: number, maxStock?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (maxStock && quantity > maxStock) {
      toast({
        title: "Cannot update quantity",
        description: `Only ${maxStock} items available in stock.`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal, 
      itemCount,
      getCurrentQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
