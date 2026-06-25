import { create } from "zustand";
import { persist } from "zustand/middleware";

type Order = {
  id: string;
  status: string;
  total: number;
  date: string;
};

type OrderStore = {
  orders: Order[];
  addOrder: (order: Order) => void;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [
            ...state.orders,
            order,
          ],
        })),
    }),
    {
      name: "orders-storage",
    }
  )
);