import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function usePlanQuery() {
  return useQuery({
    queryKey: ["plan"],
    queryFn: async () => {
      const plan = await AsyncStorage.getItem("plan");
      return plan;
    },
    staleTime: Infinity, // plan doesn’t really expire
  });
}
