"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export interface Subscription {
  id: string;
  customerId: string;
  status: string;
}

interface SubscriptionContextProps {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{
  children: ReactNode;
  value: Subscription | null;
}> = ({ children, value }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(value);

  const memoSubscription = useMemo(
    () => ({ subscription, setSubscription }),
    [subscription]
  );

  return (
    <SubscriptionContext.Provider value={memoSubscription}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextProps => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
