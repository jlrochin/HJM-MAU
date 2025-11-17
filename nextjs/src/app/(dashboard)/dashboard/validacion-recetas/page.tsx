"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, FilterX, CheckCircle, XCircle, Clock, Eye } from "lucide-react"

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

interface Receta {
  id: string
  folio: string
  paciente: {
    nombre: string
    curp: string
  }
  medico: string
  fecha: string
  estado: "pendiente" | "validada" | "rechazada"
  medicamentos: {
    nombre: string
    dosis: string
    frecuencia: string
  }[]
  diagnostico: string
}

export default function ValidacionRecetasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("")
  const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const recetas: Receta[] = [
    {
      id: "1",
      folio: "RX-2024-001",
      paciente: {
        nombre: "María García López",
        curp: "GAMA900515MDFRRC01"
      },
      medico: "Dr. Juan Pérez",
      fecha: "17 nov 2024",
      estado: "pendiente",
      medicamentos: [
        {
          nombre: "Paracetamol 500mg",
          dosis: "1 tableta",
          frecuencia: "Cada 8 horas"
        },
        {
          nombre: "Ibuprofeno 400mg",
          dosis: "1 tableta",
          frecuencia: "Cada 12 horas"
        }
      ],
      diagnostico: "Cefalea tensional"
    },
    {
      id: "2",
      folio: "RX-2024-002",
      paciente: {
        nombre: "Juan Pérez Martínez",
        curp: "PEJU850101HDFRNN09"
      },
      medico: "Dra. Ana Rodríguez",
      fecha: "17 nov 2024",
      estado: "validada",
      medicamentos: [
        {
          nombre: "Amoxicilina 500mg",
          dosis: "1 cápsula",
          frecuencia: "Cada 8 horas por 7 días"
        }
      ],
      diagnostico: "Faringitis bacteriana"
    },
    {
      id: "3",
      folio: "RX-2024-003",
      paciente: {
        nombre: "Carlos Sánchez Torres",
        curp: "SATC920315HDFRRL02"
      },
      medico: "Dr. Luis Hernández",
      fecha: "16 nov 2024",
      estado: "rechazada",
      medicamentos: [
        {
          nombre: "Omeprazol 20mg",
          dosis: "1 tableta",
          frecuencia: "Cada 24 horas antes del desayuno"
        }
      ],
      diagnostico: "Gastritis crónica"
    }
  ]

  const filteredRecetas = useMemo(() => {
    let filtered = recetas

    if (estadoFiltro) {
      filtered = filtered.filter(r => r.estado === estadoFiltro)
    }

    if (searchTerm) {
      const normalizedSearch = normalizeText(searchTerm)
      filtered = filtered.filter(receta => {
        const normalizedFolio = normalizeText(receta.folio)
        const normalizedPaciente = normalizeText(receta.paciente.nombre)
        const normalizedCurp = normalizeText(receta.paciente.curp)
        const normalizedMedico = normalizeText(receta.medico)

        return (
          normalizedFolio.includes(normalizedSearch) ||
          normalizedPaciente.includes(normalizedSearch) ||
          normalizedCurp.includes(normalizedSearch) ||
          normalizedMedico.includes(normalizedSearch)
        )
      })
    }

    return filtered
  }, [searchTerm, estadoFiltro])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pendiente</Badge>
      case "validada":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Validada</Badge>
      case "rechazada":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rechazada</Badge>
      default:
        return null
    }
  }

  const handleValidar = (id: string) => {
    console.log("Validar receta:", id)
    setDialogOpen(false)
  }

  const handleRechazar = (id: string) => {
    console.log("Rechazar receta:", id)
    setDialogOpen(false)
  }

  const handleVerDetalle = (receta: Receta) => {
    setSelectedReceta(receta)
    setDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Validación de Recetas</h1>
        <p className="text-muted-foreground mt-2">
          Revisa y valida las recetas médicas pendientes
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por folio, paciente, CURP o médico..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={estadoFiltro || "all"}
          onValueChange={(value) => setEstadoFiltro(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[250px] !h-10">
            <div className="flex items-center gap-2 w-full overflow-hidden">
              <Filter className="h-4 w-4 shrink-0" />
              <span className="truncate">
                <SelectValue placeholder="Todos los estados" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="validada">Validada</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
          </SelectContent>
        </Select>
        {(searchTerm || estadoFiltro) && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchTerm("")
              setEstadoFiltro("")
            }}
            className="h-10 w-10 shrink-0"
            title="Limpiar filtros"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recetas</CardTitle>
          <CardDescription>
            {filteredRecetas.length} receta{filteredRecetas.length !== 1 ? 's' : ''} encontrada{filteredRecetas.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecetas.map((receta) => (
              <Card key={receta.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{receta.folio}</h3>
                        {getEstadoBadge(receta.estado)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Paciente</p>
                          <p className="font-medium">{receta.paciente.nombre}</p>
                          <p className="text-xs text-muted-foreground">{receta.paciente.curp}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Médico</p>
                          <p className="font-medium">{receta.medico}</p>
                          <p className="text-xs text-muted-foreground">{receta.fecha}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Medicamentos</p>
                        <div className="flex flex-wrap gap-2">
                          {receta.medicamentos.map((med, idx) => (
                            <Badge key={idx} variant="outline">
                              {med.nombre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetalle(receta)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalle
                      </Button>
                      {receta.estado === "pendiente" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-500/10"
                            onClick={() => handleValidar(receta.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-500/10"
                            onClick={() => handleRechazar(receta.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRecetas.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron recetas que coincidan con los filtros
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Receta - {selectedReceta?.folio}</DialogTitle>
            <DialogDescription>
              Información completa de la receta médica
            </DialogDescription>
          </DialogHeader>

          {selectedReceta && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Información del Paciente</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nombre:</span> {selectedReceta.paciente.nombre}</p>
                    <p><span className="text-muted-foreground">CURP:</span> {selectedReceta.paciente.curp}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Información del Médico</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nombre:</span> {selectedReceta.medico}</p>
                    <p><span className="text-muted-foreground">Fecha:</span> {selectedReceta.fecha}</p>
                    <p><span className="text-muted-foreground">Estado:</span> {getEstadoBadge(selectedReceta.estado)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Diagnóstico</h4>
                <p className="text-sm">{selectedReceta.diagnostico}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Medicamentos Prescritos</h4>
                <div className="space-y-3">
                  {selectedReceta.medicamentos.map((med, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <p className="font-medium">{med.nombre}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <p><span className="font-medium">Dosis:</span> {med.dosis}</p>
                          <p><span className="font-medium">Frecuencia:</span> {med.frecuencia}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedReceta.estado === "pendiente" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleValidar(selectedReceta.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validar Receta
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-500/10"
                    onClick={() => handleRechazar(selectedReceta.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Receta
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
