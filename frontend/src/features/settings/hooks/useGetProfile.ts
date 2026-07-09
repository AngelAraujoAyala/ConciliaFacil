import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../api/settingsApi";
import { settingsQueryKeys } from "../constants/queryKeys";

export function useGetProfile() {
  return useQuery({
    queryKey: settingsQueryKeys.user.profile,
    queryFn: fetchUserProfile,
    retry: false,
  });
}

// Re-export del tipo para conveniencia de consumidores legacy
export type { UserProfile } from "../../../types/user";
