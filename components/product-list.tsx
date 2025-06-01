'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, Minus, Trash2 } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Product, Category } from '@/lib/types';

interface ProductListProps {
  categories: Category[];
  products: Product[];
  onAddToCart: (productId: string) => void;
  cart: { id: string; quantity: number }[];
  updateQuantity: (productId: string, quantity: number) => void;
  onCartClick: () => void;
  onClearCart: () => void;
}

export function ProductList({
  categories,
  products,
  onAddToCart,
  cart,
  updateQuantity,
  onCartClick,
  onClearCart,
}: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !(prev[categoryId] ?? true),
    }));
  };

  useEffect(() => {
    // Reset category selection if the selected category no longer exists
    if (selectedCategory !== 'all' && !categories.find((cat) => cat.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  const { settings, getCurrencySymbol } = useSettings();

  return (
    <div className='flex-1 flex flex-col'>
      <div className='relative z-20 flex border-b'>
        <div className='flex items-center justify-between gap-1 w-full max-w-md mx-auto px-4'>
          <div className='w-full py-4 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              className='pl-8'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className='relative overflow-auto flex-1 flex flex-col gap-4 w-full max-w-md mx-auto p-4'>
        {categories.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full p-8'>
            <p className='text-gray-500 text-center'>There are no categories available</p>
            <p className='text-gray-400 text-sm text-center mt-2'>Add categories from the "Edit" option</p>
          </div>
        ) : (
          sortedCategories
            .filter((category) => {
              // Only show categories that have products in the filtered list
              return filteredProducts.some((product) => product.categoryId === category.id);
            })
            .map((category) => {
              const categoryProducts = filteredProducts
                .filter((product) => product.categoryId === category.id)
                .sort((a, b) => a.order - b.order);

              if (categoryProducts.length === 0) return null;

              const isExpanded = expandedCategories[category.id] ?? true; // Default to true (expanded)

              return (
                <div key={category.id} className='overflow-hidden border rounded-lg'>
                  {/* Category Header */}
                  <div
                    className='flex items-center justify-between p-4 bg-white font-medium cursor-pointer'
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    <span>{category.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Products in this category - only show if expanded */}
                  {isExpanded &&
                    categoryProducts.map((product) => {
                      const quantity = getCartQuantity(product.id);
                      return (
                        <div
                          key={product.id}
                          className={`border-t p-4 bg-white transition-colors ${
                            quantity === 0 ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'cursor-default'
                          }`}
                          onClick={() => quantity === 0 && onAddToCart(product.id)}
                        >
                          <div className='flex justify-between items-center'>
                            <div>
                              <div className='text-sm'>{product.name}</div>
                              <div>
                                {getCurrencySymbol()}
                                <b>{product.price.toLocaleString()}</b> {settings.currency}
                              </div>
                            </div>

                            {quantity > 0 ? (
                              <div className='flex items-center'>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product.id, quantity - 1);
                                  }}
                                >
                                  {quantity === 1 ? <Trash2 className='h-4 w-4' /> : <Minus className='h-4 w-4' />}
                                </Button>
                                <span className='w-10 text-center text-lg font-medium'>{quantity}</span>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product.id, quantity + 1);
                                  }}
                                >
                                  <Plus className='h-4 w-4' />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant='outline'
                                size='icon'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product.id);
                                }}
                              >
                                <Plus className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })
        )}

        {/* Show message when no products match the filter */}
        {categories.length > 0 && filteredProducts.length === 0 && (
          <div className='flex flex-col items-center justify-center h-full p-8'>
            <p className='text-gray-500 text-center'>No products found</p>
            <p className='text-gray-400 text-sm text-center mt-2'>
              {searchQuery
                ? `There are no products matching this "${searchQuery}"`
                : 'There are no products in this category'}
            </p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className='sticky bottom-0 w-full py-4 bg-white border-t'>
          <div className='flex gap-2 w-full max-w-md mx-auto px-4'>
            <Button variant='destructive' size='icon' className='relative' onClick={onClearCart}>
              <span className='absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <Trash2 className='h-4 w-4' />
            </Button>
            <Button className='flex-1' onClick={onCartClick}>
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
