import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PlatformInfo {
  name: string;
  charLimit: number;
  requiresImage?: boolean;
}

export interface PlatformsState {
  list: PlatformInfo[];
  current: string;
}

const initialState: PlatformsState = {
  list: [
    { name: 'Twitter', charLimit: 280 },
    { name: 'Instagram', charLimit: 2200, requiresImage: true },
    { name: 'LinkedIn', charLimit: 3000 },
    { name: 'Facebook', charLimit: 63206 },
  ],
  current: 'Twitter',
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    setCurrentPlatform(state, action: PayloadAction<string>) {
      state.current = action.payload;
    },
  },
});

export const { setCurrentPlatform } = platformsSlice.actions;
export default platformsSlice.reducer;
