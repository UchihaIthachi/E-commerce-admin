import { create } from "zustand";
import { persist } from "zustand/middleware";

// 1. Define a new CartItemType interface
export interface CartItemType {
  cartItemId: string; // Composite ID: e.g., `productId_variantKey` or just `productId`
  productId: string;  // Sanity _id of the product document
  name: string;
  slug: string;       // Product slug for linking: product.slug.current
  price: number;      // The actual price for this item (could be variant price or sale price)
  originalPrice: number; // The original price before any sale, for display
  imageUrl?: string;   // URL for the item's image
  imageAlt?: string;
  quantity: number;
  // Variant specific details that define this unique cart item
  variantId?: string;  // Sanity variant _key, if applicable
  variantName?: string; // e.g., "Large / Blue"
  // Add other distinguishing variant attributes if needed
  // color?: string;
  // size?: string;
}

// Type for the payload passed to addToCart action
export type AddToCartPayload = {
  productId: string;
  name: string;
  slug: string;
  price: number; // Final price for this item/variant
  originalPrice: number;
  imageUrl?: string;
  imageAlt?: string;
  variantId?: string;
  variantName?: string;
  // color?: string;
  // size?: string;
};

// 2. Update Store State (State type)
export type State = {
  cart: CartItemType[];
  totalItems: number;
  totalAmount: number;
  // Potentially add other state like isCartOpen: boolean;
};

// 6. Update Actions type definition
export type Actions = {
  addToCart: (itemToAdd: AddToCartPayload) => void;
  removeFromCart: (cartItemId: string) => void; // Takes cartItemId
  deleteFromCart: (cartItemId: string) => void; // Takes cartItemId
  clearCart: () => void;
  setCart: (newCartItems: CartItemType[]) => void; // New action
  syncCartToDb: () => Promise<void>; // New async action
  // Potentially hydrate cart from DB for logged-in users, etc.
};

// 5. Update INITIAL_STATE
const INITIAL_STATE: State = {
  cart: [],
  totalItems: 0,
  totalAmount: 0,
};

export const useCartStore = create(
  persist<State & Actions>(
    (set, get) => {
      // 3. Implement a recalculateTotals helper function
      const recalculateTotals = (currentCart: CartItemType[]) => {
        const newTotalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalAmount = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { totalItems: newTotalItems, totalAmount: newTotalAmount };
      };

      return {
        ...INITIAL_STATE, // Spread initial state

        // 4. Refactor Actions
        addToCart: (itemPayload: AddToCartPayload) => {
          const cart = get().cart;
          const cartItemId = itemPayload.variantId
                             ? `${itemPayload.productId}_${itemPayload.variantId}`
                             : itemPayload.productId;

          const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
          let updatedCart: CartItemType[];

          if (existingItemIndex > -1) {
            // Item exists, increment quantity
            updatedCart = cart.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            // Item is new, add to cart
            const newCartItem: CartItemType = {
              ...itemPayload, // Spread payload from argument
              cartItemId,     // Set the generated cartItemId
              quantity: 1,    // Initial quantity
            };
            updatedCart = [...cart, newCartItem];
          }

          const totals = recalculateTotals(updatedCart);
          set({ cart: updatedCart, ...totals });
        },

        removeFromCart: (cartItemId: string) => {
          const cart = get().cart;
          let updatedCart: CartItemType[];
          const existingItem = cart.find(item => item.cartItemId === cartItemId);

          if (existingItem) {
            if (existingItem.quantity > 1) {
              // Decrement quantity
              updatedCart = cart.map(item =>
                item.cartItemId === cartItemId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              );
            } else {
              // Remove item entirely if quantity is 1
              updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
            }
            const totals = recalculateTotals(updatedCart);
            set({ cart: updatedCart, ...totals });
          }
        },

        deleteFromCart: (cartItemId: string) => {
          const cart = get().cart;
          const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
          const totals = recalculateTotals(updatedCart);
          set({ cart: updatedCart, ...totals });
        },

        clearCart: () => {
          const totals = recalculateTotals([]);
          set({ cart: [], ...totals }); // Also explicitly set totals to 0 via recalculate
        },

        setCart: (newCartItems: CartItemType[]) => {
          const totals = recalculateTotals(newCartItems);
          set({ cart: newCartItems, ...totals, });
          // console.log("Cart hydrated from DB:", newCartItems);
        },

        syncCartToDb: async () => {
          const currentCart = get().cart;
          // Map CartItemType to the structure expected by ClientCartItemSchema for the API
          const itemsForApi = currentCart.map(item => ({
            productId: item.productId,
            name: item.name,
            // slug: item.slug, // Not in ClientCartItemSchema
            price: item.price, // Assumed to be unit price in CartItemType
            // originalPrice: item.originalPrice, // Not in ClientCartItemSchema
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt, // Not in ClientCartItemSchema, but API might ignore extra fields
            quantity: item.quantity,
            variantId: item.variantId,
            variantName: item.variantName,
          }));

          try {
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: itemsForApi }), // API expects { items: ... }
            });
            if (!response.ok) {
              const errorData = await response.json().catch(()=> ({})); // Catch if response is not JSON
              console.error("Failed to sync cart to DB:", response.status, errorData.error || response.statusText);
              // Optionally, set an error state in the store here
            } else {
              // console.log("Cart synced to DB successfully.");
            }
          } catch (error) {
            console.error("Error syncing cart to DB:", error);
            // Optionally, set an error state in the store here
          }
        },
      };
    },
    {
      name: "cart-storage", // Changed name slightly to avoid potential hydration issues with old structure
      // storage: createJSONStorage(() => localStorage), // Default is localStorage
      // partialize: (state) => ({ cart: state.cart }), // Optionally only persist parts of the store
    }
  )
);
