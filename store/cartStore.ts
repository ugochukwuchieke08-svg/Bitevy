import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurant_id: string | number;
  restaurant_name: string;

  // Food customization
portion?: string;
portion_id?: number;
};

type CartStore = {
  cart: CartItem[];

  addToCart: (item: CartItem) => void;

  removeFromCart: (
    id: string | number,
    portion?: string
  ) => void;

  increaseQuantity: (
    id: string | number,
    portion?: string
  ) => void;

  decreaseQuantity: (
    id: string | number,
    portion?: string
  ) => void;

  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          /*
           * Bitevy only allows one restaurant per cart.
           */
          if (
            state.cart.length > 0 &&
            String(state.cart[0].restaurant_id) !==
              String(item.restaurant_id)
          ) {
            alert(
              "You can only order from one restaurant at a time"
            );

            return state;
          }

          /*
           * A cart item is identified by:
           *
           * Food ID + Portion
           *
           * This means:
           *
           * Jollof Rice + Regular
           *
           * and
           *
           * Jollof Rice + Large
           *
           * are treated as different cart items.
           */
          const existingItem = state.cart.find(
            (cartItem) =>
              String(cartItem.id) === String(item.id) &&
              (cartItem.portion ?? "Regular") ===
                (item.portion ?? "Regular")
          );

          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                String(cartItem.id) === String(item.id) &&
                (cartItem.portion ?? "Regular") ===
                  (item.portion ?? "Regular")
                  ? {
                      ...cartItem,
                      quantity:
                        cartItem.quantity +
                        item.quantity,
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
                portion: item.portion ?? "Regular",
                quantity: item.quantity ?? 1,
              },
            ],
          };
        }),

      removeFromCart: (id, portion = "Regular") =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(
                String(item.id) === String(id) &&
                (item.portion ?? "Regular") === portion
              )
          ),
        })),

      increaseQuantity: (id, portion = "Regular") =>
        set((state) => ({
          cart: state.cart.map((item) =>
            String(item.id) === String(id) &&
            (item.portion ?? "Regular") === portion
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        })),

      decreaseQuantity: (id, portion = "Regular") =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              String(item.id) === String(id) &&
              (item.portion ?? "Regular") === portion
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => ({
        cart: [],
      }),
    }),

    {
      name: "cart-storage",
    }
  )
);