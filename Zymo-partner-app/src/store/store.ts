import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';
import carReducer from './slices/carSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    car: carReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;