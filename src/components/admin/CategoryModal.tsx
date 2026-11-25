import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Upload } from 'lucide-react';

interface CategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  const { addCategory, updateCategory, showToast } = useApp();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setImageUrl(category.image_url);
      setDisplayOrder(category.display_order.toString());
      setIsActive(category.is_active);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
      setDisplayOrder('1');
      setIsActive(true);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      description: description.trim(),
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      display_order: parseInt(displayOrder) || 1,
      is_active: isActive,
    };

    if (category) {
      updateCategory(category.id, payload);
    } else {
      addCategory(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[92vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            {category ? `Edit Category: ${category.name}` : 'Add Food Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Wood-Fired Pizzas"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Slug / Identifier
            </label>
            <input
              type="text"
              placeholder="pizzas"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-600 bg-stone-50 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Crispy sourdough crusts, signature pomodoro sauce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 resize-none focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded-sm"
                />
                <span>Active & Visible</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
            >
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
