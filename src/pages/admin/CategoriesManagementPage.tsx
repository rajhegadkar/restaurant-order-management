import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import { CategoryModal } from '../../components/admin/CategoryModal';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const CategoriesManagementPage: React.FC = () => {
  const { categories, deleteCategory, menuItems } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Menu Category Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Organize culinary offerings into structured menu sections and display priority.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
        {[...categories]
          .sort((a, b) => a.display_order - b.display_order)
          .map((cat) => {
            const count = menuItems.filter((i) => i.category_id === cat.id).length;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-stone-100">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 text-white">
                      <span className="font-serif font-bold text-base sm:text-lg leading-tight truncate min-w-0">
                        {cat.name}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-md shrink-0 whitespace-nowrap">
                        {count} dishes
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {cat.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-2 text-xs text-stone-500 border-t border-stone-100">
                      <span>Display Order: #{cat.display_order}</span>
                      <span
                        className={`font-bold ${
                          cat.is_active ? 'text-emerald-600' : 'text-stone-400'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-xl bg-white hover:bg-stone-200/60 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Category Add/Edit Modal */}
      <CategoryModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
