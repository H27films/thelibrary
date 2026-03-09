import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, Edit2, Loader2, Library } from "lucide-react";
import { useItems, useDeleteItem } from "@/hooks/use-items";
import { ItemModal } from "@/components/item-modal";

const CATEGORIES = ["All", "Books", "Films", "People"] as const;
type Category = typeof CATEGORIES[number];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);

  // Derive the query param for type
  const typeParam = activeCategory === "All" ? undefined : activeCategory.toLowerCase();
  
  const { data: items, isLoading } = useItems({ 
    search: searchQuery, 
    type: typeParam 
  });
  
  const deleteMutation = useDeleteItem();

  const handleEdit = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const openNewModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-background text-black selection:bg-black/10">
      
      {/* LEFT PANE - Navigation Rail */}
      <nav className="w-full md:w-1/3 lg:w-[450px] flex flex-col p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-black/5 z-10 shrink-0">
        
        <div className="flex justify-between items-start mb-12">
          <h1 className="text-sm font-bold tracking-widest uppercase font-sans">
            THE LIBRARY
          </h1>
          <button onClick={openNewModal} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-[1px] bg-black/5 mb-12" />

        {/* Categories */}
        <div className="flex-1 flex flex-col gap-2 md:gap-3 overflow-y-auto hide-scrollbar pt-12">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-left text-4xl md:text-5xl lg:text-6xl font-sans font-light tracking-tighter transition-all duration-300
                  ${isActive ? 'text-black opacity-100' : 'text-black opacity-10 hover:opacity-30'}
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="w-full h-[1px] bg-black/5 mt-16 mb-8" />

        {/* Bottom - Search Only */}
        <div className="relative group">
          <div className="flex items-center gap-3 text-black/40 group-focus-within:text-black transition-colors">
            <Search className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-bold font-sans uppercase tracking-widest">Search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-text"
            placeholder="Search"
          />
        </div>
      </nav>

      {/* RIGHT PANE - Content List */}
      <main className="flex-1 overflow-y-auto minimal-scrollbar relative bg-background">
        <div className="p-8 md:p-12 lg:p-16 min-h-full flex flex-col">
          
          {/* Search Bar Removed from top */}

          {/* List */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-black/20" strokeWidth={1} />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-black/20 italic font-serif pt-32">
              <p className="text-2xl">No entries found.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col pt-32"
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  onClick={(e) => handleEdit(e, item)}
                  className="group py-2 border-b border-black/5 flex items-center justify-between cursor-pointer hover:bg-black/[0.01] px-4 -mx-4 transition-colors"
                >
                  <h3 className="text-xl md:text-2xl font-sans font-light tracking-tight text-black opacity-60 group-hover:opacity-100 transition-opacity leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-6">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-sans text-black/20">
                      {item.type}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleDelete(e, item.id)} className="text-black/40 hover:text-black p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Footer space filler */}
          <div className="mt-auto pt-24 pb-8 text-center text-[9px] uppercase tracking-[0.3em] text-black/10 font-sans">
            End of Collection
          </div>
        </div>
      </main>

      {/* Mobile Add Button - Fixed FAB */}
      <button
        onClick={openNewModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {/* Create/Edit Modal */}
      <ItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        itemToEdit={itemToEdit} 
      />
      
    </div>
  );
}
