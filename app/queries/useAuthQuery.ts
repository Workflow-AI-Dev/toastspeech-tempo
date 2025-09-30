import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

async function fetchMe() {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const userData = await res.json();

  await AsyncStorage.setItem("plan", userData.current_plan_id);

  return userData;
}

export function useAuthQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    retry: false, // don’t retry on 401
  });
}
