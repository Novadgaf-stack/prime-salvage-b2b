'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToComponents, ComponentDoc, createTransaction } from '@/lib/firebase/db';
import { useAuth } from '@/components/auth-provider';
import { Search, Filter, Cpu, ShoppingCart, Info, HardDrive, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_COMPONENTS: ComponentDoc[] = [
  { id: '1', sellerId: 's1', sellerName: 'Volt Fixers', partName: 'iPhone 13 Pro Max OLED Display', compatibility: 'iPhone 13 Pro Max', serialNumber: 'A2643', price: 145.00, condition: 'Tested Working', status: 'AVAILABLE', createdAt: '', updatedAt: '' },
  { id: '2', sellerId: 's2', sellerName: 'Cyber Repair', partName: 'MacBook Pro M1 Logic Board', compatibility: 'A2338', serialNumber: 'MLB-820-02016-A', price: 420.00, condition: 'Untested', status: 'AVAILABLE', createdAt: '', updatedAt: '' },
  { id: '3', sellerId: 's3', sellerName: 'Gizmo Hub', partName: 'Samsung Galaxy S22 Ultra Battery', compatibility: 'SM-S908U', serialNumber: 'EB-BS908ABY', price: 35.00, condition: 'For Parts', status: 'AVAILABLE', createdAt: '', updatedAt: '' },
  { id: '4', sellerId: 's4', sellerName: 'Tech Salvage', partName: 'Nintendo Switch Lite Motherboard', compatibility: 'HDH-001', serialNumber: 'HDH-CPU-20', price: 65.00, condition: 'Tested Working', status: 'AVAILABLE', createdAt: '', updatedAt: '' },
];

const BRANDS = ['All', 'Apple', 'Samsung', 'Nintendo', 'Dell', 'Sony'];
const CONDITIONS = ['All', 'Tested Working', 'Untested', 'For Parts'];

export default function InventoryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ComponentDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setTimeout(() => {
        setComponents(MOCK_COMPONENTS);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const unsubscribe = subscribeToComponents(
        { 
          condition: selectedCondition === 'All' ? undefined : selectedCondition,
          brand: selectedBrand === 'All' ? undefined : selectedBrand
        }, 
        (data) => {
          if (data.length === 0 && selectedBrand === 'All' && selectedCondition === 'All') {
            setComponents(MOCK_COMPONENTS);
          } else {
            setComponents(data);
          }
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("DB Error, falling back to mock data:", e);
      setComponents(MOCK_COMPONENTS);
      setLoading(false);
    }
  }, [selectedCondition, selectedBrand]);

  const filteredComponents = components.filter(c => 
    c.partName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.compatibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurchase = async (comp: ComponentDoc) => {
    if (!user) {
      toast.error('Tech Login required to purchase components.');
      return;
    }
    if (user.uid === comp.sellerId) {
      toast.error('You cannot purchase your own listing.');
      return;
    }
    
    // In a real app we'd trigger a payment flow first. Here we assume success.
    const promise = createTransaction({
      buyerId: user.uid,
      sellerId: comp.sellerId,
      componentId: comp.id!,
      amount: comp.price,
      status: 'PENDING', // or APPROVED if immediate
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    toast.promise(promise, {
      loading: 'Initiating transfer...',
      success: 'Purchase request sent to seller.',
      error: 'Transaction failed.'
    });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-screen-2xl mx-auto overflow-hidden h-[calc(100vh-64px)] relative">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#222] bg-[#0A0A0A] shrink-0">
        <h1 className="text-xl font-black uppercase tracking-tight text-[#F0F0F0] flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#EAF205]" /> Inventory
        </h1>
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] text-[#F0F0F0] text-[10px] uppercase tracking-widest rounded-sm"
        >
          <Filter className="w-3 h-3" /> Filters
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`absolute md:relative z-40 inset-0 md:inset-auto w-full md:w-64 bg-[#111] border-r border-[#222] p-6 overflow-y-auto shrink-0 flex-col gap-8 ${isMobileFiltersOpen ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex md:hidden items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#F0F0F0]">Filters</h2>
          <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-[#888] hover:text-[#F0F0F0] transition-colors bg-[#222] rounded-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
           <div className="text-[10px] uppercase font-bold tracking-widest text-[#555] mb-4">Device Brand</div>
           <div className="flex flex-col gap-2">
             {BRANDS.map(b => (
               <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border border-[#333] rounded-sm flex items-center justify-center transition-colors ${selectedBrand === b ? 'bg-[#EAF205] border-[#EAF205]' : 'bg-[#0A0A0A] group-hover:border-[#555]'}`}>
                     {selectedBrand === b && <div className="w-2 h-2 bg-black rounded-sm" />}
                  </div>
                  <input type="radio" name="brand" value={b} checked={selectedBrand === b} onChange={() => setSelectedBrand(b)} className="hidden" />
                  <span className={`text-xs font-mono uppercase tracking-widest ${selectedBrand === b ? 'text-[#F0F0F0]' : 'text-[#888] group-hover:text-[#CCC]'}`}>{b}</span>
               </label>
             ))}
           </div>
        </div>

        <div>
           <div className="text-[10px] uppercase font-bold tracking-widest text-[#555] mb-4">Condition</div>
           <div className="flex flex-col gap-2">
             {CONDITIONS.map(c => (
               <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border border-[#333] rounded-sm flex items-center justify-center transition-colors ${selectedCondition === c ? 'bg-[#EAF205] border-[#EAF205]' : 'bg-[#0A0A0A] group-hover:border-[#555]'}`}>
                     {selectedCondition === c && <div className="w-2 h-2 bg-black rounded-sm" />}
                  </div>
                  <input type="radio" name="condition" value={c} checked={selectedCondition === c} onChange={() => setSelectedCondition(c)} className="hidden" />
                  <span className={`text-xs font-mono uppercase tracking-widest ${selectedCondition === c ? 'text-[#F0F0F0]' : 'text-[#888] group-hover:text-[#CCC]'}`}>{c}</span>
               </label>
             ))}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#0A0A0A] p-6 md:p-10 flex flex-col pt-4 md:pt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[#222] mb-8 shrink-0">
           <div className="hidden md:block">
             <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#F0F0F0] mb-2 flex items-center gap-3">
               <HardDrive className="w-8 h-8 text-[#EAF205]" /> Inventory
             </h1>
             <p className="text-xs font-mono text-[#888] tracking-widest uppercase">Global salvage & components exchange</p>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#555] absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH PARTS, MOBILES..." 
                className="w-full bg-[#111] border border-[#222] text-[#F0F0F0] text-xs font-mono py-3 pl-12 pr-4 focus:outline-none focus:border-[#EAF205] transition-all rounded-sm placeholder-[#555]"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-[#222] p-5 rounded-sm animate-pulse flex flex-col justify-between min-h-[240px]">
                   <div className="space-y-4">
                     <div className="flex justify-between">
                       <div className="h-4 w-1/3 bg-[#222] rounded-sm"></div>
                       <div className="h-4 w-1/4 bg-[#222] rounded-sm"></div>
                     </div>
                     <div className="h-6 w-3/4 bg-[#222] rounded-sm pt-2"></div>
                     <div className="h-4 w-1/2 bg-[#222] rounded-sm mt-2"></div>
                   </div>
                   <div className="mt-8 flex justify-between items-end border-t border-[#222] pt-4">
                      <div className="h-8 w-1/4 bg-[#222] rounded-sm"></div>
                      <div className="h-8 w-1/3 bg-[#222] rounded-sm"></div>
                   </div>
                </div>
             ))
           ) : filteredComponents.length === 0 ? (
             <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-[#222] rounded-sm">
                <Info className="w-8 h-8 text-[#555] mb-4" />
                <p className="text-xs font-mono uppercase tracking-widest text-[#888]">No matching components found in index.</p>
             </div>
           ) : (
             <AnimatePresence>
               {filteredComponents.map((comp, i) => (
                 <motion.div 
                   key={comp.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.2, delay: i * 0.05 }}
                   className="bg-[#111] border border-[#222] hover:border-[#EAF205]/50 p-5 rounded-sm flex flex-col justify-between min-h-[240px] group transition-all"
                 >
                   <div>
                      <div className="flex justify-between items-start mb-3 border-b border-[#222] pb-3">
                        <span className="text-[10px] text-[#888] font-mono tracking-widest uppercase flex items-center gap-2">
                           <Cpu className="w-3 h-3 text-[#EAF205]" /> {comp.compatibility}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${comp.condition === 'Tested Working' ? 'bg-[#183318] text-[#4ADE80] border border-[#1F4D29]' : comp.condition === 'Untested' ? 'bg-[#332A0F] text-[#FACC15] border border-[#4D4016]' : 'bg-[#331818] text-[#F87171] border border-[#4D1F1F]'}`}>
                          {comp.condition}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#F0F0F0] leading-snug mb-2 group-hover:text-[#EAF205] transition-colors">{comp.partName}</h3>
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest flex items-center gap-2">
                           <span>Serial:</span> <span className="text-[#888]">{comp.serialNumber}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest flex items-center gap-2">
                           <span>Seller:</span> <span className="text-[#888]">{comp.sellerName}</span>
                        </div>
                      </div>
                   </div>

                   <div className="mt-6 flex justify-between items-end border-t border-[#222] pt-4">
                      <div>
                        <span className="text-[10px] text-[#555] uppercase font-bold tracking-widest mb-1 block">Asking</span>
                        <div className="text-xl font-black text-[#F0F0F0] font-mono tracking-tight">${comp.price.toFixed(2)}</div>
                      </div>
                      <button 
                        onClick={() => handlePurchase(comp)}
                        className="flex items-center gap-2 bg-[#F0F0F0] hover:bg-[#EAF205] text-[#0A0A0A] px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors rounded-sm"
                      >
                        <ShoppingCart className="w-3 h-3" /> Execute
                      </button>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           )}
        </div>
      </div>
    </div>
  );
}
