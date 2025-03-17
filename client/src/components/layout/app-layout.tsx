import { useState } from "react";
import { useLocation } from "wouter";
import AppHeader from "@/components/layout/app-header";
import MobileNav from "@/components/layout/mobile-nav";
import { FeatureFlagsProvider } from "@/hooks/use-feature-flags";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [location] = useLocation();
  
  const isAuthPage = location === "/auth";
  
  // If it's the auth page, render a simplified layout without the header
  if (isAuthPage) {
    return (
      <FeatureFlagsProvider>
        <main className="flex min-h-screen flex-col">{children}</main>
      </FeatureFlagsProvider>
    );
  }
  
  return (
    <FeatureFlagsProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        
        <div className="flex flex-1">
          <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          
          <main className={cn("flex-1 px-4 pb-12 pt-6", mobileNavOpen && "md:pl-64")}>
            {children}
          </main>
        </div>
      </div>
    </FeatureFlagsProvider>
  );
}