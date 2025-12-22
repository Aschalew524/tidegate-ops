import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.tsx'
import { BerthsPage } from './pages/BerthsPage.tsx'
import { CrewPage } from './pages/CrewPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { IncidentsPage } from './pages/IncidentsPage.tsx'
import { InspectionsPage } from './pages/InspectionsPage.tsx'
import { MovementsPage } from './pages/MovementsPage.tsx'
import { ReportsPage } from './pages/ReportsPage.tsx'
import { VesselsPage } from './pages/VesselsPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="vessels" element={<VesselsPage />} />
        <Route path="berths" element={<BerthsPage />} />
        <Route path="movements" element={<MovementsPage />} />
        <Route path="inspections" element={<InspectionsPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="crew" element={<CrewPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
