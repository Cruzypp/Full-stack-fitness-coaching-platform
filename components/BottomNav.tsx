'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell } from "lucide-react";

const tabs = [
  { label: "Home", icon: Home, href: "/pricing" },
  { label: "Mis Cargas", icon: Dumbbell, href: "/mis-cargas" },
];

const BottomNav = ({ activeTab }: { activeTab?: string }) => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-white/8">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
        {tabs.map(({ label, icon: Icon, href }) => {
          const isActive = activeTab
            ? label.toLowerCase().includes(activeTab.toLowerCase())
            : pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
