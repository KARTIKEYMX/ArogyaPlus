import { UserProfile, Doctor, Appointment, Reminder, MedicalReport } from '../types';

// Mock Database Initialization
const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1', name: 'Dr. Anjali Gupta', specialty: 'Cardiologist', hospital: 'Apollo Heart Center',
    rating: 4.9, experience: 12, fee: 1500, location: 'New Delhi',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea86065e?q=80&w=200&auto=format&fit=crop',
    availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM']
  },
  {
    id: 'd2', name: 'Dr. Rajesh Koothrappali', specialty: 'Neurologist', hospital: 'Max Super Specialty',
    rating: 4.7, experience: 8, fee: 2000, location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop',
    availableSlots: ['09:00 AM', '01:00 PM', '03:00 PM']
  },
  {
    id: 'd3', name: 'Dr. Sarah Connors', specialty: 'General Physician', hospital: 'City Care Clinic',
    rating: 4.8, experience: 15, fee: 800, location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop',
    availableSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '05:00 PM']
  },
  {
    id: 'd4', name: 'Dr. Strange', specialty: 'Surgeon', hospital: 'Metro Hospital',
    rating: 5.0, experience: 20, fee: 5000, location: 'New York (Remote)',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    availableSlots: ['08:00 PM', '09:00 PM']
  }
];

const INITIAL_REMINDERS: Reminder[] = [
  { id: '1', title: 'Vitamin D', time: '09:00', dosage: '1 Tablet', type: 'pill', taken: false },
  { id: '2', title: 'Amoxicillin', time: '14:00', dosage: '500mg', type: 'pill', taken: false },
];

const INITIAL_REPORTS: MedicalReport[] = [
  { 
    id: 'r1', title: 'Blood Chemistry', date: '2024-10-12', hospital: 'Apollo Hospital', type: 'PDF',
    content: "Patient shows elevated cholesterol levels (240 mg/dL). Glucose levels are normal (95 mg/dL). Vitamin D deficiency detected (15 ng/mL). Recommended lifestyle changes and supplements."
  },
];

export interface VitalData {
  timestamp: number;
  value: number;
}

// Service Class
class DataService {
  private userKey = 'arogya_user';
  private apptsKey = 'arogya_appts';
  private medsKey = 'arogya_meds';
  private reportsKey = 'arogya_reports';
  private vitalsKey = 'arogya_vitals';

  // Auth
  getUser(): UserProfile | null {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  saveUser(user: UserProfile) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(this.userKey);
  }

  // Doctors
  getAllDoctors(): Doctor[] {
    return MOCK_DOCTORS;
  }

  // Appointments
  getAppointments(): Appointment[] {
    const data = localStorage.getItem(this.apptsKey);
    return data ? JSON.parse(data) : [];
  }

  bookAppointment(appt: Appointment) {
    const current = this.getAppointments();
    const updated = [...current, appt];
    localStorage.setItem(this.apptsKey, JSON.stringify(updated));
    return updated;
  }

  // Medicines
  getReminders(): Reminder[] {
    const data = localStorage.getItem(this.medsKey);
    if (!data) {
      localStorage.setItem(this.medsKey, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    }
    return JSON.parse(data);
  }

  addReminder(reminder: Reminder) {
    const current = this.getReminders();
    const updated = [...current, reminder];
    localStorage.setItem(this.medsKey, JSON.stringify(updated));
    return updated;
  }

  toggleReminder(id: string) {
    const current = this.getReminders();
    const updated = current.map(r => r.id === id ? { ...r, taken: !r.taken } : r);
    localStorage.setItem(this.medsKey, JSON.stringify(updated));
    return updated;
  }

  // Reports
  getReports(): MedicalReport[] {
    const data = localStorage.getItem(this.reportsKey);
    if (!data) {
      localStorage.setItem(this.reportsKey, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(data);
  }

  addReport(report: MedicalReport) {
    const current = this.getReports();
    const updated = [report, ...current];
    localStorage.setItem(this.reportsKey, JSON.stringify(updated));
    return updated;
  }

  // Vitals Tracking (Persistent)
  getVitalsHistory(): VitalData[] {
    const data = localStorage.getItem(this.vitalsKey);
    if (data) {
        // Filter old data (older than 1 hour for this demo) to keep chart clean
        const parsed = JSON.parse(data);
        const oneHourAgo = Date.now() - 3600000;
        return parsed.filter((v: VitalData) => v.timestamp > oneHourAgo);
    }
    // Return some initial seed data if empty
    return Array.from({length: 20}, (_, i) => ({
      timestamp: Date.now() - (20 - i) * 1000,
      value: 70 + Math.random() * 10
    }));
  }

  addVitalReading(value: number) {
    const current = this.getVitalsHistory();
    const newReading = { timestamp: Date.now(), value };
    // Keep only last 50 readings
    const updated = [...current, newReading].slice(-50);
    localStorage.setItem(this.vitalsKey, JSON.stringify(updated));
    return updated;
  }
  
  // Helper to reset demo
  resetData() {
    localStorage.removeItem(this.medsKey);
    localStorage.removeItem(this.apptsKey);
    localStorage.removeItem(this.reportsKey);
    localStorage.removeItem(this.vitalsKey);
  }
}

export const dataService = new DataService();