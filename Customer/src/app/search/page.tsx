// Customer/src/app/search/page.tsx
"use client";

import React, { useState, useEffect, Suspense, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import type { Product } from '@/lib/sanity/client';
import { Loader2, AlertCircleIcon, SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchTermInput, setSearchTermInput] = useState(query);
  const [displayedQuery, setDisplayedQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!query);

  useEffect(() => {
    setSearchTermInput(query);
    setDisplayedQuery(query);
    if (query) {
      fetchResults(query);
      setHasSearched(true);
    } else {
      setProducts([]);
      setHasSearched(false);
      setError(null);
    }
  }, [query]);

  const fetchResults = async (currentQuery: string) => {
    if (!currentQuery.trim()) {
      setProducts([]);
      setError(null);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(currentQuery)}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Failed to fetch search results' }));
        throw new Error(errData.error || 'Failed to fetch search results');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Could not load search results.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSearchTerm = searchTermInput.trim();
    if (!trimmedSearchTerm) {
        if (query) router.push('/search');
        return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800">Search Products</h1>

      <form onSubmit={handleSearchSubmit} className="mb-10 max-w-lg mx-auto flex gap-2 items-center">
        <Input
          type="search"
          value={searchTermInput}
          onChange={(e) => setSearchTermInput(e.target.value)}
          placeholder="Search by name, keyword..."
          className="flex-grow h-10 text-sm"
          aria-label="Search products"
        />
        <Button type="submit" disabled={isLoading && searchTermInput === displayedQuery} size="lg"> {/* Disable only if loading current query */}
          {isLoading && searchTermInput === displayedQuery ? <Loader2 className="h-5 w-5 animate-spin" /> : <SearchIcon className="h-5 w-5" />}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-gray-500">Searching for "{displayedQuery}"...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10">
          <AlertCircleIcon className="mx-auto h-10 w-10 text-red-500 mb-3" />
          <p className="text-md font-medium text-red-600">Error during search</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      )}
      {!isLoading && !error && hasSearched && products.length === 0 && (
        <div className="text-center py-10">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg text-gray-700">No products found for "{displayedQuery}".</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search term or browse our categories.</p>
        </div>
      )}
      {!isLoading && !error && products.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Results for "{displayedQuery}"
            <span className="text-gray-500 font-normal text-base ml-2">({products.length} item{products.length === 1 ? '' : 's'})</span>
          </h2>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:gap-x-6 md:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
      {!isLoading && !error && !hasSearched && !query && (
        <div className="text-center py-20 text-gray-500">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Enter a term above to search for products across our catalog.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-sm text-gray-500">Loading search page...</p>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
