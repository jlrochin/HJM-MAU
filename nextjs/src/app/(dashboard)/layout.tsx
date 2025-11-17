import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarProviderWrapper } from "@/components/sidebar-provider-wrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <SidebarProviderWrapper>
      <AppSidebar />
      <SidebarInset className="!m-0">
        <header className="sticky top-0 z-10 bg-background">
          <div className="flex h-16 items-center px-6 justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="h-8 w-px bg-border rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-border rounded-full" />
              <ThemeToggle />
            </div>
          </div>
          <div className="h-px bg-border" />
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProviderWrapper>
  )
}
