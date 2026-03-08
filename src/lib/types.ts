export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type VisitType = 'Routine' | 'Follow-up' | 'Emergency';

export type Proteinuria = 'Negative' | 'Trace' | '1+' | '2+' | '3+';

export type EdemaLevel = 'None' | 'Mild (feet only)' | 'Moderate (legs)' | 'Severe (face and hands)';

export type HeadacheLevel = 'None' | 'Mild' | 'Moderate' | 'Severe/persistent';

export type FetalMovement = 'Normal' | 'Reduced' | 'Absent';

export type Urgency = 'URGENT' | 'ROUTINE';

export interface Visit {
  id: string;
  patientId: string;
  visitNumber: number;
  date: string;
  gestationalAge: number; // weeks
  visitType: VisitType;
  systolic: number;
  diastolic: number;
  weight: number;
  fundalHeight: number;
  proteinuria: Proteinuria;
  edema: EdemaLevel;
  headache: HeadacheLevel;
  visualDisturbances: boolean;
  epigastricPain: boolean;
  fetalMovement: FetalMovement;
  clinicalNotes: string;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gravida: number;
  para: number;
  lmpDate: string;
  gestationalAge: number; // current weeks
  village: string;
  phone: string;
  fchvAssigned: string;
  registrationDate: string;
  visits: Visit[];
}

export interface Referral {
  id: string;
  patientId: string;
  date: string;
  facility: string;
  urgency: Urgency;
  provisionalDiagnosis: string;
  additionalNotes: string;
  transportArranged: boolean;
  smsPreview: string;
  status: 'sent' | 'draft';
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  type: 'escalation' | 'followup' | 'referral';
  date: string;
}
