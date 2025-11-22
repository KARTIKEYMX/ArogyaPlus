import React from 'react';

export enum AppView {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  TELECONSULT = 'TELECONSULT'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  arogyaId: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  photoUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  experience: number;
  fee: number;
  image: string;
  location: string;
  availableSlots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'video' | 'in-person';
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export type ChatMessage = {
  id?: string;
  role: 'user' | 'model' | 'doctor';
  text: string;
  timestamp: Date;
};

export interface Reminder {
  id: string;
  title: string;
  time: string;
  dosage: string;
  type: 'pill' | 'liquid' | 'injection';
  taken: boolean;
}

export interface MedicalReport {
  id: string;
  title: string;
  date: string;
  hospital: string;
  type: string;
  content?: string; // For AI analysis
}

// Structured AI Response Types
export interface AIReportAnalysis {
  summary: string;
  findings: { severity: 'low' | 'medium' | 'high'; text: string }[];
  recommendations: string[];
  medicalTerms: { term: string; definition: string }[];
}

export interface HealthInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  score?: number;
}

export interface ARScanResult {
  name: string;
  usage: string;
  sideEffects: string;
  confidence: number;
}