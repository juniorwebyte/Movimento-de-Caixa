import React, { useMemo, useState } from 'react';
import { ShieldCheck, Search, Plus } from 'lucide-react';

type Subscription = {
  id: string;
  user: string;
  status: 'trial' | 'active' | 'expired';
  startAt: string;
  endAt?: string;
  key?: string;
};

export default function AdminPanel() {
  const [filter, setFilter] = useState('');
  const [subs, setSubs] = useState<Subscription[]>(() => {
    const raw = localStorage.getItem('caixa_admin_subs');
    return raw ? JSON.parse(raw) : [];
  });

  const save = (list: Subscription[]) => {
    setSubs(list);
    localStorage.setItem('caixa_admin_subs', JSON.stringify(list));
  };

  const filtered = useMemo(() => subs.filter(s => s.user.toLowerCase().includes(filter.toLowerCase())), [subs, filter]);

  const add = () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    save([{ id, user: 'Novo Usuário', status: 'trial', startAt: now }, ...subs]);
  };

  const update = (id: string, partial: Partial<Subscription>) => {
    const next = subs.map(s => (s.id === id ? { ...s, ...partial } : s));
    save(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin - Assinaturas</h1>
          </div>
          <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4"/> Nova</button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Buscar por usuário..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Usuário</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Início</th>
                  <th className="py-2 pr-3">Fim</th>
                  <th className="py-2 pr-3">Chave</th>
                  <th className="py-2 pr-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2 pr-3"><input value={s.user} onChange={(e)=>update(s.id,{user:e.target.value})} className="px-2 py-1 border rounded"/></td>
                    <td className="py-2 pr-3">
                      <select value={s.status} onChange={(e)=>update(s.id,{status:e.target.value as any})} className="px-2 py-1 border rounded">
                        <option value="trial">Trial</option>
                        <option value="active">Ativa</option>
                        <option value="expired">Expirada</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3"><input type="datetime-local" value={s.startAt.slice(0,16)} onChange={(e)=>update(s.id,{startAt:new Date(e.target.value).toISOString()})} className="px-2 py-1 border rounded"/></td>
                    <td className="py-2 pr-3"><input type="datetime-local" value={(s.endAt||'').slice(0,16)} onChange={(e)=>update(s.id,{endAt:e.target.value?new Date(e.target.value).toISOString():undefined})} className="px-2 py-1 border rounded"/></td>
                    <td className="py-2 pr-3"><input value={s.key||''} onChange={(e)=>update(s.id,{key:e.target.value})} className="px-2 py-1 border rounded"/></td>
                    <td className="py-2 pr-3">
                      <button onClick={()=>update(s.id,{status:'active'})} className="px-3 py-1 text-white bg-green-600 rounded mr-2">Ativar</button>
                      <button onClick={()=>update(s.id,{status:'expired'})} className="px-3 py-1 text-white bg-red-600 rounded">Expirar</button>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-500">Nenhuma assinatura</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


