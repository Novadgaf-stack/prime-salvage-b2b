'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth-provider';
import { subscribeToUserListings, subscribeToIncomingRequests, updateTransactionStatus, ComponentDoc, TransactionDoc } from '@/lib/firebase/db';
import { toast } from 'sonner';
import { LayoutDashboard, Package, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  
  const [listings, setListings] = useState<ComponentDoc[]>([]);
  const [requests, setRequests] = useState<TransactionDoc[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
       setTimeout(() => {
         setListings([]);
         setRequests([]);
         setIsInitializing(false);
       }, 500);
       return;
    }

    if (!loading && user) {
       try {
         const unsubListings = subscribeToUserListings(user.uid, (data) => {
            setListings(data);
         });
         const unsubRequests = subscribeToIncomingRequests(user.uid, (data) => {
            setRequests(data);
            setIsInitializing(false);
         });
         return () => {
           unsubListings();
           unsubRequests();
         };
       } catch (err) {
         console.warn("DB falls back in sandbox", err);
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setListings([]);
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setRequests([]);
         // eslint-disable-next-line react-hooks/set-state-in-effect
         setIsInitializing(false);
       }
    } else if (!loading) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setIsInitializing(false);
    }
  }, [user, loading]);

  if (!loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-[#222] p-12">
        <h2 className="text-[#F0F0F0] text-xl font-bold uppercase tracking-widest mb-4">Access Denied</h2>
        <p className="text-[#888] font-mono text-xs uppercase tracking-widest leading-relaxed max-w-md">
           Dashboard routines are restricted.
        </p>
      </div>
    );
  }

  if (loading || isInitializing) {
     return <div className="text-center py-20 text-[#555] font-mono uppercase text-xs tracking-widest animate-pulse">Syncing Telemetry...</div>;
  }

  const handleApprove = async (txId: string) => {
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        toast.error("Sandbox: Cannot approve.");
        return;
      }
      await updateTransactionStatus(txId, 'APPROVED');
      toast.success('Transaction Approved.');
    } catch (err) {
      toast.error('Approval failed.');
    }
  };

  const handleReject = async (txId: string) => {
    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        toast.error("Sandbox: Cannot reject.");
        return;
      }
      await updateTransactionStatus(txId, 'REJECTED');
      toast.info('Transaction Rejected.');
    } catch (err) {
      toast.error('Rejection failed.');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const pastRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <div className="space-y-12">
       <div className="border-b border-[#222] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
         <div>
           <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#F0F0F0] flex items-center gap-4 mb-2">
             <LayoutDashboard className="w-8 h-8 text-[#EAF205]" /> Terminal
           </h1>
           <p className="text-[#888] font-mono text-xs uppercase tracking-widest">
             Operations Overview: {user?.shopName}
           </p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Active Listings */}
          <div className="space-y-6">
             <h2 className="text-sm uppercase tracking-widest font-bold text-[#F0F0F0] flex items-center gap-3">
               <Package className="w-4 h-4 text-[#EAF205]" /> Active Inventory
             </h2>
             
             <div className="space-y-4">
                {listings.length === 0 ? (
                  <div className="border border-dashed border-[#222] bg-[#0A0A0A] p-8 text-center text-[#555] font-mono text-[10px] uppercase tracking-widest rounded-sm">
                    No active listings detected.
                  </div>
                ) : (
                  listings.map(l => (
                    <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#111] border border-[#222] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-bold uppercase tracking-widest bg-[#222] text-[#888] px-2 py-0.5 rounded-sm">{l.status}</span>
                           <h3 className="text-sm font-bold text-[#F0F0F0]">{l.partName}</h3>
                         </div>
                         <div className="text-[10px] text-[#555] font-mono uppercase tracking-widest">
                            SN: {l.serialNumber} | {l.condition}
                         </div>
                       </div>
                       <div className="text-left sm:text-right">
                          <div className="text-[#F0F0F0] font-black font-mono tracking-tight">${l.price.toFixed(2)}</div>
                          <div className="text-[9px] text-[#555] uppercase tracking-widest">{new Date(l.createdAt).toLocaleDateString()}</div>
                       </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>

          {/* Incoming Requests */}
          <div className="space-y-6">
             <h2 className="text-sm uppercase tracking-widest font-bold text-[#F0F0F0] flex items-center gap-3">
               <ArrowDownLeft className="w-4 h-4 text-[#00E5FF]" /> Transaction Queue
             </h2>

             {/* Pending */}
             <div className="space-y-4">
                {pendingRequests.length === 0 && pastRequests.length === 0 && (
                  <div className="border border-dashed border-[#222] bg-[#0A0A0A] p-8 text-center text-[#555] font-mono text-[10px] uppercase tracking-widest rounded-sm">
                    No incoming transmissions.
                  </div>
                )}
                
                <AnimatePresence>
                  {pendingRequests.map(r => (
                     <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }} transition={{ duration: 0.2 }} className="bg-[#111] border border-[#00E5FF]/40 border-l-[3px] border-l-[#00E5FF] p-5 rounded-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-xs uppercase font-bold text-[#00E5FF] tracking-widest mb-1 flex items-center gap-2">
                               <Clock className="w-3 h-3" /> Action Required
                            </div>
                            <div className="text-sm font-bold text-[#F0F0F0]">Buyer: {r.buyerId.slice(0,8)}</div>
                            <div className="text-[10px] text-[#888] font-mono">Component ID: {r.componentId.slice(0,8)}</div>
                          </div>
                          <div className="text-xl font-black font-mono text-[#F0F0F0]">
                             ${r.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-3 border-t border-[#222]">
                           <button onClick={() => r.id && handleReject(r.id)} className="bg-[#222] hover:bg-[#333] text-[#888] hover:text-[#F87171] px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center gap-1">
                             <XCircle className="w-3 h-3" /> Reject
                           </button>
                           <button onClick={() => r.id && handleApprove(r.id)} className="bg-[#0A0A0A] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 text-[#00E5FF] px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm flex items-center gap-1">
                             <CheckCircle className="w-3 h-3" /> Approve Transfer
                           </button>
                        </div>
                     </motion.div>
                  ))}
                </AnimatePresence>

                {/* Past */}
                {pastRequests.map(r => (
                   <div key={r.id} className="bg-[#0A0A0A] border border-[#222] p-4 flex justify-between items-center rounded-sm opacity-60 hover:opacity-100 transition-opacity">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${r.status === 'APPROVED' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : r.status === 'COMPLETED' ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'bg-[#F87171]/20 text-[#F87171]'}`}>
                            {r.status}
                          </span>
                          <span className="text-[10px] font-mono text-[#888]">C: {r.componentId.slice(0,6)}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Buyer: {r.buyerId.slice(0,8)}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-black text-[#888] font-mono">${r.amount.toFixed(2)}</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}
