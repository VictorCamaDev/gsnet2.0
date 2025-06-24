import { DashboardMetrics } from "./_components/dashboard-metrics"
import { RecentActivity } from "./_components/recent-activity"
import { PendingTasks } from "./_components/pending-tasks"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
        {/* <p className="text-slate-600">Aquí tienes un resumen de tu actividad reciente</p> */}
      </div>

      {/* <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <PendingTasks />
      </div> */}
    </div>
  )
}
