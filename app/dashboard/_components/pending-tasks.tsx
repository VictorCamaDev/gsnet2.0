import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const tasks = [
  { task: "Revisar solicitud de vacaciones", priority: "Alta", due: "Hoy" },
  { task: "Aprobar presupuesto Q1", priority: "Media", due: "Mañana" },
  { task: "Actualizar manual de empleados", priority: "Baja", due: "Esta semana" },
  { task: "Reunión con RRHH", priority: "Alta", due: "Viernes" },
]

export function PendingTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas Pendientes</CardTitle>
        <CardDescription>Elementos que requieren tu atención</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.task}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={
                      item.priority === "Alta" ? "destructive" : item.priority === "Media" ? "default" : "secondary"
                    }
                  >
                    {item.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.due}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ver
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
