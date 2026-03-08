import { RiskLevel, Proteinuria, EdemaLevel, HeadacheLevel, FetalMovement } from './types';

export function calculateRiskScore(
  systolic: number,
  diastolic: number,
  proteinuria: Proteinuria,
  edema: EdemaLevel,
  headache: HeadacheLevel,
  visualDisturbances: boolean,
  epigastricPain: boolean,
  fetalMovement: FetalMovement,
  previousScore?: number
): number {
  let score = 0;

  // Blood Pressure
  if (systolic >= 160 || diastolic >= 110) score += 40;
  else if (systolic >= 140 || diastolic >= 90) score += 20;

  // Proteinuria
  const protMap: Record<Proteinuria, number> = {
    'Negative': 0, 'Trace': 10, '1+': 20, '2+': 30, '3+': 40,
  };
  score += protMap[proteinuria] || 0;

  // Edema
  const edemaMap: Record<EdemaLevel, number> = {
    'None': 0, 'Mild (feet only)': 10, 'Moderate (legs)': 15, 'Severe (face and hands)': 25,
  };
  score += edemaMap[edema] || 0;

  // Headache
  const headacheMap: Record<HeadacheLevel, number> = {
    'None': 0, 'Mild': 5, 'Moderate': 10, 'Severe/persistent': 20,
  };
  score += headacheMap[headache] || 0;

  if (visualDisturbances) score += 30;
  if (epigastricPain) score += 15;

  // Fetal movement
  const fetalMap: Record<FetalMovement, number> = {
    'Normal': 0, 'Reduced': 15, 'Absent': 30,
  };
  score += fetalMap[fetalMovement] || 0;

  // Risk trend escalation
  if (previousScore !== undefined && score > previousScore + 20) {
    score += 15;
  }

  return Math.min(score, 100);
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'HIGH': return 'danger';
    case 'MODERATE': return 'warning';
    case 'LOW': return 'success';
  }
}
