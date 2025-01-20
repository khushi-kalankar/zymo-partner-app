import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { Button } from '../components/Button';

export function AuthPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-yellow-400 p-4 rounded-full">
              <Car className="h-16 w-16 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
            Welcome to CarRental
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your trusted platform for car rentals
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            fullWidth
            onClick={() => navigate('/login')}
            className="py-3 text-lg"
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate('/signup')}
            className="py-3 text-lg"
          >
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}