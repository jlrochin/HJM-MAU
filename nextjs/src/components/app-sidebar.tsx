"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  FileText,
  Pill,
  LogOut,
  ClipboardCheck,
  FileEdit,
  CheckCircle,
  Package,
  FlaskConical,
  PackageSearch,
  BookOpen,
  ChevronsUpDown,
  Bell,
  UserCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const [indicatorStyle, setIndicatorStyle] = React.useState<{
    top: number
    height: number
  } | null>(null)

  React.useEffect(() => {
    const updateIndicator = () => {
      const activeElement = document.querySelector('[data-active-item="true"]') as HTMLElement

      if (activeElement) {
        const contentContainer = document.querySelector('[data-sidebar="content"]') as HTMLElement

        if (contentContainer) {
          let element = activeElement
          let offsetTop = 0

          while (element && element !== contentContainer) {
            offsetTop += element.offsetTop
            element = element.offsetParent as HTMLElement
          }

          setIndicatorStyle({
            top: offsetTop + 8,
            height: activeElement.offsetHeight - 16,
          })
        }
      } else {
        setIndicatorStyle(null)
      }
    }

    const timeoutId = setTimeout(updateIndicator, 100)

    // Observer para detectar cambios en el ancho de la sidebar
    const sidebar = document.querySelector('[data-sidebar="sidebar"]')
    if (sidebar) {
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(updateIndicator, 100)
      })
      resizeObserver.observe(sidebar)

      return () => {
        clearTimeout(timeoutId)
        resizeObserver.disconnect()
      }
    }

    return () => clearTimeout(timeoutId)
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/mau/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="h-16 p-0 gap-0 flex items-center justify-center group-data-[collapsible=icon]:h-16">
        <div className="flex items-center gap-3 px-4 group-data-[collapsible=icon]:px-2">
          <div
            className="w-10 h-10 bg-foreground group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
            style={{
              WebkitMaskImage: 'url(/mau/logo-hjm.svg)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: 'url(/mau/logo-hjm.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
          />
          <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">MAU</h2>
        </div>
      </SidebarHeader>
      <div className="flex justify-center px-4 group-data-[collapsible=icon]:px-2">
        <div className="w-1/2 h-px bg-border group-data-[collapsible=icon]:w-full" />
      </div>
      <SidebarContent className="relative">
        {indicatorStyle && (
          <motion.div
            className="absolute w-0.5 rounded-full z-50"
            style={{ backgroundColor: '#651643' }}
            initial={false}
            animate={{
              top: indicatorStyle.top,
              height: indicatorStyle.height,
              left: 8,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.5,
            }}
          />
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard" data-active-item={pathname === "/dashboard"}>
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Atención al Usuario" isActive={pathname.startsWith("/dashboard/atencion")}>
                  <Link href="/dashboard/atencion" data-active-item={pathname.startsWith("/dashboard/atencion")}>
                    <Users />
                    <span>Atención al Usuario</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Catálogo CIE-10" isActive={pathname.startsWith("/dashboard/cie10")}>
                  <Link href="/dashboard/cie10" data-active-item={pathname.startsWith("/dashboard/cie10")}>
                    <BookOpen />
                    <span>Catálogo CIE-10</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Recetas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Prescripción" isActive={pathname.startsWith("/dashboard/prescripcion")}>
                  <Link href="/dashboard/prescripcion" data-active-item={pathname.startsWith("/dashboard/prescripcion")}>
                    <FileEdit />
                    <span>Prescripción</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Validación de Recetas" isActive={pathname.startsWith("/dashboard/validacion-recetas")}>
                  <Link href="/dashboard/validacion-recetas" data-active-item={pathname.startsWith("/dashboard/validacion-recetas")}>
                    <ClipboardCheck />
                    <span>Validación de Recetas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Recetas Completadas" isActive={pathname.startsWith("/dashboard/recetas-completadas")}>
                  <Link href="/dashboard/recetas-completadas" data-active-item={pathname.startsWith("/dashboard/recetas-completadas")}>
                    <CheckCircle />
                    <span>Recetas Completadas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Farmacia</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Medicamentos" isActive={pathname.startsWith("/dashboard/medicamentos")}>
                  <Link href="/dashboard/medicamentos" data-active-item={pathname.startsWith("/dashboard/medicamentos")}>
                    <Pill />
                    <span>Medicamentos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Farmacia" isActive={pathname.startsWith("/dashboard/farmacia")}>
                  <Link href="/dashboard/farmacia" data-active-item={pathname.startsWith("/dashboard/farmacia")}>
                    <Package />
                    <span>Farmacia</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Centro de Mezclas" isActive={pathname.startsWith("/dashboard/centro-mezclas")}>
                  <Link href="/dashboard/centro-mezclas" data-active-item={pathname.startsWith("/dashboard/centro-mezclas")}>
                    <FlaskConical />
                    <span>Centro de Mezclas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Gestión de Inventario" isActive={pathname.startsWith("/dashboard/inventario")}>
                  <Link href="/dashboard/inventario" data-active-item={pathname.startsWith("/dashboard/inventario")}>
                    <PackageSearch />
                    <span>Gestión de Inventario</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="h-[72px] p-0 gap-0 flex flex-col justify-center group-data-[collapsible=icon]:h-auto">
        <div className="flex justify-center px-4 mb-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:mb-0">
          <div className="w-1/2 h-px bg-border group-data-[collapsible=icon]:w-full" />
        </div>
        <div className="px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenu className="group-data-[collapsible=icon]:w-auto">
            <SidebarMenuItem className="group-data-[collapsible=icon]:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  >
                    <UserCircle className="group-data-[collapsible=icon]:size-5" />
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">José Luis Rochin Upton</span>
                      <span className="truncate text-xs">jrochinu@hjm.gob.mx</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={state === "collapsed" ? "right" : "top"}
                  align={state === "collapsed" ? "center" : "end"}
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10">
                    <LogOut className="!text-red-500" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
      <SidebarRail className="after:!hidden" />
    </Sidebar>
  )
}
