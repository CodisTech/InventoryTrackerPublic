import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const [location] = useLocation();
  
  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { name: "Dashboard", icon: "dashboard", path: "/" },
    { name: "Inventory", icon: "inventory", path: "/inventory" },
    { name: "Transactions", icon: "sync_alt", path: "/transactions" },
    { name: "Users", icon: "people", path: "/users" },
    { name: "Reports", icon: "assessment", path: "/reports" },
    { name: "Settings", icon: "settings", path: "/settings" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Mobile sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden">
        <div className="flex justify-between items-center p-4 border-b border-neutral-100">
          <div className="flex items-center">
            <span className="material-icons mr-2 text-primary">inventory_2</span>
            <h1 className="text-lg font-medium">Inventory System</h1>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="py-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.path}>
                  <a
                    className={`flex items-center px-4 py-3 ${
                      location === item.path
                        ? "bg-primary-light text-white"
                        : "text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default MobileNav;
