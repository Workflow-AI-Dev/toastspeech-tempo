import { useCallback } from "react";
import { Platform } from "react-native";

export function usePostHog(posthogRef, posthogReady) {
  const capture = useCallback(
    (event: string, properties: Record<string, any> = {}) => {
      if (!posthogReady || !posthogRef.current) return;

      posthogRef.current.capture(event, {
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    },
    [posthogReady, posthogRef],
  );

  return { capture };
}
