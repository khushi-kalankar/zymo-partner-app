import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Car, Check } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AccountType } from '../types/auth';
import { Eye, EyeOff } from 'lucide-react';

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
];

const CARS_RANGES = ['0-5', '5-10', '10-20', '20-50', '50-100', '100+'];

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  title: string;
  stepNumber: number;
  totalSteps: number;
  children?: React.ReactNode;
}

function Step({ isActive, isCompleted, title, stepNumber, totalSteps, children }: StepProps) {
  return (
    <div className={`relative ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      <div className="flex items-center">
        <div className="relative">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
            ${isCompleted 
              ? 'bg-green-500 border-green-500 text-white' 
              : isActive 
                ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg shadow-yellow-200'
                : 'bg-white border-gray-300 text-gray-500'
            }
          `}>
            {isCompleted ? <Check className="w-6 h-6" /> : stepNumber}
          </div>
          {stepNumber < totalSteps && (
            <div className={`
              absolute top-1/2 left-full h-0.5 w-8 -translate-y-1/2 transition-colors duration-300
              ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
            `} />
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`
            text-lg font-medium transition-colors duration-300
            ${isActive ? 'text-gray-900' : 'text-gray-500'}
          `}>
            {title}
          </h3>
          {isActive && children && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 ease-in-out transform hover:shadow-xl">
              {children}
            </div>
          )}
        </div>
      </div>
      {stepNumber < totalSteps && (
        <div className="ml-6 w-0.5 h-8 bg-gray-200" />
      )}
    </div>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    accountType: '' as AccountType,
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    cities: [] as string[],
    carsRange: '',
    bankAccount: '',
    ifscCode: '',
    upiId: '',
  });

  const steps = [
    {
      title: 'Account Type',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['individual', 'company'].map((type) => (
              <button
                key={type}
                type="button"
                className={`
                  px-4 py-3 border rounded-lg text-sm font-medium
                  ${formData.accountType === type
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 text-gray-500 hover:border-yellow-400 hover:bg-yellow-50'
                  }
                `}
                onClick={() => setFormData({ ...formData, accountType: type as AccountType })}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Account Credentials',
      content: (
        <div className="space-y-4">
          <Input
            id="username"
            label="Username"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={
              formData.confirmPassword && formData.password !== formData.confirmPassword
                ? "Passwords don't match"
                : undefined
            }
          />
        </div>
      ),
    },
    {
      title: 'Personal Information',
      content: (
        <div className="space-y-4">
          <Input
            id="fullName"
            label="Full Name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Cities Available
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map((city) => (
                <label key={city} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.cities.includes(city)}
                    onChange={(e) => {
                      const newCities = e.target.checked
                        ? [...formData.cities, city]
                        : formData.cities.filter((c) => c !== city);
                      setFormData({ ...formData, cities: newCities });
                    }}
                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700">{city}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Number of Cars
            </label>
            <select
              value={formData.carsRange}
              onChange={(e) => setFormData({ ...formData, carsRange: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
            >
              <option value="">Select a range</option>
              {CARS_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      title: 'Payment Information',
      content: (
        <div className="space-y-4">
          <Input
            id="bankAccount"
            label="Bank Account Number"
            required
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
          />
          <Input
            id="ifscCode"
            label="IFSC Code"
            required
            value={formData.ifscCode}
            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
          />
          <Input
            id="upiId"
            label="UPI ID (Optional)"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
          />
        </div>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on the last step, move to next step
    if (currentStep < steps.length) {
      // Validate current step
      if (currentStep === 1 && !formData.accountType) {
        setError('Please select an account type');
        return;
      }
      if (currentStep === 2) {
        if (!formData.username || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
      }
      if (currentStep === 3) {
        if (!formData.fullName || !formData.email || !formData.phone) {
          setError('Please fill in all required fields');
          return;
        }
        if (formData.cities.length === 0) {
          setError('Please select at least one city');
          return;
        }
        if (!formData.carsRange) {
          setError('Please select number of cars');
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
      setError(null);
      return;
    }

    // On final step, submit the form
    if (!formData.bankAccount || !formData.ifscCode) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      await setDoc(doc(db, 'profiles', user.uid), {
        username: formData.username,
        accountType: formData.accountType,
        fullName: formData.fullName,
        phone: formData.phone,
        cities: formData.cities,
        carsRange: formData.carsRange,
        bankAccount: formData.bankAccount,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      navigate('/home');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-xl mb-6 transform hover:scale-105 transition-transform duration-300">
            <Car className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-lg text-gray-600">
            Complete the following steps to get started
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {steps.map((step, index) => (
                <Step
                  key={step.title}
                  title={step.title}
                  stepNumber={index + 1}
                  totalSteps={steps.length}
                  isActive={currentStep === index + 1}
                  isCompleted={currentStep > index + 1}
                >
                  {step.content}
                </Step>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6"
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={`px-6 ${currentStep === 1 ? 'ml-auto' : ''}`}
                isLoading={isLoading}
              >
                {currentStep === steps.length ? 'Create Account' : 'Next'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}