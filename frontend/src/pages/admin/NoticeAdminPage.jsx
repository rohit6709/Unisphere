import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Users, 
  FileText,
  Megaphone,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/axios';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';

export default function NoticeAdminPage() {
  useDocumentTitle('Platform Announcements | Unisphere');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['notices-admin', search, priorityFilter],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/notices', {
        params: { search, priority: priorityFilter, limit: 50 }
      });
      return data.data.notices;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/v1/notices/${id}`),
    onSuccess: () => {
      toast.success('Notice deleted successfully');
      queryClient.invalidateQueries(['notices-admin']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete notice'),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-rose-500" />
            Announcement Control
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Publish university-wide notices, manage club bulletins, and broadcast urgent alerts.
          </p>
        </div>
        <Button className="rounded-2xl h-12 px-6 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20">
          <Plus className="mr-2 h-5 w-5" /> Broadcast New Notice
        </Button>
      </section>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-rose-500/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
           <select 
             value={priorityFilter}
             onChange={(e) => setPriorityFilter(e.target.value)}
             className="w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-rose-500/20 appearance-none shadow-sm font-bold text-gray-500"
           >
             <option value="">All Priorities</option>
             <option value="high">Urgent (High)</option>
             <option value="medium">Normal (Medium)</option>
             <option value="low">Info (Low)</option>
           </select>
           <button className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-rose-500 transition-all shadow-sm">
             <Filter className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* Notices Feed */}
      {isLoading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
        </div>
      ) : data?.length === 0 ? (
        <EmptyState title="No Announcements" description="Platform is currently quiet. Start by broadcasting a new notice." icon={Bell} className="py-20" />
      ) : (
        <div className="grid gap-6">
          {data.map((notice) => (
            <div
              key={notice._id}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm group relative overflow-hidden",
                notice.priority === 'high' ? "border-l-4 border-l-rose-500" :
                notice.priority === 'medium' ? "border-l-4 border-l-amber-500" :
                "border-l-4 border-l-blue-500"
              )}
            >
                 <div className="flex flex-col md:flex-row gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                      notice.priority === 'high' ? "bg-rose-50 text-rose-600" : 
                      notice.priority === 'medium' ? "bg-amber-50 text-amber-600" : 
                      "bg-blue-50 text-blue-600"
                    )}>
                      {notice.priority === 'high' ? <AlertTriangle className="h-7 w-7" /> : <Megaphone className="h-7 w-7" />}
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                             {new Date(notice.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric'})}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                             {notice.targetAudience.replace('_', ' ')}
                          </span>
                       </div>
                       
                       <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 truncate group-hover:text-rose-600 transition-colors">
                         {notice.title}
                       </h3>
                       <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6">
                         {notice.content}
                       </p>

                       <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                             <Users className="h-4 w-4" /> Posted By: {notice.postedBy?.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                             <Clock className="h-4 w-4" /> Expires: {notice.expiresAt ? new Date(notice.expiresAt).toLocaleDateString() : 'Indefinite'}
                          </div>
                          {notice.attachment?.url && (
                             <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-widest">
                                <FileText className="h-4 w-4" /> Attached: {notice.attachment.filename}
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="flex md:flex-col justify-end gap-2 shrink-0">
                       <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-gray-400 hover:text-rose-600">
                          <Eye className="h-5 w-5" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         className="rounded-xl h-12 w-12 p-0 text-gray-400 hover:text-red-600"
                         onClick={() => { if(confirm('Delete this notice?')) deleteMutation.mutate(notice._id); }}
                         isLoading={deleteMutation.isPending && deleteMutation.variables === notice._id}
                       >
                          <Trash2 className="h-5 w-5" />
                       </Button>
                       <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all">
                          <MoreVertical className="h-5 w-5" />
                       </button>
                    </div>
                 </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
