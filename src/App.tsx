import type { ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "@/layouts/ProtectedRoute"
import { AppShell } from "@/layouts/AppShell"
import { LoginPage } from "@/pages/login/LoginPage"
import { MainDashboardPage } from "@/pages/main/MainDashboardPage"
import { SemiProductQualityPage } from "@/pages/semi-product/SemiProductQualityPage"
import { ProductQualityPage } from "@/pages/product/ProductQualityPage"
import { BedrockQualityPage } from "@/pages/bedrock/BedrockQualityPage"
import { AggregateParticlePage } from "@/pages/aggregate/AggregateParticlePage"
import { GradationLookupPage } from "@/pages/aggregate/GradationLookupPage"
import { GradationCurvePage } from "@/pages/aggregate/GradationCurvePage"
import { GradationHistoryPage } from "@/pages/aggregate/GradationHistoryPage"
import { LotHistoryPage } from "@/pages/lot/LotHistoryPage"
import { ForwardTrackingPage } from "@/pages/lot/ForwardTrackingPage"
import { BackwardTrackingPage } from "@/pages/lot/BackwardTrackingPage"
import { ProductionMonitoringPage } from "@/pages/monitoring/ProductionMonitoringPage"
import { QualityMonitoringPage } from "@/pages/monitoring/QualityMonitoringPage"
import { MaterialMonitoringPage } from "@/pages/monitoring/MaterialMonitoringPage"
import { StatsReportPage } from "@/pages/report/StatsReportPage"
import { LineManagementPage } from "@/pages/system/LineManagementPage"
import { mainNavItem } from "@/data/navigation"
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
  "/report/summary": <StatsReportPage />,
  "/system/lines": <LineManagementPage />,
}

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path={mainNavItem.path} element={<MainDashboardPage />} />
            {Object.entries(routeOverrides).map(([path, element]) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={mainNavItem.path} replace />} />
      </Routes>
    </>
  )
}

export default App
