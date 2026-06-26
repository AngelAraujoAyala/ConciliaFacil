import { useState, useMemo } from "react";
import type { ConciliationSummary } from "../../conciliation/types/history.types";

export type StatusFilter = "ALL" | "DRAFT" | "COMPLETED";

export const useFilteredHistory = (history: ConciliationSummary[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filteredHistory = useMemo(() => {
    if (!history) return [];

    return history.filter((item) => {
      // 1. Filtrar por estado
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      // 2. Filtrar por término de búsqueda (título)
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());

      return matchesStatus && matchesSearch;
    });
  }, [history, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredHistory,
  };
};
