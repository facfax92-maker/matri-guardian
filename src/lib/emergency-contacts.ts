export interface EmergencyContact {
  id: string;
  name: string;
  type: 'ambulance' | 'volunteer' | 'facility';
  phone: string;
  description: string;
  distance?: string;
  estimatedTime?: string;
}

export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'amb1',
    name: 'District Ambulance Service',
    type: 'ambulance',
    phone: '+977-9801234567',
    description: '24/7 emergency maternal transport',
    distance: '12 km',
    estimatedTime: '~35 min',
  },
  {
    id: 'amb2',
    name: 'Nepal Red Cross Ambulance',
    type: 'ambulance',
    phone: '+977-9807654321',
    description: 'Emergency response unit',
    distance: '18 km',
    estimatedTime: '~50 min',
  },
  {
    id: 'vol1',
    name: 'Ram Bahadur (Volunteer Driver)',
    type: 'volunteer',
    phone: '+977-9812345678',
    description: 'Available 6am-10pm, has 4WD vehicle',
    distance: '2 km',
    estimatedTime: '~5 min pickup',
  },
  {
    id: 'vol2',
    name: 'Suntali Tamang (Volunteer)',
    type: 'volunteer',
    phone: '+977-9845671234',
    description: 'Motorcycle transport, rapid response',
    distance: '1.5 km',
    estimatedTime: '~3 min pickup',
  },
  {
    id: 'fac1',
    name: 'District Hospital Maternity Ward',
    type: 'facility',
    phone: '+977-061-520123',
    description: 'Level 3 emergency obstetric care',
    distance: '12 km',
    estimatedTime: '~35 min by road',
  },
  {
    id: 'fac2',
    name: 'Primary Health Center (Banepa)',
    type: 'facility',
    phone: '+977-011-661234',
    description: 'Basic emergency obstetric care, birthing center',
    distance: '5 km',
    estimatedTime: '~15 min by road',
  },
];
