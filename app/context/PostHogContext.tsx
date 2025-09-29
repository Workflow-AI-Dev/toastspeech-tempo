import React, { createContext, useContext, ReactNode, RefObject } from "react";

interface PostHogContextType {
  posthogRef: RefObject<any>;
  posthogReady: boolean;
  capture: (event: string, properties?: Record<string, any>) => void;
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined);

interface PostHogProviderProps {
  value: PostHogContextType;
  children: ReactNode;
}

export const PostHogProvider = ({ value, children }: PostHogProviderProps) => (
  <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>
);

export const usePostHogContext = () => {
  const ctx = useContext(PostHogContext);
  if (!ctx)
    throw new Error("usePostHogContext must be used inside PostHogProvider");
  return ctx;
};
