import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

// --- Fetchers ---
async function fetchPrivacySettings() {
  const token = await AsyncStorage.getItem("auth_token");
  const response = await fetch(`${BASE_URL}/user/privacy-settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to load privacy settings");
  return response.json();
}

async function fetchProfile() {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) throw new Error("No access token found");
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to load profile");
  return response.json();
}

async function fetchMetrics() {
  const token = await AsyncStorage.getItem("auth_token");
  if (!token) throw new Error("No access token found");
  const response = await fetch(`${BASE_URL}/user/user-metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to load metrics");
  return response.json();
}

// --- Hooks ---
export function usePrivacySettingsQuery(enabled = true) {
  return useQuery({
    queryKey: ["privacy-settings"],
    queryFn: fetchPrivacySettings,
    enabled, // lets you control fetch on visibility
    staleTime: 1000 * 60 * 5, // 5 min
    cacheTime: 1000 * 60 * 30, // 30 min
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
}

export function useMetricsQuery() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 10,
  });
}
