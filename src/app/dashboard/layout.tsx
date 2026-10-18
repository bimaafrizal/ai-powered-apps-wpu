"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ChatbotDrawer from "./_components/chatbot-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-w-0 flex-1 space-y-4 p-2">
        <SidebarTrigger />
        {children}
        <ChatbotDrawer />
      </main>
    </SidebarProvider>
  );
}
