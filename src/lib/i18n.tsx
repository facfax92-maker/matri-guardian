import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'ne';

const translations: Record<string, Record<Language, string>> = {
  // Brand
  'app.name': { en: 'MatriCare', ne: 'मातृकेयर' },
  'app.tagline': { en: 'Predicting Risk. Protecting Life.', ne: 'जोखिम पूर्वानुमान। जीवन सुरक्षा।' },

  // Navigation
  'nav.dashboard': { en: 'Dashboard', ne: 'ड्यासबोर्ड' },
  'nav.patients': { en: 'Patients', ne: 'बिरामीहरू' },
  'nav.portal': { en: 'Portal', ne: 'पोर्टल' },

  // Dashboard
  'dashboard.title': { en: 'Patient Dashboard', ne: 'बिरामी ड्यासबोर्ड' },
  'dashboard.activePregnancies': { en: 'Active Pregnancies', ne: 'सक्रिय गर्भावस्था' },
  'dashboard.highRiskCases': { en: 'High Risk Cases', ne: 'उच्च जोखिम केसहरू' },
  'dashboard.overdueVisits': { en: 'Overdue Visits', ne: 'म्याद नाघेको भेटहरू' },
  'dashboard.riskDistribution': { en: 'Risk Distribution', ne: 'जोखिम वितरण' },
  'dashboard.recentAlerts': { en: 'Recent Alerts', ne: 'हालका सूचनाहरू' },
  'dashboard.allClear': { en: 'All Clear!', ne: 'सबै ठीक छ!' },
  'dashboard.noAlerts': { en: 'No alerts right now. Keep up the great work monitoring your patients.', ne: 'अहिले कुनै सूचना छैन। बिरामीको निगरानी जारी राख्नुहोस्।' },
  'dashboard.register': { en: 'Register', ne: 'दर्ता' },

  // Risk levels
  'risk.high': { en: 'HIGH RISK', ne: 'उच्च जोखिम' },
  'risk.moderate': { en: 'MODERATE', ne: 'मध्यम जोखिम' },
  'risk.low': { en: 'LOW', ne: 'कम जोखिम' },
  'risk.normal': { en: 'Normal / Low Risk', ne: 'सामान्य / कम जोखिम' },
  'risk.score': { en: 'Risk Score', ne: 'जोखिम स्कोर' },
  'risk.outOf100': { en: 'out of 100', ne: '१०० मा' },

  // Patient list
  'patients.all': { en: 'All Patients', ne: 'सबै बिरामीहरू' },
  'patients.search': { en: 'Search patients or village...', ne: 'बिरामी वा गाउँ खोज्नुहोस्...' },
  'patients.noFound': { en: 'No patients found', ne: 'कुनै बिरामी भेटिएन' },
  'patients.registerFirst': { en: 'Register your first patient to get started', ne: 'सुरु गर्न पहिलो बिरामी दर्ता गर्नुहोस्' },
  'patients.registerPatient': { en: 'Register Patient', ne: 'बिरामी दर्ता' },
  'patients.lastVisit': { en: 'Last visit', ne: 'अन्तिम भेट' },

  // Overdue
  'overdue': { en: 'OVERDUE', ne: 'म्याद नाघेको' },
  'overdue.followup': { en: 'Follow-up Overdue', ne: 'फलो-अप म्याद नाघेको' },
  'overdue.urgentHighRisk': { en: 'URGENT: High Risk + Overdue', ne: 'अत्यावश्यक: उच्च जोखिम + म्याद नाघेको' },

  // Patient detail
  'patient.info': { en: 'Patient Info', ne: 'बिरामी जानकारी' },
  'patient.village': { en: 'Village', ne: 'गाउँ' },
  'patient.phone': { en: 'Phone', ne: 'फोन' },
  'patient.fchv': { en: 'FCHV', ne: 'स्वा.से.स्वा.' },
  'patient.registered': { en: 'Registered', ne: 'दर्ता मिति' },
  'patient.visitTimeline': { en: 'Visit Timeline', ne: 'भेट समयरेखा' },
  'patient.symptomTrends': { en: 'Symptom Trends', ne: 'लक्षण प्रवृत्ति' },
  'patient.addNewVisit': { en: 'Add New Visit', ne: 'नयाँ भेट थप्नुहोस्' },
  'patient.captureImage': { en: 'Capture Clinical Image', ne: 'क्लिनिकल तस्बिर खिच्नुहोस्' },
  'patient.postpartumScreening': { en: 'Postpartum Screening', ne: 'प्रसवोत्तर जाँच' },
  'patient.generateReferral': { en: 'Generate Referral', ne: 'प्रेषण बनाउनुहोस्' },
  'patient.riskBpTrends': { en: 'Risk & BP Trends', ne: 'जोखिम र रक्तचाप प्रवृत्ति' },

  // Escalation
  'escalation.detected': { en: 'RISK ESCALATION DETECTED', ne: 'जोखिम वृद्धि पत्ता लागेको' },
  'escalation.urgentReferral': { en: 'Urgent referral recommended.', ne: 'तत्काल प्रेषण सिफारिस गरिएको।' },

  // Vitals
  'vitals.bp': { en: 'Blood Pressure', ne: 'रक्तचाप' },
  'vitals.proteinuria': { en: 'Proteinuria', ne: 'प्रोटिनुरिया' },
  'vitals.edema': { en: 'Edema', ne: 'सुन्निनु' },
  'vitals.headache': { en: 'Headache', ne: 'टाउको दुखाइ' },
  'vitals.symptom': { en: 'Symptom', ne: 'लक्षण' },

  // Image capture
  'image.capture': { en: 'Capture Image', ne: 'तस्बिर खिच्नुहोस्' },
  'image.consentRequired': { en: 'Patient Consent Required', ne: 'सहमति आवश्यक छ' },
  'image.consentText': { en: 'Before capturing any images, you must obtain verbal consent from', ne: 'कुनै पनि तस्बिर खिच्नु अघि, तपाईंले मौखिक सहमति लिनुपर्छ' },
  'image.consentConfirm': { en: 'I confirm that the patient has given verbal consent for clinical photography. Patient understands the purpose, storage, and deletion policy.', ne: 'म पुष्टि गर्छु कि बिरामीले क्लिनिकल फोटोग्राफीको लागि मौखिक सहमति दिनुभएको छ।' },
  'image.continueTo': { en: 'Continue to Capture', ne: 'तस्बिर खिच्न जानुहोस्' },
  'image.category': { en: 'Image Category', ne: 'तस्बिर वर्ग' },
  'image.takePhoto': { en: 'Take Photo', ne: 'फोटो खिच्नुहोस्' },
  'image.uploadFile': { en: 'Upload File', ne: 'फाइल अपलोड' },
  'image.notes': { en: 'Notes (optional)', ne: 'टिप्पणी (ऐच्छिक)' },
  'image.retake': { en: 'Retake', ne: 'पुनः खिच्नुहोस्' },
  'image.save': { en: 'Save Image', ne: 'तस्बिर बचत' },
  'image.saving': { en: 'Saving...', ne: 'बचत गर्दै...' },
  'image.saved': { en: 'Image saved', ne: 'तस्बिर बचत भयो' },
  'image.linked': { en: '✓ Success: Image Linked', ne: '✓ सफल: तस्बिर लिंक भयो' },
  'image.storedLocally': { en: 'Stored locally. Will sync when online.', ne: 'स्थानीय रूपमा बचत गरियो। अनलाइन हुँदा सिंक हुनेछ।' },

  // Referral
  'referral': { en: 'Referral', ne: 'प्रेषण' },
  'referral.tracker': { en: 'Referral Tracker', ne: 'प्रेषण ट्र्याकर' },

  // Postpartum
  'postpartum': { en: 'Postpartum Screening', ne: 'प्रसवोत्तर जाँच' },
  'postpartum.results': { en: 'Postpartum Screening', ne: 'प्रसवोत्तर जाँच' },

  // Projection chart
  'projection.title': { en: 'Risk Trajectory', ne: 'जोखिम गतिपथ' },
  'projection.show': { en: 'Show Projection', ne: 'प्रक्षेपण देखाउनुहोस्' },
  'projection.hide': { en: 'Hide Projection', ne: 'प्रक्षेपण लुकाउनुहोस्' },
  'projection.untreated': { en: 'Projected if untreated', ne: 'उपचार नगरेमा अनुमानित' },
  'projection.treated': { en: 'With referral & treatment', ne: 'प्रेषण र उपचारसहित' },

  // Settings
  'settings': { en: 'Settings', ne: 'सेटिङ' },
  'settings.preferences': { en: 'Preferences', ne: 'प्राथमिकता' },
  'settings.language': { en: 'Language', ne: 'भाषा' },
  'settings.darkMode': { en: 'Dark Mode', ne: 'डार्क मोड' },
  'settings.notifications': { en: 'Notifications', ne: 'सूचनाहरू' },
  'settings.highRiskAlerts': { en: 'High risk alerts', ne: 'उच्च जोखिम सूचना' },
  'settings.visitReminders': { en: 'Visit reminders', ne: 'भेट रिमाइन्डर' },
  'settings.referralUpdates': { en: 'Referral updates', ne: 'प्रेषण अपडेट' },
  'settings.marketingUpdates': { en: 'Marketing updates', ne: 'मार्केटिङ अपडेट' },
  'settings.dataSync': { en: 'Data & Sync', ne: 'डाटा र सिंक' },
  'settings.offlineMode': { en: 'Offline Mode', ne: 'अफलाइन मोड' },
  'settings.storageUsed': { en: 'Storage Used', ne: 'भण्डारण प्रयोग' },
  'settings.lastSynced': { en: 'Last Synced', ne: 'अन्तिम सिंक' },
  'settings.syncNow': { en: 'Sync Now', ne: 'अहिले सिंक' },
  'settings.syncComplete': { en: 'Sync complete', ne: 'सिंक सम्पन्न' },
  'settings.about': { en: 'About', ne: 'बारेमा' },
  'settings.appVersion': { en: 'App Version', ne: 'एप संस्करण' },
  'settings.helpSupport': { en: 'Help & Support', ne: 'सहायता र समर्थन' },
  'settings.privacyPolicy': { en: 'Privacy Policy', ne: 'गोपनीयता नीति' },
  'settings.termsOfService': { en: 'Terms of Service', ne: 'सेवा सर्तहरू' },

  // Patient name translations
  'name.Sita Sharma': { en: 'Sita Sharma', ne: 'सीता शर्मा' },
  'name.Maya Tamang': { en: 'Maya Tamang', ne: 'माया तामाङ' },
  'name.Kamala Rai': { en: 'Kamala Rai', ne: 'कमला राई' },
  'name.Priya Thapa': { en: 'Priya Thapa', ne: 'प्रिया थपा' },

  // Hospital Portal / Health Ministry
  'portal.title': { en: 'Health Ministry Dashboard', ne: 'स्वास्थ्य मन्त्रालय ड्यासबोर्ड' },
  'portal.activeHighRisk': { en: 'Active High-Risk Cases', ne: 'सक्रिय उच्च-जोखिम केसहरू' },
  'portal.pendingReferrals': { en: 'Pending Referrals', ne: 'विचाराधीन प्रेषणहरू' },
  'portal.volunteerSync': { en: 'Volunteer Sync Status', ne: 'स्वयंसेविका सिंक स्थिति' },
  'portal.recentAlerts': { en: 'Recent Alerts', ne: 'हालका सूचनाहरू' },
  'portal.active': { en: 'Active', ne: 'सक्रिय' },
  'portal.urgent': { en: 'Urgent', ne: 'अत्यावश्यक' },
  'portal.discharged': { en: 'Discharged', ne: 'डिस्चार्ज' },
  'portal.updateStatus': { en: 'Update Status', ne: 'स्थिति अपडेट' },
  'portal.discharge': { en: 'Discharge', ne: 'डिस्चार्ज' },
  'portal.noActive': { en: 'No active referrals', ne: 'कुनै सक्रिय प्रेषण छैन' },
  'portal.noUrgent': { en: 'No urgent referrals', ne: 'कुनै अत्यावश्यक प्रेषण छैन' },
  'portal.noDischarged': { en: 'No discharged referrals yet', ne: 'अहिलेसम्म डिस्चार्ज प्रेषण छैन' },
  'portal.loading': { en: 'Loading referrals...', ne: 'प्रेषणहरू लोड हुँदैछ...' },

  // Export referral
  'export.title': { en: 'Export Referral Package', ne: 'प्रेषण प्याकेज निर्यात' },
  'export.share': { en: 'Share via WhatsApp', ne: 'WhatsApp मार्फत साझा गर्नुहोस्' },
  'export.copy': { en: 'Copy to Clipboard', ne: 'क्लिपबोर्डमा कपी गर्नुहोस्' },
  'export.copied': { en: 'Copied!', ne: 'कपी भयो!' },
  'export.sms': { en: 'Share via SMS', ne: 'SMS मार्फत साझा गर्नुहोस्' },

  // Offline status
  'offline.localMode': { en: 'Local Mode Active', ne: 'स्थानीय मोड सक्रिय' },
  'offline.pendingSync': { en: 'Pending Sync', ne: 'सिंक बाँकी' },

  // Common
  'common.back': { en: 'Back', ne: 'पछाडि' },
  'common.all': { en: 'All', ne: 'सबै' },
  'common.total': { en: 'Total', ne: 'जम्मा' },
  'common.views': { en: 'visits', ne: 'भेटहरू' },
  'common.sortName': { en: 'Name (A-Z)', ne: 'नाम (A-Z)' },
  'common.sortGAHigh': { en: 'GA (Highest first)', ne: 'GA (उच्च पहिले)' },
  'common.sortGALow': { en: 'GA (Lowest first)', ne: 'GA (कम पहिले)' },
  'common.sortLastVisit': { en: 'Last Visit (Recent)', ne: 'अन्तिम भेट (हालको)' },
  'common.dAgo': { en: 'd ago', ne: 'दिन अघि' },
  'common.weeksGA': { en: 'weeks GA', ne: 'हप्ता GA' },
  'common.autoSync': { en: 'Auto Sync', ne: 'स्वचालित सिंक' },
  'common.manual': { en: 'Manual', ne: 'म्यानुअल' },
  'common.wifiOnly': { en: 'WiFi Only', ne: 'WiFi मात्र' },
  'common.minutesAgo': { en: '2 minutes ago', ne: '२ मिनेट अघि' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tName: (name: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  tName: (name: string) => name,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  }, [language]);

  const tName = useCallback((name: string): string => {
    const key = `name.${name}`;
    return translations[key]?.[language] || name;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, tName }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
