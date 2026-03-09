import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, Stethoscope, Send, X, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: 'Register Patients',
    description: 'Add pregnant women in your ward and track their pregnancies from first visit to delivery.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: AlertTriangle,
    title: 'Detect Risk Early',
    description: 'MatriCare automatically scores each visit to flag high-risk cases before they become emergencies.',
    color: 'text-warning-foreground',
    bg: 'bg-warning/10',
  },
  {
    icon: Send,
    title: 'Generate Referrals',
    description: 'Create SMS referral messages for high-risk patients to send to the nearest health facility.',
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    icon: Stethoscope,
    title: 'Hospital Coordination',
    description: 'Doctors can update referral status and send feedback directly to you through the app.',
    color: 'text-success-foreground',
    bg: 'bg-success/10',
  },
];

export const OnboardingWalkthrough = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('matricare-onboarding-complete');
    if (!seen) setShow(true);
  }, []);

  const complete = () => {
    localStorage.setItem('matricare-onboarding-complete', 'true');
    setShow(false);
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
    else complete();
  };

  if (!show) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 list-item-in">
      <Card className="w-full max-w-sm border-0 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-6 bg-primary' : i < currentStep ? 'w-3 bg-primary/40' : 'w-3 bg-muted'
                  }`}
                />
              ))}
            </div>
            <button onClick={complete} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8 text-center" key={currentStep}>
            <div className={`mx-auto h-16 w-16 rounded-2xl ${step.bg} flex items-center justify-center mb-5 list-item-in`}>
              <StepIcon className={`h-8 w-8 ${step.color}`} />
            </div>
            <h2 className="text-lg font-bold mb-2 list-item-in" style={{ animationDelay: '100ms' }}>
              {step.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed list-item-in" style={{ animationDelay: '200ms' }}>
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setCurrentStep(s => s - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < steps.length - 1 ? (
              <Button className="rounded-xl gradient-primary text-primary-foreground border-0 btn-press" onClick={next}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button className="rounded-xl gradient-primary text-primary-foreground border-0 btn-press" onClick={complete}>
                Get Started 🎉
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
