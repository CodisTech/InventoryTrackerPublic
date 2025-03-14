import React, { useState } from "react";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import AppHeader from "./app-header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar (desktop) */}
      <Sidebar />
      
      {/* Mobile menu (slide-in sidebar for mobile) */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={toggleMobileMenu} />
        
        {/* Page content */}
        <main className="flex-1 overflow-auto bg-neutral-50 p-4">
          {children}
        </main>
        
        {/* Mobile navigation footer */}
        <nav className="md:hidden bg-white border-t border-neutral-100 fixed bottom-0 left-0 right-0 z-10">
          <div className="grid grid-cols-5 h-16">
            <a href="/" className="flex flex-col items-center justify-center text-primary">
              <span className="material-icons">dashboard</span>
              <span className="text-xs mt-1">Dashboard</span>
            </a>
            <a href="/inventory" className="flex flex-col items-center justify-center text-neutral-500">
              <span className="material-icons">inventory</span>
              <span className="text-xs mt-1">Inventory</span>
            </a>
            <a href="/transactions" className="flex flex-col items-center justify-center text-neutral-500">
              <span className="material-icons">sync_alt</span>
              <span className="text-xs mt-1">Transactions</span>
            </a>
            <a href="/users" className="flex flex-col items-center justify-center text-neutral-500">
              <span className="material-icons">people</span>
              <span className="text-xs mt-1">Users</span>
            </a>
            <a href="#more" className="flex flex-col items-center justify-center text-neutral-500">
              <span className="material-icons">more_horiz</span>
              <span className="text-xs mt-1">More</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
