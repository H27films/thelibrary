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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-background text-foreground selection:bg-foreground/10">
      
      {/* LEFT PANE - Navigation Rail */}
      <nav className="w-full md:w-1/3 lg:w-[400px] flex flex-col p-6 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-foreground/5 z-10 shrink-0">
        
        {/* Search Bar */}
        <div className="relative mb-12 lg:mb-24 group">
          <input
            type="text"
            placeholder="Type here to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-foreground/20 pb-3 pl-0 pr-8 text-lg md:text-xl font-serif italic placeholder:text-foreground/30 focus:outline-none focus:border-foreground transition-colors rounded-none"
          />
          <Search className="absolute right-0 bottom-4 w-4 h-4 text-foreground/30 group-focus-within:text-foreground transition-colors" strokeWidth={1.5} />
        </div>

        {/* Categories */}
        <div className="flex-1 flex flex-row md:flex-col gap-6 md:gap-8 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-left text-3xl md:text-5xl lg:text-7xl font-serif transition-all duration-500 origin-left whitespace-nowrap md:whitespace-normal
                  ${isActive ? 'opacity-100 scale-100 md:scale-105' : 'opacity-30 hover:opacity-70'}
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Add Button - Desktop */}
        <div className="hidden md:block mt-auto pt-12">
          <button 
            onClick={openNewModal}
            className="group flex items-center gap-4 text-xs font-sans tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity"
          >
            <span className="w-8 h-[1px] bg-foreground group-hover:w-12 transition-all duration-300"></span>
            Add Entry
          </button>
        </div>
      </nav>

      {/* RIGHT PANE - Content List */}
      <main className="flex-1 overflow-y-auto minimal-scrollbar relative">
        <div className="p-6 md:p-12 lg:p-16 min-h-full flex flex-col">
          
          {/* Header indicator */}
          <div className="flex items-center justify-between mb-16 md:mb-24 text-[10px] uppercase tracking-[0.4em] text-foreground/40 font-sans">
            <span>{activeCategory === 'All' ? 'Index' : activeCategory}</span>
            <span>{items?.length || 0} Entries</span>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-foreground/30" strokeWidth={1} />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/20 italic font-serif">
              <Library className="w-12 h-12 mb-6 opacity-50" strokeWidth={1} />
              <p className="text-2xl">The archive is empty.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col"
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  onClick={(e) => handleEdit(e, item)}
                  className="group py-8 md:py-12 border-b border-foreground/5 relative flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-foreground/[0.01] px-4 -mx-4 transition-colors"
                >
                  <div className="flex-1 pr-8">
                    <h3 className="text-3xl md:text-5xl font-serif transition-all duration-500 origin-left group-hover:scale-[1.02] group-hover:italic text-foreground">
                      {item.title}
                    </h3>
                    
                    <div className="mt-4 md:mt-6 flex flex-wrap gap-4 md:gap-8 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-sans text-foreground/40 group-hover:text-foreground/60 transition-colors">
                      <span className="font-semibold">{item.type}</span>
                      {item.metadata?.creator && (
                        <>
                          <span className="opacity-30 hidden sm:inline">•</span>
                          <span>{item.metadata.creator}</span>
                        </>
                      )}
                      {item.metadata?.year && (
                        <>
                          <span className="opacity-30 hidden sm:inline">•</span>
                          <span>{item.metadata.year}</span>
                        </>
                      )}
                      {item.metadata?.genre && (
                        <>
                          <span className="opacity-30 hidden sm:inline">•</span>
                          <span>{item.metadata.genre}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions - visible on hover */}
                  <div className="mt-6 md:mt-0 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => handleEdit(e, item)}
                      className="p-3 text-foreground/40 hover:text-foreground bg-background rounded-full border border-foreground/10 hover:border-foreground/30 transition-all shadow-sm"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-3 text-foreground/40 hover:text-red-500 bg-background rounded-full border border-foreground/10 hover:border-red-500/30 transition-all shadow-sm"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Footer space filler */}
          <div className="mt-auto pt-24 pb-8 text-center text-[9px] uppercase tracking-[0.3em] text-foreground/20 font-sans">
            End of Collection
          </div>
        </div>
      </main>

      {/* Mobile Add Button - Fixed FAB */}
      <button
        onClick={openNewModal}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-foreground text-background rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
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
