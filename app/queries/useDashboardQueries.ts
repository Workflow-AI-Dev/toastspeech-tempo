import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

async function fetchDashboardAll() {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}/dashboard/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard/all");
  return res.json();
}

async function fetchDashboardRecent() {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}/dashboard/recent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard/recent");
  return res.json();
}

// Hook: Dashboard All (evaluations + speeches)
export function useDashboardAllQuery(selectedTimeFrame?: string) {
  return useQuery({
    queryKey: ["dashboard-all", selectedTimeFrame],
    queryFn: fetchDashboardAll,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    cacheTime: 1000 * 60 * 60, // 1 hour in cache
  });
}

// Hook: Dashboard Recent (achievements, etc.)
export function useDashboardRecentQuery() {
  return useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: fetchDashboardRecent,
    staleTime: 1000 * 60 * 2, // 2 min fresh
    cacheTime: 1000 * 60 * 30, // 30 min in cache
  });
}
