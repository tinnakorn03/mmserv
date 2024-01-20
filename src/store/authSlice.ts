// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  role: string | null;
}

const initialState: AuthState = {
  token: null,
  role: 'other'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload; 
    },
    setRole(state, action: PayloadAction<string>) {
      state.role = action.payload; 
    },
    clearTokenRedux(state) {
      state.token = null;
    },
  },
});

export const { setToken, setRole, clearTokenRedux } = authSlice.actions;
export const selectToken = (state: { auth: AuthState }) => state.auth.token; 
export const selectRole = (state: { auth: AuthState }) => state.auth.role; 

export default authSlice.reducer;
