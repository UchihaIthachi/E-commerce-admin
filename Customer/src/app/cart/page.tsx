// Customer/src/app/cart/page.tsx
"use client";

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import type { CartItemType, AddToCartPayload } from '@/store/useCartStore'; // Import types
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusCircleIcon, PlusCircleIcon, Trash2Icon, ShoppingCartIcon, ArrowRightIcon } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart
  } = useCartStore();

  const handleIncreaseQuantity = (item: CartItemType) => {
    // Construct the payload required by the addToCart action
    // Note: item.price in CartItemType is already item.unitPrice * item.quantity
    // The store's addToCart expects the unit price for the item being added.
    const unitPrice = item.quantity > 0 ? item.price / item.quantity : 0; // Avoid division by zero
    const unitOriginalPrice = item.quantity > 0 ? item.originalPrice / item.quantity : 0;


    const payload: AddToCartPayload = {
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: unitPrice,
      originalPrice: unitOriginalPrice,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      variantId: item.variantId,
      variantName: item.variantName,
    };
    addToCart(payload);
  };

  const handleDecreaseQuantity = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const handleDeleteItem = (cartItemId: string) => {
    deleteFromCart(cartItemId);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">Your Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
        <section className="lg:col-span-8">
          <ul role="list" className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={item.cartItemId} className="flex py-6 sm:py-8">
                <div className="flex-shrink-0">
                  <Image
                    src={item.imageUrl || '/placeholder-image.png'} // Ensure placeholder exists
                    alt={item.imageAlt || item.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32 border"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <h3 className="text-base font-medium text-gray-800 hover:text-primary">
                        <Link href={`/product/${item.slug}`}>{item.name}</Link>
                      </h3>
                      {item.variantName && (
                        <p className="mt-1 text-xs text-gray-500">{item.variantName}</p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {/* Display unit price. item.price is total for this line item. */}
                        ₹{(item.quantity > 0 ? item.price / item.quantity : 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:self-start sm:justify-self-end">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleDecreaseQuantity(item.cartItemId)} className="h-8 w-8 sm:h-9 sm:w-9">
                          <MinusCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <Input
                          type="text"
                          readOnly
                          value={item.quantity}
                          className="w-10 h-8 sm:w-12 sm:h-9 text-center border-gray-300 rounded-md"
                        />
                        <Button variant="outline" size="icon" onClick={() => handleIncreaseQuantity(item)} className="h-8 w-8 sm:h-9 sm:w-9">
                          <PlusCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                      <div className="absolute right-0 top-0 sm:relative sm:right-auto sm:top-auto sm:mt-2 sm:text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.cartItemId)} className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1">
                          <Trash2Icon className="h-4 w-4 mr-1 sm:mr-0" /> <span className="sm:hidden">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 flex items-end justify-end space-x-2 text-sm font-medium text-gray-900">
                    <span>Subtotal: ₹{item.price.toFixed(2)}</span> {/* item.price is already item.unitPrice * item.quantity */}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-lg bg-gray-50 p-6 lg:col-span-4 lg:mt-0 h-fit shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Total Items</dt>
              <dd className="text-sm font-medium text-gray-900">{totalItems}</dd>
            </div>
            {/* Placeholder for future items like Discounts, Shipping, Taxes */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-bold text-gray-900">Order Total</dt>
              <dd className="text-base font-bold text-gray-900">₹{totalAmount.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                Proceed to Checkout <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => { if(confirm('Are you sure you want to clear the cart?')) clearCart(); }} className="text-sm text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50">
              Clear Cart
            </Button>
          </div>
          <div className="mt-6 text-center text-sm">
            <Link href="/" className="font-medium text-primary hover:text-primary-dark">
              or Continue Shopping <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
