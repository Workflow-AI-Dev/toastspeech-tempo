import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api";

const LEVELS = [
  { level: 1, xp: 0, name: "Beginner", avgRequired: 0 },
  { level: 2, xp: 300, name: "Ice Breaker", avgRequired: 70 },
  { level: 3, xp: 700, name: "Storyteller", avgRequired: 74 },
  { level: 4, xp: 1200, name: "Persuader", avgRequired: 78 },
  { level: 5, xp: 2000, name: "Engager", avgRequired: 80 },
  { level: 6, xp: 3200, name: "Connector", avgRequired: 82 },
  { level: 7, xp: 5000, name: "Orator", avgRequired: 84 },
  { level: 8, xp: 7500, name: "Influencer", avgRequired: 86 },
  { level: 9, xp: 10000, name: "Master Speaker", avgRequired: 88 },
  { level: 10, xp: 15000, name: "World-Class Communicator", avgRequired: 90 },
];

export function useProgressQuery() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return null;

      const res = await fetch(`${BASE_URL}/user/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) return null;

      const totalXP = data.total_xp || 0;

      // figure out level
      let currentLevel = LEVELS[0];
      let nextLevel = LEVELS[LEVELS.length - 1];
      for (let lvl of LEVELS) {
        if (totalXP >= lvl.xp) currentLevel = lvl;
        else {
          nextLevel = lvl;
          break;
        }
      }

      const xpIntoLevel = totalXP - currentLevel.xp;
      const xpForNextLevel = nextLevel.xp - currentLevel.xp;
      const progressPercent = Math.min(
        100,
        Math.round((xpIntoLevel / xpForNextLevel) * 100),
      );

      return {
        current: currentLevel.level,
        currentName: currentLevel.name,
        nextLevel: nextLevel.level,
        nextName: nextLevel.name,
        progress: progressPercent,
        xpRemaining: nextLevel.xp - totalXP,
        totalXP,
      };
    },
    staleTime: 0,
  });
}
