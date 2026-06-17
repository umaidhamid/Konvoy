import Link from "next/link";
import {
  Home,
  Folder,
  FileText,
  Settings,
} from "lucide-react";

interface User {
  // username: string;
  email: string;
}

interface SidebarProps {
  user: User;
}
import LogoutButton from "./LogoutButton";
export default function Sidebar({
  user,
}: SidebarProps) {
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: Folder,
    },
    {
      name: "Files",
      href: "/dashboard/files",
      icon: FileText,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 font-mono font-bold text-lg tracking-wider mb-8">
          <span className="bg-primary text-primary-foreground p-1.5 rounded-md text-xs">
            DV
          </span>
          DevVault
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-secondary hover:text-foreground hover:bg-card-hover transition-colors group"
              >
                <Icon className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border bg-card-hover/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-xs text-primary">
            {/* {user.username.charAt(0).toUpperCase()} */}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium">
              {/* {user.username} */}
            </span>

            <span className="text-[10px] text-muted">
              {/* {user.email} */}
            </span>
          </div>
        </div>
      </div>
      <LogoutButton />
    </aside>

  );
}