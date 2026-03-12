import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface PendingDashboardProps {
  onLogout: () => void;
}

const PendingDashboard: React.FC<PendingDashboardProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-[2rem] mx-auto flex items-center justify-center mb-8 border-2 border-amber-200 shadow-sm relative">
           <ShieldAlert className="w-10 h-10 text-amber-500" />
           <span className="absolute -top-2 -right-2 flex h-6 w-6">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500 border-2 border-white items-center justify-center text-[10px] font-bold text-white">!</span>
           </span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Access Pending</h2>
        <p className="text-lg text-slate-600 leading-relaxed max-w-sm mx-auto">
          Your account has been created, but your workspace membership is waiting for an administrator's approval.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white p-8 shadow-2xl shadow-slate-200/50 sm:rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">What happens next?</h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                  A notification has been sent to the workspace admins.
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                  Once approved, your dashboard will automatically unlock.
                </li>
              </ul>
            </div>
            
            <div className="w-full md:w-auto">
               <button 
                 onClick={onLogout}
                 className="w-full md:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
               >
                 <ArrowLeft className="w-4 h-4" /> Return Home
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PendingDashboard;
