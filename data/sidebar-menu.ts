import {
  Home,
  Users,
  FileText,
  Calendar,
  FileQuestionIcon,
  MessageSquare,
  Settings,
  BarChart,
  HelpCircle,
  Briefcase,
  Shield,
  Globe,
  Compass,
  PlusCircle,
  FilePlusIcon,
} from "lucide-react"

export interface MenuItem {
  id: string
  icon: any
  label: string
  href: string
  badge?: string | number
  submenu?: MenuItem[]
  permissions?: string[]
}

export const sidebarMenu: MenuItem[] = [
  {
    id: "dashboard",
    icon: Home,
    label: "Inicio",
    href: "/dashboard",
  },
  {
    id: "internacional",
    icon: Globe,
    label: "Registro Internacional",
    href: "/dashboard/internacional",
    submenu: [
      {
        id: "consulta-internacional",
        icon: FileQuestionIcon,
        label: "Consulta de Productos Internacionales",
        href: "/dashboard/internacional/consulta",
      },
      {
        id: "registro-internacional",
        icon: FilePlusIcon,
        label: "Registro de Productos Internacionales",
        href: "/dashboard/internacional/registro",
      }
    ],
  },
  // {
  //   id: "nacional",
  //   icon: Compass,
  //   label: "Seguimiento Nacional",
  //   href: "/dashboard/nacional",
  //   submenu: [
  //     {
  //       id: "muestras-nacional",
  //       icon: Calendar,
  //       label: "Seguimiento de Muestras",
  //       href: "/dashboard/nacional/seguimiento",
  //     },
  //     {
  //       id: "registro-nacional",
  //       icon: PlusCircle,
  //       label: "Registro de Productos Nacionales",
  //       href: "/dashboard/nacional/registro",
  //     }
  //   ],
  // }
]
