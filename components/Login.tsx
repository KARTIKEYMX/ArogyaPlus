import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { ArrowRight, Phone, Mail, Lock, User, Calendar, Heart, MapPin } from 'lucide-react';
import { dataService } from '../services/dataService';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [step, setStep] = useState<'method' | 'otp' | 'details'>('method');
  const [method, setMethod] = useState<'google' | 'mobile' | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: ''
  });

  const handleGoogleLogin = () => {
    setMethod('google');
    setFormData({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.s@example.com',
      gender: 'Male',
      dob: '1990-05-15'
    });
    setStep('details');
  };

  const handleMobileLogin = () => {
    setMethod('mobile');
    setStep('otp');
  };

  const verifyOtp = () => {
    setStep('details');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullProfile: UserProfile = {
      ...formData as UserProfile,
      arogyaId: `AP-${Math.floor(100000 + Math.random() * 900000)}`,
      mobile: formData.mobile || '9876543210'
    };
    
    dataService.saveUser(fullProfile);
    onLoginSuccess(fullProfile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-arogya-teal/10 rounded-b-[50%] -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full translate-y-1/3 translate-x-1/3 blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative z-10 animate-float">
        
        {step === 'method' && (
          <div className="space-y-8 text-center">
             <div className="mx-auto w-16 h-16 bg-gradient-to-br from-arogya-teal to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
                <span className="font-bold text-2xl">AP</span>
             </div>
             <div>
                <h2 className="text-2xl font-bold text-arogya-navy">Welcome Back</h2>
                <p className="text-gray-500 mt-2">Sign in to access your health records</p>
             </div>

             <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button 
                  onClick={handleMobileLogin}
                  className="w-full py-3 px-4 bg-arogya-navy text-white rounded-xl flex items-center justify-center gap-3 hover:bg-blue-900 transition font-medium shadow-lg shadow-blue-900/20"
                >
                  <Phone size={20} />
                  Login with Mobile
                </button>
             </div>
          </div>
        )}

        {step === 'otp' && (
           <div className="space-y-6">
              <button onClick={() => setStep('method')} className="text-gray-400 hover:text-arogya-navy flex items-center text-sm">← Back</button>
              <div>
                <h2 className="text-2xl font-bold text-arogya-navy">Verify Mobile</h2>
                <p className="text-gray-500 mt-1">Enter OTP sent to your number</p>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="tel" 
                  placeholder="Mobile Number"
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-arogya-teal outline-none"
                />
                <div className="flex gap-2">
                  {[1,2,3,4].map(i => (
                    <input key={i} type="text" maxLength={1} className="w-1/4 p-4 text-center bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-arogya-teal outline-none text-xl font-bold" />
                  ))}
                </div>
              </div>

              <button 
                onClick={verifyOtp}
                className="w-full py-3 bg-arogya-teal text-white rounded-xl font-bold hover:bg-teal-600 transition shadow-lg shadow-teal-500/30"
              >
                Verify & Continue
              </button>
           </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div className="text-center mb-6">
               <h2 className="text-xl font-bold text-arogya-navy">Complete Profile</h2>
               <p className="text-sm text-gray-500">Just a few more details</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                 <User className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                 <input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange}
                    placeholder="First Name" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm"
                 />
               </div>
               <div className="relative">
                 <input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange}
                    placeholder="Last Name" 
                    required
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm"
                 />
               </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              <input 
                 name="email" 
                 type="email"
                 value={formData.email} 
                 onChange={handleInputChange}
                 placeholder="Email Address" 
                 required
                 className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                 <Calendar className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                 <input 
                    name="dob" 
                    type="date"
                    value={formData.dob} 
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm text-gray-500"
                 />
               </div>
               <div className="relative">
                 <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm text-gray-500"
                 >
                   <option>Male</option>
                   <option>Female</option>
                   <option>Other</option>
                 </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                 <Heart className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                 <select 
                    name="bloodGroup" 
                    value={formData.bloodGroup} 
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm text-gray-500"
                 >
                   <option>A+</option>
                   <option>A-</option>
                   <option>B+</option>
                   <option>B-</option>
                   <option>O+</option>
                   <option>O-</option>
                   <option>AB+</option>
                   <option>AB-</option>
                 </select>
               </div>
               <div className="relative">
                 <input 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleInputChange}
                    placeholder="Mobile" 
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-arogya-teal focus:ring-1 focus:ring-arogya-teal outline-none text-sm"
                 />
               </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-arogya-teal text-white rounded-xl font-bold hover:bg-teal-600 transition shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 group"
            >
              Create ArogyaPlus ID <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};