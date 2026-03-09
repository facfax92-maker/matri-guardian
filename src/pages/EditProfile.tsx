import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Camera } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: 'Radha Thapa',
    phone: '+977-9841234567',
    email: 'radha.thapa@fchv.gov.np',
    role: 'FCHV',
    area: 'Bhaktapur Ward 5',
    yearsOfService: '5',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    toast.success('Profile updated successfully');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary px-4 py-4 text-primary-foreground" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Edit Profile</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm card-gradient">
            <CardContent className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">RT</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-primary">Change Photo</Button>
              </div>

              {/* Fields */}
              {[
                { key: 'name', label: 'Full Name', type: 'text' },
                { key: 'phone', label: 'Phone Number', type: 'tel' },
                { key: 'email', label: 'Email', type: 'email' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  <Input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => update(f.key, e.target.value)}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={form.role} disabled className="bg-muted" />
              </div>

              <div className="space-y-1.5">
                <Label>Coverage Area</Label>
                <Input value={form.area} onChange={e => update('area', e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Years of Service</Label>
                <Input type="number" value={form.yearsOfService} onChange={e => update('yearsOfService', e.target.value)} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default EditProfile;
