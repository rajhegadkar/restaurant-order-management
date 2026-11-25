import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { categories, menuItems } = useApp();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar py-1">
      {/* "All" Option */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
          selectedCategoryId === 'all'
            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/50'
            : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200/80 shadow-xs'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>All Items</span>
        <span
          className={`text-[11px] px-1.5 py-0.5 rounded-full ${
            selectedCategoryId === 'all' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {menuItems.length}
        </span>
      </button>

      {/* Category Pills */}
      {categories
        .filter((cat) => cat.is_active)
        .sort((a, b) => a.display_order - b.display_order)
        .map((cat) => {
          const itemCount = menuItems.filter((i) => i.category_id === cat.id).length;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/50'
                  : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200/80 shadow-xs'
              }`}
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
              <span>{cat.name}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {itemCount}
              </span>
            </button>
          );
        })}
    </div>
  );
};
