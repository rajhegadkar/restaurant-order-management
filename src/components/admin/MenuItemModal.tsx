import React, { useState, useEffect } from 'react';
import { MenuItem, AddOnOption } from '../../types';
import { useApp } from '../../context/AppContext';
import { uploadImageToSupabase } from '../../lib/supabase';
import { generateId, formatCurrency } from '../../lib/utils';
import { X, Upload, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface MenuItemModalProps {
  item: MenuItem | null; // null if adding new item
  isOpen: boolean;
  onClose: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { categories, addMenuItem, updateMenuItem, showToast, settings } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [prepTime, setPrepTime] = useState('15');
  const [addons, setAddons] = useState<AddOnOption[]>([]);

  // Add-on input temp state
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setCategoryId(item.category_id);
      setImageUrl(item.image_url);
      setIsVeg(item.is_veg);
      setIsAvailable(item.is_available);
      setIsBestseller(item.is_bestseller);
      setIsFeatured(item.is_featured);
      setPrepTime((item.preparation_time_minutes || 15).toString());
      setAddons(item.addons || []);
    } else {
      // Default new
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories[0]?.id || '');
      setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80');
      setIsVeg(true);
      setIsAvailable(true);
      setIsBestseller(false);
      setIsFeatured(false);
      setPrepTime('15');
      setAddons([]);
    }
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddAddon = () => {
    if (!newAddonName.trim()) return;
    const priceNum = parseFloat(newAddonPrice) || 0;
    const newAddon: AddOnOption = {
      id: generateId('add'),
      name: newAddonName.trim(),
      price: priceNum,
    };
    setAddons((prev) => [...prev, newAddon]);
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const handleRemoveAddon = (addonId: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadImageToSupabase(file, 'food-images');
      setImageUrl(publicUrl);
      showToast('Image uploaded and preview updated!', 'success');
    } catch (err) {
      console.error('Failed to upload image:', err);
      showToast('Failed to upload image.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Dish name is required.', 'error');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      category_id: categoryId || categories[0]?.id || 'cat_starters',
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80',
      is_veg: isVeg,
      is_available: isAvailable,
      is_bestseller: isBestseller,
      is_featured: isFeatured,
      preparation_time_minutes: parseInt(prepTime) || 15,
      rating: item?.rating || 4.8,
      addons,
    };

    if (item) {
      updateMenuItem(item.id, payload);
    } else {
      addMenuItem(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto sm:my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            {item ? `Edit Dish: ${item.name}` : 'Create New Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Food Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Truffle Bianca Pizza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description & Ingredients
            </label>
            <textarea
              rows={2}
              placeholder="Fresh San Marzano tomatoes, buffalo mozzarella, wild oregano..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Price, Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Price ({settings.currency_symbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="449.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Prep Time (Minutes)
              </label>
              <input
                type="number"
                min="1"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Image URL & File Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              Food Image
            </label>
            <div className="flex items-center gap-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                />
              )}
              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[11px] font-semibold text-stone-600 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload File / Supabase'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Toggles: Veg/Non-Veg, Available, Bestseller, Featured */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span>Pure Veg</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <span>Available</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <span>Bestseller</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <span>Featured</span>
            </label>
          </div>

          {/* Add-ons and Customizations */}
          <div className="border-t border-stone-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Custom Add-Ons & Extras
              </h4>
              <span className="text-[11px] text-stone-500">{addons.length} configured</span>
            </div>

            {/* List current add-ons */}
            {addons.length > 0 && (
              <div className="space-y-2">
                {addons.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                  >
                    <span className="font-semibold text-stone-800">{a.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-600">
                        +{formatCurrency(a.price, settings.currency_symbol)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(a.id)}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new addon inputs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add-on name (e.g. Extra Truffle Dip)"
                value={newAddonName}
                onChange={(e) => setNewAddonName(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
              <input
                type="number"
                step="0.01"
                placeholder={`+${settings.currency_symbol} Price`}
                value={newAddonPrice}
                onChange={(e) => setNewAddonPrice(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800"
              />
              <button
                type="button"
                onClick={handleAddAddon}
                className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
            >
              {item ? 'Save Changes' : 'Create Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
