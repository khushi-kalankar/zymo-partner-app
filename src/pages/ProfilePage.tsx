import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Save } from 'lucide-react';
import { RootState } from '../store/store';
import { fetchProfile, updateProfile } from '../store/slices/profileSlice';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSave = async () => {
    await dispatch(updateProfile(formData));
    setIsEditing(false);
  };

  if (profile.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 ">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>
          <Button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
          </Button>
        </div>

        {profile.error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{profile.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Brand Name"
            value={formData.brandName}
            onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Contact Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="GST Number"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Bank Account Name"
            value={formData.bankAccountName}
            onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Bank Account Number"
            value={formData.bankAccountNumber}
            onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="IFSC Code"
            value={formData.ifscCode}
            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cities Operated
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.cities.map((city) => (
              <div
                key={city}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}