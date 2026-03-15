import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AnimatePresence, motion } from "framer-motion";
import Movies from "./pages/movies";
import Books from "./pages/books";
import People from "./pages/people";

type Tab = "films" | "books" | "people";

const tabs: { id: Tab; label: string }[] = [
  { id: "films", label: "Films & TV" },
  { id: "books", label: "Books" },
  { id: "people", label: "People" },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("films");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="fixed inset-0 bg-[#F5F2EE] flex flex-col overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {activeTab === "films" && <Movies />}
              {activeTab === "books" && <Books />}
              {activeTab === "people" && <People />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <nav
          className="flex-shrink-0 bg-[#F5F2EE] border-t border-black/8"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-4 flex flex-col items-center gap-1 transition-all"
                  data-testid={`tab-${tab.id}`}
                >
                  <span
                    className={`text-[11px] uppercase tracking-widest font-semibold transition-colors ${
                      isActive ? "text-[#8B2635]" : "text-[#1A1A1A]/25"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="w-4 h-[1.5px] bg-[#8B2635]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </QueryClientProvider>
  );
}

export default App;
