import { AppHeader } from "@/components/layout/AppHeader";

// Shell for every signed-in screen: header with navigation, then the page.
export default function AppLayout({ children }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
