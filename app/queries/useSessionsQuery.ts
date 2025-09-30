import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

export function useSessionsQuery() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return [];

      const res = await fetch(`${BASE_URL}/dashboard/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");

      const { recent_sessions } = await res.json();
      return recent_sessions || [];
    },
    staleTime: 1000 * 60 * 2,
  });
}
