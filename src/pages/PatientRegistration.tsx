import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePatient } from '@/lib/storage';
import { Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', age: '', gravida: '', para: '', lmpDate: '', village: '', phone: '', fchvAssigned: 'Radha Thapa',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lmp = new Date(form.lmpDate);
    const now = new Date();
    const ga = Math.floor((now.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const patient: Patient = {
      id: `p${Date.now()}`,
      name: form.name,
      age: parseInt(form.age),
      gravida: parseInt(form.gravida),
      para: parseInt(form.para),
      lmpDate: form.lmpDate,
      gestationalAge: ga,
      village: form.village,
      phone: form.phone,
      fchvAssigned: form.fchvAssigned,
      registrationDate: new Date().toISOString().split('T')[0],
      visits: [],
    };

    savePatient(patient);
    toast({ title: 'Patient registered successfully' });
    navigate(`/patients/${patient.id}`);
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Register New Patient</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Patient Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g., Sita Sharma' },
                { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g., 28' },
                { key: 'gravida', label: 'Gravida (G)', type: 'number', placeholder: 'e.g., 2' },
                { key: 'para', label: 'Para (P)', type: 'number', placeholder: 'e.g., 1' },
                { key: 'lmpDate', label: 'Last Menstrual Period (LMP)', type: 'date' },
                { key: 'village', label: 'Village / Ward', type: 'text', placeholder: 'e.g., Bhaktapur Ward 5' },
                { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+977-...' },
              ].map(field => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => update(field.key, e.target.value)}
                    required
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="flex-1 gradient-primary text-primary-foreground border-0">Register Patient</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PatientRegistration;
