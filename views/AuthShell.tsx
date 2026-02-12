import React, { useEffect, useState } from 'react';
import { Mail, ArrowRight, Users, Loader2 } from 'lucide-react';
import { fetchMe, requestMagicLink, createTeam, MeResponse, ApiTeamSummary } from '../services/api';
import { INITIAL_TEAMS } from '../constants';
import { Team } from '../types';

type AuthStage = 'checking' | 'login' | 'teamSelector' | 'createTeam' | 'ready';

interface AuthShellProps {
  onReady: (user: MeResponse['user'], teams: Team[], activeTeamId: string) => void;
}

const cloneInitialTeamForUser = (backendTeam: ApiTeamSummary): Team => {
  const base = INITIAL_TEAMS[0];
  return {
    ...base,
    id: backendTeam.id,
    name: backendTeam.name,
  };
};

const AuthShell: React.FC<AuthShellProps> = ({ onReady }) => {
  const [stage, setStage] = useState<AuthStage>('checking');
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSent, setLoginSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamInvites, setNewTeamInvites] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchMe();
        setMe(data);
        if (data.teams.length === 0) {
          setStage('createTeam');
        } else if (data.teams.length === 1) {
          const mapped = data.teams.map(cloneInitialTeamForUser);
          onReady(data.user, mapped, data.teams[0].id);
          setStage('ready');
        } else {
          setStage('teamSelector');
        }
      } catch (err: any) {
        console.error('Auth error:', err);
        setStage('login');
      }
    };
    init();
  }, [onReady]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await requestMagicLink(loginEmail.trim());
      setLoginSent(true);
    } catch (err: any) {
      setLoginError('Unable to send sign-in link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamPicked = (team: ApiTeamSummary) => {
    if (!me) return;
    const mapped = me.teams.map(cloneInitialTeamForUser);
    onReady(me.user, mapped, team.id);
    setStage('ready');
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const invites = newTeamInvites
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      const resp = await createTeam({
        name: newTeamName.trim(),
        invites,
      });
      const newBackendTeams: ApiTeamSummary[] = [
        ...(me.teams || []),
        { id: resp.id, name: resp.name, role: 'admin' },
      ];
      const updatedMe: MeResponse = { ...me, teams: newBackendTeams };
      setMe(updatedMe);
      const mapped = newBackendTeams.map(cloneInitialTeamForUser);
      onReady(updatedMe.user, mapped, resp.id);
      setStage('ready');
    } catch (err: any) {
      setCreateError('Unable to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (stage === 'checking' || stage === 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (stage === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to DocuFlow</h1>
            <p className="text-sm text-slate-500">
              Enter your work email and we&apos;ll send you a magic sign-in link.
            </p>
          </div>
          {loginSent ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                We sent a sign-in link to <span className="font-semibold">{loginEmail}</span>. Check your inbox
                and click the link to continue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              {loginError && (
                <p className="text-xs font-medium text-red-600">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending link...
                  </>
                ) : (
                  <>
                    Send magic link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'teamSelector' && me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 w-full max-w-lg space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Choose a workspace</h1>
              <p className="text-sm text-slate-500">
                You&apos;re a member of multiple teams. Pick where to work.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {me.teams.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTeamPicked(t)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-lg transition-all text-left"
              >
                <div>
                  <p className="font-black text-slate-900">{t.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Role: {t.role.toUpperCase()}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'createTeam' && me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 w-full max-w-xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your team</h1>
            <p className="text-sm text-slate-500">
              You&apos;re signed in as <span className="font-semibold">{me.user.email}</span>. Let&apos;s set up your first workspace.
            </p>
          </div>
          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Team Name
              </label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all"
                placeholder="Product Department"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Invite Teammates (optional)
              </label>
              <textarea
                value={newTeamInvites}
                onChange={(e) => setNewTeamInvites(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all h-24"
                placeholder="alice@company.com, bob@company.com"
              />
              <p className="text-[10px] text-slate-400 font-medium">
                We&apos;ll email each address a 7-day invitation to join this team.
              </p>
            </div>
            {createError && (
              <p className="text-xs font-medium text-red-600">{createError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating team...
                </>
              ) : (
                <>
                  Launch workspace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthShell;

