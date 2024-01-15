// src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearTokenRedux(state) {
      state.token = null;
    },
  },
});

export const { setToken, clearTokenRedux } = authSlice.actions;
export const selectToken = (state: { auth: AuthState }) => state.auth.token; 

export default authSlice.reducer;
