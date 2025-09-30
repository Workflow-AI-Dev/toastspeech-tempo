import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

export function useLimitsQuery() {
  return useQuery({
    queryKey: ["limits"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("auth_token");
      const plan = await AsyncStorage.getItem("plan");

      if (!token || !plan) return null;
      const res = await fetch(`${BASE_URL}/user/limits/${plan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch limits");

      await AsyncStorage.setItem("limits", JSON.stringify(data));
      return data;
    },
    staleTime: 0, // force re-check each time screen mounts if not cached
    cacheTime: 1000 * 60 * 30,
  });
}
