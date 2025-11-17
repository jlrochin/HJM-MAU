import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Pill, Activity, TrendingUp, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Pacientes Activos',
      value: 3,
      icon: Users,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      trend: '+12%',
    },
    {
      title: 'Recetas Totales',
      value: 1,
      subtitle: '1 pendientes',
      icon: FileText,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Medicamentos',
      value: 3,
      icon: Pill,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
  ]

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido, Admin Sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    {stat.trend && (
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Nueva receta creada', time: 'Hace 2 horas', icon: FileText },
                { action: 'Paciente registrado', time: 'Hace 5 horas', icon: Users },
                { action: 'Medicamento actualizado', time: 'Hace 1 día', icon: Pill },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>Recordatorios del día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No hay citas programadas
              </p>
              <p className="text-xs text-muted-foreground">
                Las citas aparecerán aquí
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
