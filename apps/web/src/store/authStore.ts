
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Gym } from '../types/entities'

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null
    gym: Gym | null
    accessToken: string | null
    isAuthenticated: boolean
    login: (user: User, gym: Gym, accessToken: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            gym: null,
            accessToken: null,
            isAuthenticated: false,
            login: (user, gym, accessToken) => set({ user, gym, accessToken, isAuthenticated: true }),
            logout: () => set({ user: null, gym: null, accessToken: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
