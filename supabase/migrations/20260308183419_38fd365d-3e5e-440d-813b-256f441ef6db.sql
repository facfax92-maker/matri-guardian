
-- Create storage bucket for patient images (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-images', 'patient-images', false);

-- Create patient_images metadata table
CREATE TABLE public.patient_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('identification', 'edema', 'rash', 'jaundice', 'pallor', 'lab-result', 'referral-doc', 'citizenship', 'other')),
  visit_id TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  annotations JSONB DEFAULT '[]'::jsonb,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  face_blurred BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  deleted_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.patient_images ENABLE ROW LEVEL SECURITY;

-- RLS policies - authenticated users can manage images
CREATE POLICY "Authenticated users can view images"
  ON public.patient_images FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND expires_at > now());

CREATE POLICY "Authenticated users can insert images"
  ON public.patient_images FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update own images"
  ON public.patient_images FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Storage policies
CREATE POLICY "Authenticated users can upload patient images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'patient-images');

CREATE POLICY "Authenticated users can view patient images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'patient-images');

CREATE POLICY "Authenticated users can delete patient images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'patient-images');

-- Sync queue table for offline-first
CREATE TABLE public.sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  data JSONB NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync queue"
  ON public.sync_queue FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_patient_images_updated_at
  BEFORE UPDATE ON public.patient_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
