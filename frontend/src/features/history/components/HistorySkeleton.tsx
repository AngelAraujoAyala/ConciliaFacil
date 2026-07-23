import React from "react";
import { LoadingPage } from "../../../components/ui/LoadingState";

export const HistorySkeleton: React.FC = () => (
  <div className="ui-card">
    <LoadingPage message="Cargando historial de conciliaciones..." />
  </div>
);
