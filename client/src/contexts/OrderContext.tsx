import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Order {
  id: string;
  number: string;
  status: 'preparing' | 'ready';
  createdAt: Date;
  readyAt?: Date;
}

interface OrderContextType {
  preparingOrders: Order[];
  readyOrders: Order[];
  addOrder: (number: string) => void;
  markAsReady: (id: string) => void;
  removeOrder: (id: string) => void;
  clearAllReady: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);

  const addOrder = useCallback((number: string) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      number,
      status: 'preparing',
      createdAt: new Date(),
    };
    setPreparingOrders((prev) => [newOrder, ...prev]);
  }, []);

  const markAsReady = useCallback((id: string) => {
    setPreparingOrders((prev) => {
      const order = prev.find((o) => o.id === id);
      if (order) {
        order.status = 'ready';
        order.readyAt = new Date();
        setReadyOrders((readyPrev) => [order, ...readyPrev]);
      }
      return prev.filter((o) => o.id !== id);
    });
  }, []);

  const removeOrder = useCallback((id: string) => {
    setReadyOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const clearAllReady = useCallback(() => {
    setReadyOrders([]);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        preparingOrders,
        readyOrders,
        addOrder,
        markAsReady,
        removeOrder,
        clearAllReady,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}
