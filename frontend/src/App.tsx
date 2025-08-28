import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './shared/store/useAuthStore.ts'
import DashboardLayout from './shared/components/templates/DashboardLayout.tsx'
import AuthLayout from './shared/components/templates/AuthLayout.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Login from './pages/Login.tsx'
import Reservations from './pages/Reservations.tsx'
import Customers from './pages/Customers.tsx'
import Rooms from './pages/Rooms.tsx'
import RoomTypes from './pages/RoomTypes.tsx'
import MealPlans from './pages/MealPlans.tsx'

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthLayout>
    )
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reservations/*" element={<Reservations />} />
        <Route path="/customers/*" element={<Customers />} />
        <Route path="/rooms/*" element={<Rooms />} />
        <Route path="/room-types/*" element={<RoomTypes />} />
        <Route path="/meal-plans/*" element={<MealPlans />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default App
