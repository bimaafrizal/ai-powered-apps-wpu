'use client';

import { usePathname } from "next/navigation";
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { BanknoteIcon, CoinsIcon, LayoutDashboardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboardIcon />,
    href: '/dashboard',
  },
  {
    label: 'Transaction',
    icon: <BanknoteIcon />,
    href: '/dashboard/transaction',
  },
];


export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader className="gap-2 flex-row items-center">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton render={<Link href="/dashboard" />}>
                            <CoinsIcon className="text-primary size-5!"/>
                            <h1 className="text-2xl font-bold text-primary">Fina App</h1>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {sidebarItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton className={cn(
                    'py-6 px-5 text-md',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground'
                      : '',
                  )} tooltip={item.label}>
                                    {item.icon}
                                    <span className="text-sm">{item.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}