import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, CheckCircle2, AlertTriangle, ThumbsUp, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Feedback {
  id: string;
  referral_id: string;
  message: string;
  feedback_type: string;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  general: { label: 'Update', icon: MessageSquare, color: 'text-primary' },
  praise: { label: 'Praise', icon: ThumbsUp, color: 'text-success-foreground' },
  guidance: { label: 'Guidance', icon: Stethoscope, color: 'text-primary' },
  'follow-up-needed': { label: 'Follow-up', icon: AlertTriangle, color: 'text-warning-foreground' },
  urgent: { label: 'Urgent', icon: AlertTriangle, color: 'text-destructive' },
};

export function FCHVNotifications() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const fetchFeedback = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('fchv_feedback')
      .select('*')
      .eq('to_fchv', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setFeedbacks(data as Feedback[]);
      setUnreadCount(data.filter((f: Feedback) => !f.is_read).length);
    }
  };

  useEffect(() => {
    fetchFeedback();
    const channel = supabase
      .channel('fchv-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fchv_feedback' }, () => {
        fetchFeedback();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (feedback: Feedback) => {
    if (!feedback.is_read) {
      await supabase.from('fchv_feedback').update({ is_read: true }).eq('id', feedback.id);
      fetchFeedback();
    }
    setSelectedFeedback(feedback);
  };

  if (feedbacks.length === 0) return null;

  return (
    <div>
      <Button
        variant="outline"
        className="relative w-full justify-start gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <Bell className="h-4 w-4" />
        <span>Doctor Feedback</span>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-auto text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {feedbacks.slice(0, 5).map(fb => {
              const config = typeConfig[fb.feedback_type] || typeConfig.general;
              const FbIcon = config.icon;
              return (
                <Card
                  key={fb.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-0 shadow-sm ${!fb.is_read ? 'card-gradient-primary' : 'card-gradient'}`}
                  onClick={() => markAsRead(fb)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <FbIcon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] h-4">{config.label}</Badge>
                        {!fb.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2">{fb.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(fb.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && (() => {
                const cfg = typeConfig[selectedFeedback.feedback_type] || typeConfig.general;
                const Icon = cfg.icon;
                return <><Icon className={`h-5 w-5 ${cfg.color}`} />{cfg.label}</>;
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback && new Date(selectedFeedback.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">{selectedFeedback?.message}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
