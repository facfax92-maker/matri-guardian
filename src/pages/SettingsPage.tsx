import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Globe, Palette, Bell, Wifi, HardDrive, RefreshCw, Info, HelpCircle, Shield, FileText } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useTheme } from '@/hooks/use-theme';
import { toast } from 'sonner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [language, setLanguage] = useState('en');
  const [syncMode, setSyncMode] = useState('auto');
  const [notifications, setNotifications] = useState({
    highRisk: true,
    visitReminders: true,
    referralUpdates: true,
    marketing: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Preferences */}
        <div>
          <Card className="border-0 shadow-sm card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" /> Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label>Language</Label>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ne">नेपाली (Nepali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <Label>Dark Mode</Label>
                </div>
                <Switch checked={isDark} onCheckedChange={toggle} />
              </div>

              <Separator />

              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Notifications</Label>
              </div>
              {[
                { key: 'highRisk', label: 'High risk alerts' },
                { key: 'visitReminders', label: 'Visit reminders' },
                { key: 'referralUpdates', label: 'Referral updates' },
                { key: 'marketing', label: 'Marketing updates' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between pl-6">
                  <Label className="text-sm">{n.label}</Label>
                  <Switch
                    checked={notifications[n.key as keyof typeof notifications]}
                    onCheckedChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Data & Sync */}
        <div>
          <Card className="border-0 shadow-sm card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" /> Data & Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Offline Mode</Label>
                <Select value={syncMode} onValueChange={setSyncMode}>
                  <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Sync</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="wifi">WiFi Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-3.5 w-3.5" /> Storage Used
                </div>
                <span className="font-medium">24.5 MB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5" /> Last Synced
                </div>
                <span className="font-medium">2 minutes ago</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.success('Sync complete')}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Sync Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm card-gradient">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">App Version</span>
                <span className="font-medium">1.0.0 (Demo)</span>
              </div>
              {[
                { icon: HelpCircle, label: 'Help & Support' },
                { icon: Shield, label: 'Privacy Policy' },
                { icon: FileText, label: 'Terms of Service' },
              ].map(item => (
                <button key={item.label} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full text-left">
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
