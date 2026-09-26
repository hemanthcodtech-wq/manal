import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Seeded demo accounts
const DEMO_USERS = [
  { id: 'a1', email: 'admin@ourlocal.in', password: 'admin123', role: 'admin', name: 'Admin User', phone: '+91 98000 00001' },
  { id: 'w1', email: 'ravi@ourlocal.in', password: 'worker123', role: 'worker', name: 'Ravi Kumar', phone: '+91 98765 43210', vehicle: 'JCB • KA 05 AB 1234', rating: 4.8, jobsDone: 142, available: true },
  { id: 'w2', email: 'suresh@ourlocal.in', password: 'worker123', role: 'worker', name: 'Suresh Reddy', phone: '+91 97654 32109', vehicle: 'Crane • AP 09 CD 5678', rating: 4.6, jobsDone: 98, available: true },
  { id: 'w3', email: 'mohan@ourlocal.in', password: 'worker123', role: 'worker', name: 'Mohan Das', phone: '+91 96543 21098', vehicle: 'Tipper • TN 07 EF 9012', rating: 4.9, jobsDone: 210, available: false },
  { id: 'c1', email: 'customer@ourlocal.in', password: 'cust123', role: 'customer', name: 'Arjun Sharma', phone: '+91 95432 10987' },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: DEMO_USERS,

      login: (email, password) => {
        const found = get().users.find(u => u.email === email && u.password === password);
        if (!found) return { error: 'Invalid email or password' };
        set({ user: found });
        return { success: true, role: found.role };
      },

      register: (data) => {
        const exists = get().users.find(u => u.email === data.email);
        if (exists) return { error: 'Email already registered' };
        const newUser = { id: `c${Date.now()}`, ...data };
        set(s => ({ users: [...s.users, newUser] }));
        return { success: true };
      },

      updatePassword: (email, newPassword) => {
        set(s => {
          const index = s.users.findIndex(u => u.email === email);
          if (index === -1) return s;
          const newUsers = [...s.users];
          newUsers[index] = { ...newUsers[index], password: newPassword };
          return { users: newUsers };
        });
        return { success: true };
      },

      logout: () => set({ user: null }),

      updateWorkerAvailability: (workerId, available) => {
        set(s => ({
          users: s.users.map(u => u.id === workerId ? { ...u, available } : u),
          user: s.user?.id === workerId ? { ...s.user, available } : s.user,
        }));
      },

      getWorkers: () => get().users.filter(u => u.role === 'worker'),
      getCustomers: () => get().users.filter(u => u.role === 'customer'),

      // For Backend Integration
      setUser: (user, token) => set({ user, token }),
    }),
    { name: 'ourlocal-auth' }
  )
);
