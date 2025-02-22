import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Save } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { fetchProfile, updateProfile } from '../store/slices/profileSlice';
import { Input } from '../components/Input';

export function ProfilePage() {
  const dispatch: AppDispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile && !profile.loading) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    await dispatch(updateProfile(formData));
    setIsEditing(false);
  };

  if (profile.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime"></div>
      </div>
    );
  }

  return (
    <div className='bg-lime rounded-2xl dark:bg-transparent'>
    <div className="max-w-4xl mx-auto px-4 py-8 text-lime-400">
  <div className="dark:bg-darkgray bg-white rounded-2xl shadow-lg p-6 animate-slide-in border border-lime ">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-lime-200 text-darklime dark:text-lime p-3 rounded-full">
              <User className="h-6 w-6 text-lime-600" />
            </div>
            <h1 className="text-2xl font-bold dark:text-lime text-darklime">Profile Settings</h1>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center space-x-2 font-semibold bg-lime px-4 py-2 rounded-full"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
          </button>
        </div>

        {/* Profile Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Input
            label={<span className="text-darklime dark:text-lime">Email</span>}
            type="email"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <Input
            label={<span className="text-darklime dark:text-lime">Brand Name</span>}
            value={formData.brandName}
            onChange={(e) =>
              setFormData({ ...formData, brandName: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <Input
            label={<span className="text-darklime dark:text-lime">Contact Number</span>}
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <Input
            label={<span className="text-darklime dark:text-lime">GST Number</span>}
            value={formData.gstNumber}
            onChange={(e) =>
              setFormData({ ...formData, gstNumber: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <Input
            label={<span className="text-darklime dark:text-lime">Bank Account Name</span>}
            value={formData.bankAccountName}
            onChange={(e) =>
              setFormData({ ...formData, bankAccountName: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <Input
            label={<span className="text-darklime dark:text-lime">Bank Account Number</span>}
            value={formData.bankAccount}
            onChange={(e) =>
              setFormData({ ...formData, bankAccount: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <Input
            label={<span className="text-darklime dark:text-lime">IFSC Code</span>}
            value={formData.ifscCode}
            onChange={(e) =>
              setFormData({ ...formData, ifscCode: e.target.value })
            }
            className="text-white"
            disabled={!isEditing}
          />
          <div>
          <div className='my-4 mx-1 text-darklime dark:text-lime '>
          Logo
          {profile.logo ? (
    <img src={profile.logo} alt="Brand Logo" className="w-32 h-32 object-contain rounded-lg mt-1" />
  ) : (
    <p className="text-gray-400">No logo uploaded</p>
  )}
        </div>

          </div>
          
        </div>

        

        {/* Cities Operated Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-darklime dark:text-lime m-1">
            Cities Operated
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.cities.map((city) => (
              <div
                key={city}
                className="px-3 py-1 bg-lime rounded-full text-sm"
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}