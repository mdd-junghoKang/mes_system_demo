import type { ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AuthProvider } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/layouts/ProtectedRoute"
import { AppShell } from "@/layouts/AppShell"
import { LoginPage } from "@/pages/LoginPage"
import { MainDashboardPage } from "@/pages/MainDashboardPage"
import { SemiProductQualityPage } from "@/pages/SemiProductQualityPage"
import { ProductQualityPage } from "@/pages/ProductQualityPage"
import { BedrockQualityPage } from "@/pages/BedrockQualityPage"
import { AggregateParticlePage } from "@/pages/AggregateParticlePage"
import { GradationLookupPage } from "@/pages/GradationLookupPage"
import { GradationCurvePage } from "@/pages/GradationCurvePage"
import { GradationHistoryPage } from "@/pages/GradationHistoryPage"
import { LotHistoryPage } from "@/pages/LotHistoryPage"
import { ForwardTrackingPage } from "@/pages/ForwardTrackingPage"
import { BackwardTrackingPage } from "@/pages/BackwardTrackingPage"
import { ProductionMonitoringPage } from "@/pages/ProductionMonitoringPage"
import { QualityMonitoringPage } from "@/pages/QualityMonitoringPage"
import { MaterialMonitoringPage } from "@/pages/MaterialMonitoringPage"
import { PlaceholderPage } from "@/pages/PlaceholderPage"
import { mainNavItem, navGroups } from "@/data/navigation"
import { Toaster } from "@/components/ui/sonner"

const routeOverrides: Record<string, ReactNode> = {
  "/semi-product/quality/emotional": <SemiProductQualityPage />,
  "/product/quality/emotional": <ProductQualityPage />,
  "/bedrock/quality/history": <BedrockQualityPage />,
  "/aggregate/particle": <AggregateParticlePage />,
  "/aggregate/gradation/lookup": <GradationLookupPage />,
  "/aggregate/gradation/curve": <GradationCurvePage />,
  "/aggregate/history": <GradationHistoryPage />,
  "/lot/history": <LotHistoryPage />,
  "/lot/tracking/forward": <ForwardTrackingPage />,
  "/lot/tracking/backward": <BackwardTrackingPage />,
  "/monitoring/production": <ProductionMonitoringPage />,
  "/monitoring/quality": <QualityMonitoringPage />,
  "/monitoring/materials": <MaterialMonitoringPage />,
}

const placeholderPaths = navGroups
  .flatMap((group) => group.items.map((item) => item.path))
  .filter((path) => !(path in routeOverrides))

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path={mainNavItem.path} element={<MainDashboardPage />} />
            {Object.entries(routeOverrides).map(([path, element]) => (
              <Route key={path} path={path} element={element} />
            ))}
            {placeholderPaths.map((path) => (
              <Route key={path} path={path} element={<PlaceholderPage />} />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={mainNavItem.path} replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
