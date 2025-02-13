import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface Profile {
  username: string;
  email: string;
  brandName: string;
  phone: string;
  gstNumber: string;
  bankAccountName: string;
  bankAccountNumber: string;
  ifscCode: string;
  cities: string[];
  loading: boolean;
  error: string | null;
}

const initialState: Profile = {
  username: '',
  email: '',
  brandName: '',
  phone: '',
  gstNumber: '',
  bankAccountName: '',
  bankAccountNumber: '',
  ifscCode: '',
  cities: [],
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async () => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const docRef = doc(db, 'profiles', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Profile not found');
    return docSnap.data() as Profile;
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profile: Partial<Profile>) => {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const docRef = doc(db, 'profiles', auth.currentUser.uid);
    await updateDoc(docRef, profile);
    return profile;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload); // ✅ Directly update state properties
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload); // Correct state update
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      });
  },
});

export default profileSlice.reducer;