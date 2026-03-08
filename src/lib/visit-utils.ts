import { Patient } from './types';

export type OverdueStatus = 'none' | 'followup-overdue' | 'urgent-overdue';

export function getOverdueStatus(patient: Patient): OverdueStatus {
  const last = patient.visits[patient.visits.length - 1];
  if (!last) return 'followup-overdue';

  const daysSince = Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24));
  const isHighRisk = last.riskLevel === 'HIGH';

  // High risk + >6 weeks (2 weeks past the 4-week due date) = urgent
  if (isHighRisk && daysSince > 42) return 'urgent-overdue';
  // >4 weeks since last visit = follow-up overdue
  if (daysSince > 28) return 'followup-overdue';
  return 'none';
}

export function getDaysSinceLastVisit(patient: Patient): number {
  const last = patient.visits[patient.visits.length - 1];
  if (!last) return 999;
  return Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24));
}

export function getNextVisitDueDate(patient: Patient): string | null {
  const last = patient.visits[patient.visits.length - 1];
  if (!last) return null;
  const due = new Date(last.date);
  due.setDate(due.getDate() + 28);
  return due.toISOString().split('T')[0];
}
