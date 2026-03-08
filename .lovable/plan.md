### MatriCare - Maternal Health Risk Intelligence System

## Overview

A mobile-first SPA for Female Community Health Volunteers in Nepal to track pregnancies longitudinally, detect risk escalation, and generate referrals. All data stored locally (localStorage) with offline support.

## Pages & Features

### 1. Dashboard

- Welcome header with FCHV name ("Radha Thapa")
- Stats cards: Active Pregnancies, High Risk Cases, Follow-ups Due
- Quick action buttons (View Patients, Register New)
- Recent alerts feed
- Offline indicator banner

### 2. Patient List

- Search/filter bar
- Patient cards showing name, age, gestational age, village, risk badge (color-coded GREEN/YELLOW/RED), visit count
- Floating "+" FAB to register new patient
- Click navigates to patient detail

### 3. Patient Registration Form

- Fields: Name, age, gravida/para, LMP date, village/ward, phone, assigned FCHV

### 4. Patient Detail Page (Hero Feature)

- **Patient info header** with key demographics
- **Visit timeline** — horizontal scrollable timeline with color-coded risk dots connected by lines, showing risk trend visually
- **Risk trend chart** (Recharts line chart) with color gradient zones (green/yellow/red)
- **Risk escalation alert banner** when risk increased between visits
- **Symptom trends table** showing BP, proteinuria, edema, headaches across visits with trend arrows
- Action buttons: Add Visit, Generate Referral (red, only if high risk), View Full History

### 5. New Visit Form

- Date picker (default today), gestational age (auto-calc from LMP), visit type dropdown
- Vitals: BP systolic/diastolic, weight, fundal height
- Symptoms: proteinuria dropdown, edema radio, headache radio, visual disturbances toggle, epigastric pain toggle, fetal movement dropdown
- Clinical notes textarea
- **Live risk score preview** that updates as fields change, with color-coded badge
- Save/Cancel buttons

### 6. Visit Detail Page

- Visit summary card with large risk badge
- Vitals with comparison to previous visit
- Symptoms checklist with severity
- Clinical assessment (WHO criteria match count, provisional diagnosis, recommendations)
- Actions: Generate Referral, Edit Visit, Compare to Previous

### 7. Referral Generation

- Auto-filled patient data, vitals, risk score, visit history
- Form: facility dropdown, urgency (auto-set), provisional diagnosis with suggestions, notes, transport checkbox
- SMS preview section with formatted message
- Generate & Send / Save Draft / Cancel

### 8. Referral Success Page

- Success checkmark, timestamp, referral summary
- Next steps card (numbered checklist)
- Download PDF / View Patient / Return to Dashboard

## Core Logic

- **Risk scoring algorithm** per WHO guidelines (BP, proteinuria, edema, headache, visual disturbances, epigastric pain, fetal movement, trend escalation)
- Risk levels: 0-39 LOW (green), 40-69 MODERATE (yellow), 70+ HIGH (red)

## Sample Data

- 3 pre-loaded patients (Sita Sharma with 3 visits showing GREEN→YELLOW→RED escalation, Maya Tamang low risk, Kamala Rai moderate risk)

## Design

- Purple-blue gradient primary (#667eea), custom color scheme per spec
- Color-coded risk badges with distinct backgrounds
- Rounded cards with subtle shadows
- Mobile-first responsive (320px+), touch-friendly (44px min targets)
- Clean sans-serif typography

## Technical Approach

- React Router for navigation (Dashboard, Patient List, Patient Detail, Visit Form, Visit Detail, Referral, Referral Success)
- localStorage for all data persistence with offline support
- Recharts for risk trend graphs
- shadcn/ui components throughout
- Simulated SMS (preview only, no actual sending)