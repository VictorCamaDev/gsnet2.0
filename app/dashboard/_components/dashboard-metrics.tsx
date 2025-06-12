import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Calendar, TrendingUp } from "lucide-react"

const metrics = [
  {
    title: "Empleados Activos",
    value: "1,234",
    change: "+2.5% desde el mes pasado",
    icon: Users,
  },
  {
    title: "Documentos",
    value: "5,678",
    change: "+12 nuevos esta semana",
    icon: FileText,
  },
  {
    title: "Reuniones Hoy",
    value: "8",
    change: "3 pendientes",
    icon: Calendar,
  },
  {
    title: "Productividad",
    value: "94%",
    change: "+5% esta semana",
    icon: TrendingUp,
  },
]

export function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
