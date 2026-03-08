import { Patient, Referral, Alert } from './types';
import { samplePatients, sampleAlerts } from './sample-data';

const PATIENTS_KEY = 'matricare_patients';
const REFERRALS_KEY = 'matricare_referrals';
const ALERTS_KEY = 'matricare_alerts';

function initIfEmpty<T>(key: string, defaults: T[]): void {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(defaults));
  }
}

export function initStorage(): void {
  initIfEmpty(PATIENTS_KEY, samplePatients);
  initIfEmpty(ALERTS_KEY, sampleAlerts);
  initIfEmpty(REFERRALS_KEY, []);
}

export function getPatients(): Patient[] {
  return JSON.parse(localStorage.getItem(PATIENTS_KEY) || '[]');
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

export function savePatient(patient: Patient): void {
  const patients = getPatients();
  const idx = patients.findIndex(p => p.id === patient.id);
  if (idx >= 0) patients[idx] = patient;
  else patients.push(patient);
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function getAlerts(): Alert[] {
  return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]');
}

export function addAlert(alert: Alert): void {
  const alerts = getAlerts();
  alerts.unshift(alert);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function getReferrals(): Referral[] {
  return JSON.parse(localStorage.getItem(REFERRALS_KEY) || '[]');
}

export function saveReferral(referral: Referral): void {
  const referrals = getReferrals();
  referrals.push(referral);
  localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
}
