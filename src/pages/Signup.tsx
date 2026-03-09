import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';


const DISTRICTS = [
  'Bhaktapur', 'Kathmandu', 'Lalitpur', 'Kavrepalanchok', 'Sindhupalchok',
  'Dolakha', 'Ramechhap', 'Sindhuli', 'Makwanpur', 'Chitwan',
];

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'fchv' as string,
    district: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.fullName,
          phone: form.phone,
          role: form.role,
          district: form.district,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 pb-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <h2 className="text-xl font-bold">Check Your Email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a verification link to <strong>{form.email}</strong>. 
                Please verify your email to activate your account.
              </p>
              <Link to="/login">
                <Button variant="outline" className="mt-4">Back to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-4 py-2 rounded-2xl mb-4">
            <Activity className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">MatriCare</span>
          </div>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="e.g., Radha Thapa" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input id="signupEmail" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="your@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPhone">Phone Number</Label>
                <Input id="signupPhone" type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+977-98XXXXXXXX" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => updateForm('role', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fchv">FCHV</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={form.district} onValueChange={v => updateForm('district', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <Input id="signupPassword" type="password" value={form.password} onChange={e => updateForm('password', e.target.value)} placeholder="Min 6 characters" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} placeholder="••••••••" required />
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
