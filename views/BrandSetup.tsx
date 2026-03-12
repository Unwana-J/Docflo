import React, { useState } from 'react';
import { Palette, ArrowRight, Share2, Check } from 'lucide-react';
import { BrandAssets } from '../types';

interface BrandSetupProps {
  workspaceName: string;
  onComplete: (assets: BrandAssets) => void;
}

const BrandSetup: React.FC<BrandSetupProps> = ({ workspaceName, onComplete }) => {
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [isCopied, setIsCopied] = useState(false);

  const mockInviteToken = 'inv_1a2b3c4d5e';
  const inviteLink = `localhost:5173/?inviteToken=${mockInviteToken}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleComplete = () => {
    onComplete({
      primaryColor,
      letterhead: workspaceName,
      footerText: 'Confidential | ' + workspaceName,
      companyAddress: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in slide-in-from-right-8 duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl border border-purple-200">
           <Palette className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tailor your workspace</h2>
        <p className="mt-2 text-sm text-slate-500">
          Setup branding for {workspaceName} and invite your team.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-10 border border-slate-100">
          <h3 className="text-xl font-bold mb-6">Choose a theme color</h3>
          <div className="flex flex-wrap gap-4 mb-8 text-center">
             {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0f172a'].map((color) => (
                <button 
                  key={color} 
                  onClick={() => setPrimaryColor(color)}
                  className={`w-14 h-14 rounded-full border-[4px] transition-all transform hover:scale-110 active:scale-95 ${primaryColor === color ? 'border-indigo-200 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
             ))}
          </div>

          <hr className="my-8 border-slate-100" />

          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" /> Share Invite Link
          </h3>
          <p className="text-sm text-slate-500 mb-4">Send this link to your team. Collaborators will be added as PENDING members until approved.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <input 
               type="text" 
               readOnly 
               value={inviteLink} 
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-600 focus:outline-none"
             />
             <button 
               onClick={copyInviteLink}
               className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
             >
                {isCopied ? <><Check className="w-4 h-4" /> Copied</> : 'Copy'}
             </button>
          </div>
        </div>

        <button
          onClick={handleComplete}
          className="w-full flex justify-center items-center gap-2 py-5 px-4 rounded-2xl shadow-xl text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BrandSetup;
