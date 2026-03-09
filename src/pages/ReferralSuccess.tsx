import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPatient } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, User, Home, Printer } from 'lucide-react';
import { Patient, Referral } from '@/lib/types';
import { RiskBadge } from '@/components/RiskBadge';

import { useRef } from 'react';

const ReferralSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const referral = (location.state as { referral?: Referral })?.referral;
  const [patient, setPatient] = useState<Patient | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) setPatient(getPatient(id) || null);
  }, [id]);

  const lastVisit = patient?.visits[patient.visits.length - 1];

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MatriCare Referral - ${patient?.name || 'Patient'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; padding: 40px; }
          .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #667eea; font-size: 24px; margin-bottom: 4px; }
          .header p { color: #666; font-size: 12px; }
          .urgent-badge { background: #f8d7da; border: 2px solid #dc3545; color: #721c24; padding: 8px 24px; border-radius: 20px; font-weight: bold; font-size: 16px; display: inline-block; margin: 15px 0; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 14px; font-weight: 600; color: #667eea; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; margin-bottom: 12px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
          .row .label { color: #666; font-size: 13px; }
          .row .value { font-weight: 600; font-size: 13px; }
          .sms-box { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #667eea; text-align: center; color: #999; font-size: 11px; }
          .risk-high { color: #dc3545; font-weight: bold; }
          .visits-summary { background: #f8f9fa; border-radius: 8px; padding: 12px; margin-top: 8px; }
          .visits-summary table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .visits-summary th, .visits-summary td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e0e0e0; }
          .visits-summary th { font-weight: 600; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MatriCare</h1>
          <p>Maternal Health Risk Intelligence System</p>
          <p style="margin-top: 8px; font-size: 14px; font-weight: 600;">MATERNAL REFERRAL DOCUMENT</p>
          ${referral?.urgency === 'URGENT' ? '<div class="urgent-badge">⚠ URGENT REFERRAL</div>' : ''}
        </div>

        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="row"><span class="label">Name</span><span class="value">${patient?.name || '—'}, ${patient?.age || '—'}y</span></div>
          <div class="row"><span class="label">Gravida / Para</span><span class="value">G${patient?.gravida || '—'}P${patient?.para || '—'}</span></div>
          <div class="row"><span class="label">Gestational Age</span><span class="value">${patient?.gestationalAge || '—'} weeks</span></div>
          <div class="row"><span class="label">Village</span><span class="value">${patient?.village || '—'}</span></div>
          <div class="row"><span class="label">Phone</span><span class="value">${patient?.phone || '—'}</span></div>
          <div class="row"><span class="label">FCHV</span><span class="value">${patient?.fchvAssigned || '—'}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Clinical Assessment</div>
          <div class="row"><span class="label">Risk Score</span><span class="value risk-high">${lastVisit?.riskScore || '—'} / 100 (${lastVisit?.riskLevel || '—'})</span></div>
          <div class="row"><span class="label">Blood Pressure</span><span class="value">${lastVisit?.systolic || '—'}/${lastVisit?.diastolic || '—'} mmHg</span></div>
          <div class="row"><span class="label">Proteinuria</span><span class="value">${lastVisit?.proteinuria || '—'}</span></div>
          <div class="row"><span class="label">Edema</span><span class="value">${lastVisit?.edema || '—'}</span></div>
          <div class="row"><span class="label">Headache</span><span class="value">${lastVisit?.headache || '—'}</span></div>
          <div class="row"><span class="label">Visual Disturbances</span><span class="value">${lastVisit?.visualDisturbances ? 'Yes' : 'No'}</span></div>
          <div class="row"><span class="label">Epigastric Pain</span><span class="value">${lastVisit?.epigastricPain ? 'Yes' : 'No'}</span></div>
        </div>

        ${patient && patient.visits.length > 0 ? `
        <div class="section">
          <div class="section-title">Visit History</div>
          <div class="visits-summary">
            <table>
              <thead><tr><th>Visit</th><th>Date</th><th>GA</th><th>BP</th><th>Risk</th></tr></thead>
              <tbody>
                ${patient.visits.map(v => `
                  <tr>
                    <td>Visit ${v.visitNumber}</td>
                    <td>${v.date}</td>
                    <td>${v.gestationalAge}wk</td>
                    <td>${v.systolic}/${v.diastolic}</td>
                    <td>${v.riskLevel} (${v.riskScore})</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Referral Details</div>
          <div class="row"><span class="label">Facility</span><span class="value">${referral?.facility || '—'}</span></div>
          <div class="row"><span class="label">Urgency</span><span class="value risk-high">${referral?.urgency || '—'}</span></div>
          <div class="row"><span class="label">Provisional Diagnosis</span><span class="value">${referral?.provisionalDiagnosis || '—'}</span></div>
          <div class="row"><span class="label">Transport</span><span class="value">${referral?.transportArranged ? 'Arranged' : 'Not yet arranged'}</span></div>
          <div class="row"><span class="label">Generated</span><span class="value">${referral?.date ? new Date(referral.date).toLocaleString() : '—'}</span></div>
          ${referral?.additionalNotes ? `<div class="row"><span class="label">Notes</span><span class="value">${referral.additionalNotes}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">SMS Content</div>
          <div class="sms-box">${referral?.smsPreview || '—'}</div>
        </div>

        <div class="footer">
          <p>Generated by MatriCare — Maternal Health Risk Intelligence System</p>
          <p>Document generated on ${new Date().toLocaleString()}</p>
          <p style="margin-top: 8px;">This is a computer-generated document. Please verify all clinical details.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-bg mb-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Referral Generated Successfully</h1>
          <p className="text-muted-foreground mt-2">{new Date().toLocaleString()}</p>
        </div>

        {/* Referral Summary */}
        {referral && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Referral Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Facility</span><span className="font-medium">{referral.facility}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Urgency</span><span className="font-semibold text-danger">{referral.urgency}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Diagnosis</span><span className="font-medium">{referral.provisionalDiagnosis}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transport</span><span className="font-medium">{referral.transportArranged ? 'Arranged' : 'Not arranged'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SMS Status</span><span className="font-medium text-success">Sent (simulated)</span></div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Next Steps</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {[
                'Help arrange transport (within 2 hours)',
                'Follow up within 24 hours to confirm arrival',
                'Record outcome in system when available',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pb-6">
          <Button variant="outline" className="h-12" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="secondary" className="h-12" onClick={() => navigate(`/patients/${id}`)}>
            <User className="h-4 w-4 mr-2" />
            View Patient Record
          </Button>
          <Button className="gradient-primary text-primary-foreground border-0 h-12" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ReferralSuccess;
