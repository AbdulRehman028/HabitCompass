"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import ToastViewport from "@/components/common/ToastViewport";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <ToastViewport />
    </Provider>
  );
}
