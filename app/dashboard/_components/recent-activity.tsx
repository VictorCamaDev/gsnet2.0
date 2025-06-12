import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const activities = [
  { action: "Nuevo documento subido", time: "Hace 2 minutos", user: "María García" },
  { action: "Reunión programada", time: "Hace 15 minutos", user: "Carlos López" },
  { action: "Empleado agregado", time: "Hace 1 hora", user: "Ana Martínez" },
  { action: "Política actualizada", time: "Hace 2 horas", user: "Sistema" },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones en la plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-muted-foreground">
                  {item.user} • {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
