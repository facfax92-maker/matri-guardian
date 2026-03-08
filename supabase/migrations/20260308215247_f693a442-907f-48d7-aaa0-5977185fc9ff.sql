
-- Referrals table (migrating from localStorage to database)
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL DEFAULT '',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  facility TEXT NOT NULL DEFAULT '',
  urgency TEXT NOT NULL DEFAULT 'ROUTINE',
  provisional_diagnosis TEXT NOT NULL DEFAULT '',
  additional_notes TEXT DEFAULT '',
  transport_arranged BOOLEAN NOT NULL DEFAULT false,
  sms_preview TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  tracking_status TEXT NOT NULL DEFAULT 'pending',
  referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_doctor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral status updates / timeline
CREATE TABLE public.referral_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discharge summaries
CREATE TABLE public.discharge_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  diagnosis TEXT NOT NULL DEFAULT '',
  treatment_given TEXT NOT NULL DEFAULT '',
  medications TEXT DEFAULT '',
  follow_up_instructions TEXT DEFAULT '',
  outcome TEXT NOT NULL DEFAULT 'improved',
  discharged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FCHV feedback/notifications from doctors
CREATE TABLE public.fchv_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  from_doctor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_fchv UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL DEFAULT '',
  feedback_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discharge_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fchv_feedback ENABLE ROW LEVEL SECURITY;

-- Referrals RLS: doctors/admins see all, FCHVs/supervisors see their own referrals
CREATE POLICY "Doctors can view all referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (referred_by = auth.uid());

CREATE POLICY "Supervisors can view district referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Authenticated users can create referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_by);

CREATE POLICY "Doctors can update referrals" ON public.referrals
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- Referral updates RLS
CREATE POLICY "Authenticated can view referral updates" ON public.referral_updates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctors can create referral updates" ON public.referral_updates
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin') OR auth.uid() = created_by);

-- Discharge summaries RLS
CREATE POLICY "Authenticated can view discharge summaries" ON public.discharge_summaries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctors can create discharge summaries" ON public.discharge_summaries
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors can update discharge summaries" ON public.discharge_summaries
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- FCHV feedback RLS
CREATE POLICY "Doctors can create feedback" ON public.fchv_feedback
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Recipients can view feedback" ON public.fchv_feedback
  FOR SELECT TO authenticated
  USING (to_fchv = auth.uid() OR from_doctor = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Recipients can update feedback" ON public.fchv_feedback
  FOR UPDATE TO authenticated
  USING (to_fchv = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discharge_summaries_updated_at
  BEFORE UPDATE ON public.discharge_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for referral updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fchv_feedback;
