'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { createComponent, ComponentDoc } from '@/lib/firebase/db';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';

export default function SellPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [partName, setPartName] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('Tested Working');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If not loading, and user not found, redirect to inventory
  if (!loading && !user) {
    // Show a toast that login is required, then return minimal UI or redirect
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-[#222] p-12">
        <h2 className="text-[#F0F0F0] text-xl font-bold uppercase tracking-widest mb-4">Tech Authentication Required</h2>
        <p className="text-[#888] font-mono text-xs uppercase tracking-widest leading-relaxed max-w-md">
           You must use Tech Login to access listing protocols. Access is restricted to registered facilities.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      toast.error('Sandbox: Cannot upload listing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Omit<ComponentDoc, 'id'> = {
        sellerId: user.uid,
        sellerName: user.shopName,
        partName,
        compatibility,
        serialNumber,
        price: parseFloat(price),
        condition,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await createComponent(data);
      toast.success('Component Listed Successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to list component.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
       <div>
         <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#F0F0F0] flex items-center gap-4">
           <PlusCircle className="w-8 h-8 text-[#EAF205]" /> List Component
         </h1>
         <p className="text-[#888] font-mono text-xs uppercase tracking-widest mt-4">
           Enter hardware telemetry to the global exchange. Minimum requirement: Part Name & Price.
         </p>
       </div>

       <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-sm p-6 md:p-8 space-y-6">
         <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Component Name</label>
            <input 
               type="text" 
               required
               value={partName}
               onChange={e => setPartName(e.target.value)}
               placeholder="e.g. iPhone 13 Pro Max OLED Display"
               className="w-full bg-[#0A0A0A] border border-[#222] p-4 text-[#F0F0F0] font-mono text-xs focus:outline-none focus:border-[#EAF205] transition-colors rounded-sm"
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Device Compatibility</label>
              <input 
                 type="text" 
                 required
                 value={compatibility}
                 onChange={e => setCompatibility(e.target.value)}
                 placeholder="e.g. Apple A2643"
                 className="w-full bg-[#0A0A0A] border border-[#222] p-4 text-[#F0F0F0] font-mono text-xs focus:outline-none focus:border-[#EAF205] transition-colors rounded-sm"
              />
           </div>
           
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Serial / Model No.</label>
              <input 
                 type="text" 
                 required
                 value={serialNumber}
                 onChange={e => setSerialNumber(e.target.value)}
                 placeholder="e.g. D1Q00123"
                 className="w-full bg-[#0A0A0A] border border-[#222] p-4 text-[#F0F0F0] font-mono text-xs focus:outline-none focus:border-[#EAF205] transition-colors rounded-sm"
              />
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#222]">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Condition</label>
              <select 
                 value={condition}
                 onChange={e => setCondition(e.target.value)}
                 className="w-full bg-[#0A0A0A] border border-[#222] p-4 text-[#F0F0F0] font-mono text-xs focus:outline-none focus:border-[#EAF205] transition-colors rounded-sm appearance-none cursor-pointer"
              >
                 <option value="Tested Working">Tested Working</option>
                 <option value="Untested">Untested</option>
                 <option value="For Parts">For Parts</option>
              </select>
           </div>
           
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#555]">Asking Price (USD)</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] font-mono">$</span>
                 <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0A0A0A] border border-[#222] p-4 pl-8 text-[#F0F0F0] font-mono text-xs focus:outline-none focus:border-[#EAF205] transition-colors rounded-sm"
                 />
              </div>
           </div>
         </div>

         <div className="flex justify-end pt-2">
            <button 
               type="submit"
               disabled={isSubmitting}
               className="bg-[#EAF205] hover:bg-[#C2C903] text-black font-black uppercase tracking-widest py-4 px-8 text-xs transition-colors rounded-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isSubmitting ? 'Transmitting...' : 'Upload Listing'}
            </button>
         </div>
       </form>
    </motion.div>
  );
}
