import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { insertItemSchema } from "@shared/schema";
import { useCreateItem, useUpdateItem } from "@/hooks/use-items";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: any | null; // Using any for brevity, maps to typeof items.$inferSelect
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["book", "film", "person"], {
    required_error: "Please select a type",
  }),
  metadata: z.object({
    creator: z.string().optional(),
    year: z.string().optional(),
    genre: z.string().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ItemModal({ isOpen, onClose, itemToEdit }: ItemModalProps) {
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  
  const isEditing = !!itemToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "book",
      metadata: { creator: "", year: "", genre: "" },
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        reset({
          title: itemToEdit.title,
          type: itemToEdit.type as "book" | "film" | "person",
          metadata: {
            creator: itemToEdit.metadata?.creator || "",
            year: itemToEdit.metadata?.year || "",
            genre: itemToEdit.metadata?.genre || "",
          },
        });
      } else {
        reset({
          title: "",
          type: "book",
          metadata: { creator: "", year: "", genre: "" },
        });
      }
    }
  }, [isOpen, itemToEdit, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Clean up empty metadata strings
      const cleanedMetadata = { ...data.metadata };
      Object.keys(cleanedMetadata).forEach((key) => {
        if (!cleanedMetadata[key as keyof typeof cleanedMetadata]) {
          delete cleanedMetadata[key as keyof typeof cleanedMetadata];
        }
      });

      const payload = {
        title: data.title,
        type: data.type,
        metadata: cleanedMetadata,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: itemToEdit.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 backdrop-blur-md bg-background/70"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl bg-background border border-black/5 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-black/5">
              <h2 className="text-sm font-bold tracking-widest uppercase font-sans">
                {isEditing ? "Edit Entry" : "New Entry"}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-black/20 hover:text-black transition-colors group"
              >
                <X className="w-5 h-5 transition-transform duration-300" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-8 gap-10">
              
              {/* Type Selection */}
              <div className="flex gap-8 border-b border-black/5 pb-8">
                {(["book", "film", "person"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      value={type} 
                      {...register("type")} 
                      className="sr-only" 
                    />
                    <span className={`text-[10px] uppercase tracking-[0.2em] transition-all duration-300 font-sans ${
                      selectedType === type 
                        ? "text-black font-bold" 
                        : "text-black/10 group-hover:text-black/30"
                    }`}>
                      {type}
                    </span>
                    {selectedType === type && (
                      <motion.div layoutId="activeDot" className="w-1 h-1 rounded-full bg-black" />
                    )}
                  </label>
                ))}
              </div>

              {/* Title Field */}
              <div className="flex flex-col gap-2">
                <input
                  {...register("title")}
                  placeholder="Title"
                  className="w-full bg-transparent border-none text-4xl md:text-5xl font-sans font-light tracking-tighter focus:outline-none focus:ring-0 placeholder:text-black/5"
                  autoFocus
                />
                {errors.title && <span className="text-[10px] text-red-500 font-sans tracking-widest uppercase mt-2">{errors.title.message}</span>}
              </div>

              {/* Dynamic Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/20 font-sans">
                    {selectedType === 'film' ? 'Director' : selectedType === 'book' ? 'Author' : 'Role'}
                  </label>
                  <input
                    {...register("metadata.creator")}
                    placeholder="..."
                    className="w-full bg-transparent border-b border-black/5 pb-2 text-base font-sans font-light focus:outline-none focus:border-black/20 transition-colors placeholder:text-black/5"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/20 font-sans">
                    {selectedType === 'person' ? 'Active Years' : 'Year'}
                  </label>
                  <input
                    {...register("metadata.year")}
                    placeholder="YYYY"
                    className="w-full bg-transparent border-b border-black/5 pb-2 text-base font-sans font-light focus:outline-none focus:border-black/20 transition-colors placeholder:text-black/5"
                  />
                </div>

                {selectedType !== 'person' && (
                  <div className="flex flex-col gap-3 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/20 font-sans">Genre</label>
                    <input
                      {...register("metadata.genre")}
                      placeholder="..."
                      className="w-full bg-transparent border-b border-black/5 pb-2 text-base font-sans font-light focus:outline-none focus:border-black/20 transition-colors placeholder:text-black/5"
                    />
                  </div>
                )}
              </div>

              {/* Footer / Submit */}
              <div className="mt-4 pt-8 border-t border-black/5 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group flex items-center gap-3 text-[10px] font-bold font-sans tracking-widest uppercase disabled:opacity-50 transition-all hover:opacity-60"
                >
                  <span>{isPending ? "Saving" : isEditing ? "Save" : "Add Entry"}</span>
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
                  ) : (
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
