import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurant_id: number;
  restaurant_name: string;
};

type CartStore = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (name: string) => void;
  increaseQuantity: (name: string) => void;
  decreaseQuantity: (name: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {

          if (
            state.cart.length > 0 &&
            state.cart[0].restaurant_id !== item.restaurant_id
          ) {
            alert(
              "You can only order from one restaurant at a time"
            );

            return state;
          }

         const existingItem = state.cart.find(
            (cartItem) => cartItem.id === item.id
          );

          if (existingItem) {

            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + 1,
                    }
                  : cartItem
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...item,
                quantity: 1,
              },
            ],
          };
        }),

      removeFromCart: (name) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.name !== name
          ),
        })),

      increaseQuantity: (name) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.name === name
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        })),

      decreaseQuantity: (name) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.name === name
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),
    

    clearCart: () =>
      set(() => ({
        cart: [],
      })),
      }),
    {
      name: "cart-storage",
    }
  )
);