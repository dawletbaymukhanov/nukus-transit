import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PlannerPage from "@/pages/PlannerPage";
import ResultsPage from "@/pages/ResultsPage";
import RoutesPage from "@/pages/RoutesPage";
import StopsPage from "@/pages/StopsPage";
import AboutPage from "@/pages/AboutPage";
import { useTransitStore } from "@/store/useTransitStore";

export default function App() {
  const load = useTransitStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<PlannerPage />} />
        <Route path="natija" element={<ResultsPage />} />
        <Route path="yonalishlar" element={<RoutesPage />} />
        <Route path="bekatlar" element={<StopsPage />} />
        <Route path="haqida" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
