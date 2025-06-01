'use client';

import type React from 'react';

import { useState } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Lock,
  Pencil,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product, Category } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { usePOSData } from '@/hooks/use-pos-data';
import Link from 'next/link';

interface ShopEditProps {
  // categories: Category[];
  // products: Product[];
  // onAddCategory: (category: Category) => void;
  // onAddProduct: (product: Product) => void;
  // onUpdateCategory: (id: string, data: Partial<Category>) => void;
  // onUpdateProduct: (id: string, data: Partial<Product>) => void;
  // onDeleteCategory: (id: string) => void;
  // onDeleteProduct: (id: string) => void;
  // onReorderCategories: (draggedId: string, targetId: string) => void;
  // onReorderProducts: (draggedId: string, targetId: string) => void;
  // onCancel: () => void;
  // onConfirm: () => void;
}

// Tipo para los mensajes de feedback
type FeedbackType = {
  message: string;
  type: 'success' | 'error';
  id: string;
};

export function ShopEdit({}: ShopEditProps) {
  const {
    categories,
    products,
    isLoading,
    error,
    addCategory,
    addProduct,
    updateCategory,
    updateProduct,
    deleteCategory,
    deleteProduct,
    reorderCategories,
    reorderProducts,
  } = usePOSData();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { isNew?: boolean }) | null>(null);

  const [draggedProduct, setDraggedProduct] = useState<string | null>(null);
  const [dragOverProduct, setDragOverProduct] = useState<string | null>(null);
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);

  // Estado para el feedback visual
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);

  const { settings, getCurrencySymbol } = useSettings();

  // Función para mostrar feedback
  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setFeedback({ message, type, id });

    // Auto-ocultar después de 2 segundos
    setTimeout(() => {
      setFeedback((current) => (current?.id === id ? null : current));
    }, 2000);
  };

  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    // Get the next order number
    const maxOrder = categories.length > 0 ? Math.max(...categories.map((cat) => cat.order)) : 0;

    const categoryId = `cat-${Date.now()}`;

    addCategory({
      id: categoryId,
      name: newCategoryName,
      order: maxOrder + 1,
    });

    setNewCategoryName('');
    showFeedback('Category added');

    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: true,
    }));
  };

  const handleAddProduct = () => {
    if (!newProductName.trim() || !newProductPrice.trim()) return;

    // Get the next order number for products in the first category
    const categoryProducts = products.filter((p) => p.categoryId === sortedCategories[0]?.id);
    const maxOrder = categoryProducts.length > 0 ? Math.max(...categoryProducts.map((prod) => prod.order)) : 0;

    addProduct({
      id: `prod-${Date.now()}`,
      name: newProductName,
      price: Number.parseFloat(newProductPrice),
      categoryId: sortedCategories[0]?.id || '',
      stock: 10,
      availability: 2,
      order: maxOrder + 1,
    });

    setNewProductName('');
    setNewProductPrice('');
    showFeedback('Product added');
  };

  const handleUpdateCategoryName = (id: string, name: string) => {
    updateCategory(id, { name });
    showFeedback('Category updated');
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const openProductModal = (product: Product | null = null, categoryId: string) => {
    if (product) {
      setEditingProduct(product);
    } else {
      // Get the next order number for products in this category
      const categoryProducts = products.filter((p) => p.categoryId === categoryId);
      const maxOrder = categoryProducts.length > 0 ? Math.max(...categoryProducts.map((prod) => prod.order)) : 0;

      setEditingProduct({
        id: `prod-${Date.now()}`,
        name: '',
        price: 0,
        categoryId,
        stock: 10,
        availability: 2,
        order: maxOrder + 1,
        isNew: true,
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;

    if (editingProduct.isNew) {
      addProduct({
        id: editingProduct.id,
        name: editingProduct.name,
        price: editingProduct.price,
        categoryId: editingProduct.categoryId,
        stock: editingProduct.stock,
        availability: editingProduct.availability,
        order: editingProduct.order,
      });
      showFeedback('Product added');
    } else {
      updateProduct(editingProduct.id, {
        name: editingProduct.name,
        price: editingProduct.price,
      });
      showFeedback('Product updated');
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    showFeedback('Category deleted');
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    showFeedback('Product deleted');
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', categoryId);

    const draggedElement = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (draggedElement) {
      draggedElement.classList.add('dragging');
    }
  };

  const handleDragEnter = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedCategory && draggedCategory !== categoryId) {
      setDragOverCategory(categoryId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear drag over if we're leaving the container, not just moving between children
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverCategory(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();

    if (!draggedCategory || draggedCategory === targetCategoryId) {
      setDraggedCategory(null);
      setDragOverCategory(null);
      setIsDragging(false);
      return;
    }

    // Llamar a la función de reordenamiento del componente padre
    reorderCategories(draggedCategory, targetCategoryId);
    showFeedback('Categories reordered');

    setDraggedCategory(null);
    setDragOverCategory(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
    setIsDragging(false);

    // Remove dragging class from all elements
    document.querySelectorAll('.dragging').forEach((el) => {
      el.classList.remove('dragging');
    });
  };

  const handleProductDragStart = (e: React.DragEvent, productId: string) => {
    setDraggedProduct(productId);
    setIsDraggingProduct(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', productId);

    const draggedElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (draggedElement) {
      draggedElement.classList.add('dragging-product');
    }
  };

  const handleProductDragEnter = (e: React.DragEvent, productId: string) => {
    e.preventDefault();
    if (draggedProduct && draggedProduct !== productId) {
      setDragOverProduct(productId);
    }
  };

  const handleProductDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverProduct(null);
    }
  };

  const handleProductDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleProductDrop = (e: React.DragEvent, targetProductId: string) => {
    e.preventDefault();

    if (!draggedProduct || draggedProduct === targetProductId) {
      setDraggedProduct(null);
      setDragOverProduct(null);
      setIsDraggingProduct(false);
      return;
    }

    reorderProducts(draggedProduct, targetProductId);
    showFeedback('Products reordered');

    setDraggedProduct(null);
    setDragOverProduct(null);
    setIsDraggingProduct(false);
  };

  const handleProductDragEnd = () => {
    setDraggedProduct(null);
    setDragOverProduct(null);
    setIsDraggingProduct(false);

    document.querySelectorAll('.dragging-product').forEach((el) => {
      el.classList.remove('dragging-product');
    });
  };

  return (
    <div className='flex flex-col w-full h-screen'>
      <header className='py-4 flex items-center justify-between bg-[#0F0F0F] border-b shadow-sm'>
        <div className='flex items-center w-full max-w-md mx-auto px-4'>
          <Button variant='default' size='icon' className='mr-2' asChild>
            <Link href='/shop'>
              <ChevronLeft className='h-4 w-4' />
              <span className='sr-only'>Back</span>
            </Link>
          </Button>
          <h1 className='text-xl font-medium text-white'>Edit mode</h1>

          {/* Feedback visual */}
          {feedback && (
            <div
              className={`ml-auto flex items-center text-sm ${
                feedback.type === 'success' ? 'text-green-500' : 'text-red-500'
              } animate-in fade-in slide-in-from-top-4 duration-300`}
            >
              <CheckCircle className='h-4 w-4 mr-1' />
              <span>{'Saved'}</span>
            </div>
          )}
        </div>
      </header>

      <div className='w-full py-4 border-b'>
        {/* Add new category form */}
        <div className='w-full max-w-md mx-auto px-4'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='New category eg: Food'
              className='flex-1'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button size='icon' onClick={handleAddCategory} disabled={!newCategoryName}>
              <span className='text-xl'>+</span>
            </Button>
          </div>
        </div>
      </div>

      <div className='w-full max-w-md mx-auto p-4 flex-1 overflow-auto'>
        <div className='space-y-4'>
          {/* Categories and their products */}
          {sortedCategories.map((category, index) => (
            <div key={category.id} className='relative'>
              {/* Drop zone indicator above */}
              {dragOverCategory === category.id && draggedCategory !== category.id && (
                <div className='absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full opacity-75 z-10 animate-pulse'></div>
              )}

              <div
                data-category-id={category.id}
                className={`
                  bg-white border border-dashed rounded-lg p-4 transition-all duration-300 ease-in-out
                  ${draggedCategory === category.id ? 'opacity-20 bg-gray-200 border-gray-400 z-20 relative' : ''}
                  ${
                    dragOverCategory === category.id && draggedCategory !== category.id
                      ? 'border-blue-400 bg-blue-100 scale-102'
                      : ''
                  }
                  ${isDragging && draggedCategory !== category.id ? 'transition-transform duration-300' : ''}
                  ${expandedCategories[category.id] ? 'cursor-default' : 'cursor-grab'}
                `}
                draggable={!expandedCategories[category.id]}
                onDragStart={(e) => !expandedCategories[category.id] && handleDragStart(e, category.id)}
                onDragEnter={(e) => handleDragEnter(e, category.id)}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.id)}
                onDragEnd={handleDragEnd}
              >
                <div className='flex items-center gap-1 mb-4'>
                  <div
                    className={`
                  transition-all duration-200 ${
                    expandedCategories[category.id] ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                  }
                  ${draggedCategory === category.id ? 'scale-110 text-blue-600' : 'hover:scale-105 hover:text-gray-600'}
                `}
                  >
                    {expandedCategories[category.id] ? (
                      <Lock className='h-5 w-5 text-gray-400 mr-2' />
                    ) : (
                      <GripVertical className='h-5 w-5 text-gray-400 mr-2' />
                    )}
                  </div>
                  <Input
                    placeholder='Name the category eg: Food'
                    className='flex-1'
                    value={category.name}
                    onChange={(e) => handleUpdateCategoryName(category.id, e.target.value)}
                  />
                  <div className='flex items-center gap-1'>
                    <Button variant='outline' size='icon' onClick={() => toggleCategoryExpansion(category.id)}>
                      {expandedCategories[category.id] ? (
                        <ChevronUp className='h-5 w-5' />
                      ) : (
                        <ChevronDown className='h-5 w-5' />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='icon'>
                          <MoreVertical className='h-5 w-5' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className='mr-2 h-4 w-4' />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {!expandedCategories[category.id] && (
                  <div className='text-sm text-gray-500 ml-7'>
                    {products.filter((p) => p.categoryId === category.id).length} products
                  </div>
                )}

                {expandedCategories[category.id] && (
                  <>
                    {/* Products in this category */}
                    {products
                      .filter((product) => product.categoryId === category.id)
                      .sort((a, b) => a.order - b.order)
                      .map((product) => (
                        <div key={product.id} className='relative ml-6 mb-3'>
                          {/* Drop zone indicator above */}
                          {dragOverProduct === product.id && draggedProduct !== product.id && (
                            <div className='absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full opacity-75 z-10 animate-pulse'></div>
                          )}

                          <div
                            data-product-id={product.id}
                            className={`
                              bg-background border border-dashed rounded-lg p-4 transition-all duration-300 ease-in-out cursor-grab
                              ${
                                draggedProduct === product.id
                                  ? 'opacity-20 bg-gray-200 border-gray-400 z-20 relative'
                                  : ''
                              }
                              ${
                                dragOverProduct === product.id && draggedProduct !== product.id
                                  ? 'border-blue-400 bg-blue-100 scale-102'
                                  : ''
                              }
                              ${
                                isDraggingProduct && draggedProduct !== product.id
                                  ? 'transition-transform duration-300'
                                  : ''
                              }
                            `}
                            draggable
                            onDragStart={(e) => handleProductDragStart(e, product.id)}
                            onDragEnter={(e) => handleProductDragEnter(e, product.id)}
                            onDragLeave={handleProductDragLeave}
                            onDragOver={handleProductDragOver}
                            onDrop={(e) => handleProductDrop(e, product.id)}
                            onDragEnd={handleProductDragEnd}
                          >
                            <div className='flex items-center'>
                              <GripVertical className='h-5 w-5 text-gray-400 mr-2' />
                              <div className='flex-1'>
                                <div className='font-medium'>{product.name}</div>
                                <div className='text-sm text-gray-500'>
                                  {getCurrencySymbol()}
                                  {product.price.toLocaleString()} {settings.currency}
                                </div>
                              </div>
                              <div className='flex items-center'>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant='outline' size='icon'>
                                      <MoreVertical className='h-5 w-5' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end'>
                                    <DropdownMenuItem onClick={() => openProductModal(product, product.categoryId)}>
                                      <Pencil className='mr-2 h-4 w-4' />
                                      <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                                      <Trash2 className='mr-2 h-4 w-4' />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Add new product button */}
                    <div className='flex justify-center mt-3 ml-6'>
                      <Button className='w-full py-2' onClick={() => openProductModal(null, category.id)}>
                        Add Product
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-4 py-4 bg-white border-t'>
        <div className='flex gap-1 w-full max-w-md mx-auto px-4'>
          <Button variant='outline' className='flex-1' asChild>
            <Link href='/shop'>Back</Link>
          </Button>
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-4 w-full max-w-md mx-4'>
            <h3 className='text-lg font-medium mb-4'>{editingProduct?.isNew ? 'Add Product' : 'Edit Product'}</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                <Input
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  placeholder='Product name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
                <div className='flex items-center border border-gray-300 rounded-md overflow-hidden'>
                  <span className='px-3 py-2 bg-gray-50 border-r border-gray-300 text-gray-700'>
                    {getCurrencySymbol()}
                  </span>
                  <Input
                    className='border-0 rounded-none flex-1 focus-visible:ring-transparent'
                    type='number'
                    value={editingProduct?.price || ''}
                    onChange={(e) =>
                      setEditingProduct((prev) => (prev ? { ...prev, price: Number(e.target.value) || 0 } : null))
                    }
                    placeholder='0'
                  />
                  <span className='px-3 py-2 bg-gray-50 border-l border-gray-300 text-gray-700'>
                    {settings.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <Button
                className='w-full'
                variant='outline'
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className='w-full'
                onClick={handleSaveProduct}
                disabled={!editingProduct?.name || editingProduct?.price === 0 || editingProduct?.price < 0}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dragging {
          transform: scale(1.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: 1000;
        }
        .dragging-product {
          transform: scale(1.03);
          box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.2);
          z-index: 500;
        }
      `}</style>
    </div>
  );
}
