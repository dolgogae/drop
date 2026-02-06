import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  isLoggedIn: boolean;
}

const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; role?: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      if (action.payload.role) {
        state.role = action.payload.role;
      }
      state.isLoggedIn = true;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.isLoggedIn = false;
    },
  },
});

interface UserProfile {
  id: number | null;
  email: string | null;
  username: string | null;
  profileImage: string | null;
  notificationEnabled: boolean;
  role: string | null;
}

interface UserState {
  profile: UserProfile | null;
}

const initialUserState: UserState = {
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setTokens, clearTokens } = authSlice.actions;
export const { setProfile, updateProfile, clearProfile } = userSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
