import React, { useState } from 'react';
import { Doctor, Appointment, MedicalReport, Reminder } from '../types';
import { Search, MapPin, Calendar, Clock, Star, Plus, Upload, X, CheckCircle, DollarSign, Filter } from 'lucide-react';
import { dataService } from '../services/dataService';

// --- Doctor Finder & Booking Component ---
interface DoctorFinderProps {
  onClose: () => void;
  onBook: (appt: Appointment) => void;
}

export const DoctorFinder: React.FC<DoctorFinderProps> = ({ onClose, onBook }) => {
  const [doctors] = useState<Doctor[]>(dataService.getAllDoctors());
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<'list' | 'book' | 'confirm'>('list');

  const filteredDocs = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmBooking = () => {
    if (!selectedDoc || !selectedSlot) return;
    
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: new Date().toISOString().split('T')[0], // Booking for today for demo
      time: selectedSlot,
      status: 'upcoming',
      type: 'video'
    };

    dataService.bookAppointment(newAppt);
    onBook(newAppt);
    setStep('confirm');
  };

  return (
    <div className="h-full flex flex-col">
      {step === 'list' && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search doctors, specialties..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-arogya-teal outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:shadow-md transition cursor-pointer" onClick={() => { setSelectedDoc(doc); setStep('book'); }}>
                <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800">{doc.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                      <Star size={12} fill="currentColor" /> {doc.rating}
                    </div>
                  </div>
                  <p className="text-arogya-teal text-sm font-medium">{doc.specialty}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {doc.hospital}, {doc.location}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                     <span className="text-sm font-bold text-gray-700">₹{doc.fee}</span>
                     <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
                       {doc.experience} Yrs Exp
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'book' && selectedDoc && (
        <div className="flex-1 flex flex-col animate-fade-in">
          <button onClick={() => setStep('list')} className="mb-4 text-sm text-gray-500 hover:text-arogya-teal">← Back to list</button>
          
          <div className="flex items-center gap-4 mb-6">
             <img src={selectedDoc.image} alt={selectedDoc.name} className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
             <div>
               <h3 className="text-xl font-bold text-gray-800">{selectedDoc.name}</h3>
               <p className="text-arogya-teal">{selectedDoc.specialty}</p>
             </div>
          </div>

          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={18}/> Select Today's Slot</h4>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {selectedDoc.availableSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot ? 'bg-arogya-teal text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {slot}
              </button>
            ))}
          </div>

          <div className="mt-auto">
            <button 
              disabled={!selectedSlot}
              onClick={handleConfirmBooking}
              className="w-full py-3 bg-arogya-navy text-white rounded-xl font-bold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
             <CheckCircle size={40} />
           </div>
           <h3 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h3>
           <p className="text-gray-500 mt-2">Your appointment with {selectedDoc?.name} is scheduled for {selectedSlot}.</p>
           <button onClick={onClose} className="mt-8 px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200">Done</button>
        </div>
      )}
    </div>
  );
};

// --- Report Uploader Component ---
interface ReportUploaderProps {
  onUpload: () => void;
}

export const ReportUploader: React.FC<ReportUploaderProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        const newReport: MedicalReport = {
          id: Math.random().toString(36).substr(2, 9),
          title: file.name.split('.')[0] || 'Uploaded Report',
          date: new Date().toISOString().split('T')[0],
          hospital: 'External Upload',
          type: 'PDF',
          content: "Uploaded document content analysis pending. Please use the 'Analyze with AI' button to extract medical insights from this document."
        };
        dataService.addReport(newReport);
        setIsUploading(false);
        onUpload();
      }, 2000);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-arogya-teal transition bg-gray-50 cursor-pointer relative">
      {isUploading ? (
        <div className="flex flex-col items-center">
           <div className="w-10 h-10 border-4 border-arogya-teal border-t-transparent rounded-full animate-spin mb-3"></div>
           <p className="text-arogya-teal font-medium">Securely uploading...</p>
        </div>
      ) : (
        <>
          <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3">
             <Upload size={24} />
          </div>
          <h3 className="font-bold text-gray-700">Upload New Report</h3>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>
        </>
      )}
    </div>
  );
};

// --- Medicine Form Component ---
interface MedicineFormProps {
  onAdd: () => void;
  onCancel: () => void;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [dosage, setDosage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !time) return;

    const newMed: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      title: name,
      time,
      dosage: dosage || 'As prescribed',
      type: 'pill',
      taken: false
    };
    dataService.addReminder(newMed);
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Medicine Name</label>
        <input 
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Paracetamol" 
          className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 mt-1 focus:ring-1 focus:ring-arogya-teal outline-none"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Time</label>
          <input 
            type="time" 
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 mt-1 outline-none"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Dosage</label>
          <input 
            type="text" 
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="e.g. 500mg" 
            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 mt-1 outline-none"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
        <button type="submit" className="flex-1 py-3 bg-arogya-teal text-white rounded-xl font-bold">Add Reminder</button>
      </div>
    </form>
  );
};