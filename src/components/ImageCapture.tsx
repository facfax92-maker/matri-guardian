import { useState, useRef, useCallback } from 'react';
import { compressImage, generateThumbnail, IMAGE_CATEGORIES, blobToDataUrl } from '@/lib/image-utils';
import { saveImageToIDB, addToSyncQueue } from '@/lib/indexed-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Upload, X, Check, Shield, AlertTriangle } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

interface ImageCaptureProps {
  patientId: string;
  patientName: string;
  visitId?: string;
  onCapture?: (imageId: string) => void;
  onClose?: () => void;
}

export function ImageCapture({ patientId, patientName, visitId, onCapture, onClose }: ImageCaptureProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'consent' | 'capture' | 'review'>('consent');
  const [consentGiven, setConsentGiven] = useState(false);
  const [category, setCategory] = useState<string>('other');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    const compressed = await compressImage(file);
    const url = await blobToDataUrl(compressed);
    setPreview(url);
    setSelectedFile(file);
    setStep('review');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSave = async () => {
    if (!selectedFile || !consentGiven) return;
    setSaving(true);

    try {
      const compressed = await compressImage(selectedFile);
      const thumbnail = await generateThumbnail(selectedFile);
      const id = `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await saveImageToIDB({
        id,
        patientId,
        category,
        visitId,
        blob: compressed,
        thumbnail,
        metadata: {
          originalName: selectedFile.name,
          originalSize: selectedFile.size,
          compressedSize: compressed.size,
          capturedAt: Date.now(),
        },
        annotations: [],
        consentGiven: true,
        consentTimestamp: Date.now(),
        faceBlurred: false,
        notes,
        createdAt: Date.now(),
        synced: false,
        syncStatus: 'pending',
      });

      await addToSyncQueue('image', id, 'create', { patientId, category }, 'medium');

      toast({ title: 'Image saved', description: 'Stored locally. Will sync when online.' });
      onCapture?.(id);
      onClose?.();
    } catch (err) {
      toast({ title: 'Error saving image', description: 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Capture Image</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <>
          {step === 'consent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-warning-bg border border-warning/30">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-warning-foreground text-sm">Patient Consent Required</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Before capturing any images, you must obtain verbal consent from <strong>{patientName}</strong>. 
                      Explain that images will be used for clinical documentation only, stored securely, and auto-deleted after 90 days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(c) => setConsentGiven(!!c)}
                />
                <Label htmlFor="consent" className="text-sm leading-tight">
                  I confirm that the patient has given verbal consent for clinical photography.
                  Patient understands the purpose, storage, and deletion policy.
                </Label>
              </div>

              <Button className="w-full" disabled={!consentGiven} onClick={() => setStep('capture')}>
                <Check className="h-4 w-4 mr-2" />
                Continue to Capture
              </Button>
            </div>
          )}

          {/* Step 2: Capture */}
          {step === 'capture' && (
            <div className="space-y-4">
              <div>
                <Label>Image Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 rounded-xl"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-primary" />
                  <span className="text-xs">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs">Upload File</span>
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleInputChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />

              <Button variant="ghost" className="w-full" onClick={() => setStep('consent')}>
                Back
              </Button>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && preview && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border">
                <img src={preview} alt="Captured" className="w-full max-h-64 object-contain bg-muted" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm h-8 w-8"
                  onClick={() => { setPreview(null); setStep('capture'); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{IMAGE_CATEGORIES.find(c => c.value === category)?.icon} {IMAGE_CATEGORIES.find(c => c.value === category)?.label}</span>
                {selectedFile && <span>· {(selectedFile.size / 1024).toFixed(0)} KB</span>}
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe what is visible..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setPreview(null); setStep('capture'); }}>
                  Retake
                </Button>
                <Button className="flex-1 gradient-primary text-primary-foreground border-0" disabled={saving} onClick={handleSave}>
                  {saving ? 'Saving...' : 'Save Image'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
