"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Plus, AlertCircle, CalendarIcon, X, Check, ChevronsUpDown, Eye, Pencil } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

interface CIE10Code {
  id: string
  code: string
  description: string
  category: string | null
}

interface PatientCIE10 {
  code: CIE10Code
  diagnosisDate: Date
  observations: string
}

interface Patient {
  nombre: string
  curp: string
  edad: string
  telefono: string
  estado: string
  registro: string
}

export default function AtencionPage() {
  const [open, setOpen] = useState(false)
  const [cie10Codes, setCie10Codes] = useState<PatientCIE10[]>([])
  const [showCie10Warning, setShowCie10Warning] = useState(false)
  const [curp, setCurp] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState<Date>()
  const [fechaDiagnostico, setFechaDiagnostico] = useState<Date>()
  const [genero, setGenero] = useState("")
  const [estadoNacimiento, setEstadoNacimiento] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [openCie10, setOpenCie10] = useState(false)
  const [searchCie10, setSearchCie10] = useState("")
  const [selectedCie10, setSelectedCie10] = useState<CIE10Code | null>(null)
  const [cie10Options, setCie10Options] = useState<CIE10Code[]>([])
  const [observacionesCie10, setObservacionesCie10] = useState("")
  const [viewPatient, setViewPatient] = useState<Patient | null>(null)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)

  const estadosMexico = {
    "AS": "Aguascalientes",
    "BC": "Baja California",
    "BS": "Baja California Sur",
    "CC": "Campeche",
    "CL": "Coahuila",
    "CM": "Colima",
    "CS": "Chiapas",
    "CH": "Chihuahua",
    "DF": "Ciudad de México",
    "DG": "Durango",
    "GT": "Guanajuato",
    "GR": "Guerrero",
    "HG": "Hidalgo",
    "JC": "Jalisco",
    "MC": "México",
    "MN": "Michoacán",
    "MS": "Morelos",
    "NT": "Nayarit",
    "NL": "Nuevo León",
    "OC": "Oaxaca",
    "PL": "Puebla",
    "QT": "Querétaro",
    "QR": "Quintana Roo",
    "SP": "San Luis Potosí",
    "SL": "Sinaloa",
    "SR": "Sonora",
    "TC": "Tabasco",
    "TS": "Tamaulipas",
    "TL": "Tlaxcala",
    "VZ": "Veracruz",
    "YN": "Yucatán",
    "ZS": "Zacatecas",
    "NE": "Nacido en el extranjero"
  }

  const extractDataFromCURP = (curpValue: string) => {
    if (curpValue.length !== 18) return

    const año = curpValue.substring(4, 6)
    const mes = curpValue.substring(6, 8)
    const dia = curpValue.substring(8, 10)
    const sexo = curpValue.substring(10, 11)
    const estado = curpValue.substring(11, 13)

    const añoCompleto = parseInt(año) <= 24 ? `20${año}` : `19${año}`
    const fecha = new Date(parseInt(añoCompleto), parseInt(mes) - 1, parseInt(dia))

    if (!isNaN(fecha.getTime())) {
      setFechaNacimiento(fecha)
    }

    if (sexo === "H") {
      setGenero("masculino")
    } else if (sexo === "M") {
      setGenero("femenino")
    }

    if (estadosMexico[estado as keyof typeof estadosMexico]) {
      setEstadoNacimiento(estado)
    }
  }

  const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setCurp(value)
    if (value.length === 18) {
      extractDataFromCURP(value)
    }
  }

  useEffect(() => {
    const fetchCie10Codes = async () => {
      if (searchCie10.length < 2) {
        setCie10Options([])
        return
      }

      try {
        const response = await fetch(`/mau/api/cie10/search?q=${encodeURIComponent(searchCie10)}&limit=50`)
        if (response.ok) {
          const data = await response.json()
          setCie10Options(data)
        }
      } catch (error) {
        console.error('Error fetching CIE-10 codes:', error)
      }
    }

    const timer = setTimeout(fetchCie10Codes, 300)
    return () => clearTimeout(timer)
  }, [searchCie10])

  const handleAddCie10 = () => {
    if (!selectedCie10 || !fechaDiagnostico) {
      return
    }

    const newCode: PatientCIE10 = {
      code: selectedCie10,
      diagnosisDate: fechaDiagnostico,
      observations: observacionesCie10
    }

    setCie10Codes([...cie10Codes, newCode])
    setSelectedCie10(null)
    setFechaDiagnostico(undefined)
    setObservacionesCie10("")
    setSearchCie10("")

    if (cie10Codes.length === 0) {
      setShowCie10Warning(true)
    }
  }

  const handleRemoveCie10 = (index: number) => {
    setCie10Codes(cie10Codes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Formulario enviado')
    console.log('Códigos CIE-10:', cie10Codes)

    alert('Funcionalidad de crear paciente en desarrollo')
  }
  const pacientes = [
    {
      nombre: "as as",
      curp: "N/A",
      edad: "36 años",
      telefono: "N/A",
      estado: "ACTIVE",
      registro: "16 nov 2025",
    },
    {
      nombre: "María García",
      curp: "GAMA900515MDFRRC01",
      edad: "35 años",
      telefono: "5559876543",
      estado: "ACTIVE",
      registro: "16 nov 2025",
    },
    {
      nombre: "Juan Pérez",
      curp: "PEJU850101HDFRNN09",
      edad: "40 años",
      telefono: "5551234567",
      estado: "ACTIVE",
      registro: "16 nov 2025",
    },
  ]

  const filteredPacientes = useMemo(() => {
    if (!searchTerm) return pacientes

    const normalizedSearch = normalizeText(searchTerm)
    return pacientes.filter(paciente => {
      const normalizedNombre = normalizeText(paciente.nombre)
      const normalizedCurp = normalizeText(paciente.curp)
      const normalizedTelefono = normalizeText(paciente.telefono)

      return (
        normalizedNombre.includes(normalizedSearch) ||
        normalizedCurp.includes(normalizedSearch) ||
        normalizedTelefono.includes(normalizedSearch)
      )
    })
  }, [searchTerm, pacientes])

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de pacientes del hospital
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Nuevo Paciente</DialogTitle>
              <DialogDescription>
                Registra la información completa del nuevo paciente
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-6 overflow-y-auto pr-6 -mr-6 p-1 -m-1" onSubmit={handleSubmit}>
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expediente">Número de Expediente *</Label>
                    <Input id="expediente" placeholder="Ej: EXP-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curp">CURP *</Label>
                    <Input
                      id="curp"
                      placeholder="Ej: ABCD123456HMCLEF01"
                      value={curp}
                      onChange={handleCurpChange}
                      maxLength={18}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre(s) *</Label>
                    <Input id="nombre" placeholder="Nombre(s) del paciente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                    <Input id="apellidoPaterno" placeholder="Apellido paterno" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                    <Input id="apellidoMaterno" placeholder="Apellido materno" />
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal hover:bg-transparent hover:text-foreground",
                              !fechaNacimiento && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fechaNacimiento ? format(fechaNacimiento, "P", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fechaNacimiento}
                            onSelect={setFechaNacimiento}
                            locale={es}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="estadoNacimiento">Estado de Nacimiento *</Label>
                      <Select value={estadoNacimiento} onValueChange={setEstadoNacimiento}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(estadosMexico).map(([codigo, nombre]) => (
                            <SelectItem key={codigo} value={codigo}>
                              {nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="genero">Género *</Label>
                      <Select value={genero} onValueChange={setGenero}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="tipoSangre">Tipo de Sangre</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="No Determinado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Códigos CIE-10 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Códigos CIE-10</h3>
                    <p className="text-sm text-muted-foreground">Gestiona los códigos de diagnóstico del paciente</p>
                  </div>
                </div>

                {showCie10Warning && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-600">El primer código será marcado como diagnóstico principal</p>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Agregar Nuevo Código CIE-10</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoCie10">Código CIE-10 *</Label>
                        <Popover open={openCie10} onOpenChange={setOpenCie10}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCie10}
                              className="w-full justify-between"
                            >
                              {selectedCie10
                                ? `${selectedCie10.code} - ${selectedCie10.description.substring(0, 30)}...`
                                : "Seleccionar código..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Buscar código..."
                                value={searchCie10}
                                onValueChange={setSearchCie10}
                                className="h-9"
                              />
                              <CommandList className="max-h-[300px] overflow-y-auto">
                                {searchCie10.length < 2 ? (
                                  <CommandEmpty>Escribe al menos 2 caracteres...</CommandEmpty>
                                ) : cie10Options.length === 0 ? (
                                  <CommandEmpty>No se encontraron códigos.</CommandEmpty>
                                ) : (
                                  <CommandGroup>
                                    {cie10Options.map((option) => (
                                      <CommandItem
                                        key={option.id}
                                        value={option.id}
                                        onSelect={() => {
                                          setSelectedCie10(selectedCie10?.id === option.id ? null : option)
                                          setOpenCie10(false)
                                        }}
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium">{option.code}</div>
                                          <div className="text-sm text-muted-foreground">{option.description}</div>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            selectedCie10?.id === option.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaDiagnostico">Fecha de Diagnóstico *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal hover:bg-transparent hover:text-foreground",
                                !fechaDiagnostico && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fechaDiagnostico ? format(fechaDiagnostico, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={fechaDiagnostico}
                              onSelect={setFechaDiagnostico}
                              locale={es}
                              initialFocus
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observacionesCie10">Observaciones</Label>
                      <Textarea
                        id="observacionesCie10"
                        placeholder="Observaciones adicionales..."
                        rows={3}
                        value={observacionesCie10}
                        onChange={(e) => setObservacionesCie10(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddCie10}
                      disabled={!selectedCie10 || !fechaDiagnostico}
                    >
                      Agregar Código
                    </Button>
                  </CardContent>
                </Card>

                {cie10Codes.length > 0 ? (
                  <div className="space-y-3">
                    {cie10Codes.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {item.code.code}
                                </Badge>
                                {index === 0 && (
                                  <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                    Principal
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{item.code.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Fecha: {format(item.diagnosisDate, "PPP", { locale: es })}</span>
                              </div>
                              {item.observations && (
                                <p className="text-sm text-muted-foreground">
                                  Observaciones: {item.observations}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCie10(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">No hay códigos CIE-10</p>
                    <p className="text-xs text-muted-foreground">Agrega el primer código usando el formulario de arriba</p>
                  </div>
                )}
              </div>

              {/* Alergias Conocidas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alergias Conocidas</h3>
                <div className="space-y-2">
                  <Textarea placeholder="Describir alergias conocidas del paciente..." rows={4} />
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" placeholder="Ej: 5551234567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactoEmergencia">Contacto de Emergencia</Label>
                    <Input id="contactoEmergencia" placeholder="Nombre del contacto de emergencia" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefonoEmergencia">Teléfono de Emergencia</Label>
                    <Input id="telefonoEmergencia" placeholder="Teléfono del contacto de emergencia" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea id="direccion" placeholder="Dirección completa del paciente..." rows={3} />
                </div>
              </div>

              {/* Información del Seguro Médico */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Seguro Médico</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroSeguro">Número de Seguro Social</Label>
                    <Input id="numeroSeguro" placeholder="Número de seguro social" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institucionSeguro">Institución de Seguro</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar institución" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imss">IMSS</SelectItem>
                        <SelectItem value="issste">ISSSTE</SelectItem>
                        <SelectItem value="pemex">PEMEX</SelectItem>
                        <SelectItem value="sedena">SEDENA</SelectItem>
                        <SelectItem value="semar">SEMAR</SelectItem>
                        <SelectItem value="privado">Seguro Privado</SelectItem>
                        <SelectItem value="ninguno">Sin Seguro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Paciente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, CURP o teléfono..."
          className="pl-10 h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>Pacientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left font-medium p-3 w-[20%]">Nombre</th>
                  <th className="text-left font-medium p-3 w-[18%]">CURP</th>
                  <th className="text-left font-medium p-3 w-[10%]">Edad</th>
                  <th className="text-left font-medium p-3 w-[13%]">Teléfono</th>
                  <th className="text-left font-medium p-3 w-[12%]">Estado</th>
                  <th className="text-left font-medium p-3 w-[12%]">Registro</th>
                  <th className="text-left font-medium p-3 w-[15%]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.length > 0 ? (
                  filteredPacientes.map((paciente, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 truncate">{paciente.nombre}</td>
                      <td className="p-3 font-mono text-sm truncate">{paciente.curp}</td>
                      <td className="p-3 truncate">{paciente.edad}</td>
                      <td className="p-3 truncate">{paciente.telefono}</td>
                      <td className="p-3">
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          {paciente.estado}
                        </Badge>
                      </td>
                      <td className="p-3 truncate">{paciente.registro}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewPatient(paciente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditPatient(paciente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No se encontraron pacientes que coincidan con la búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewPatient} onOpenChange={() => setViewPatient(null)}>
        <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Información del Paciente</DialogTitle>
            <DialogDescription>
              Detalles completos del paciente
            </DialogDescription>
          </DialogHeader>
          {viewPatient && (
            <div className="space-y-6 overflow-y-auto pr-6 -mr-6 p-1 -m-1">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Número de Expediente</Label>
                    <p className="text-sm font-medium">EXP-2024-001</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">CURP</Label>
                    <p className="text-sm font-mono">{viewPatient.curp}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Nombre(s)</Label>
                    <p className="text-sm font-medium">{viewPatient.nombre}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Apellido Paterno</Label>
                    <p className="text-sm font-medium">García</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Apellido Materno</Label>
                    <p className="text-sm font-medium">López</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Fecha de Nacimiento</Label>
                    <p className="text-sm font-medium">15 de mayo de 1990</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Estado de Nacimiento</Label>
                    <p className="text-sm font-medium">Ciudad de México</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Género</Label>
                    <p className="text-sm font-medium">Femenino</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Edad</Label>
                    <p className="text-sm font-medium">{viewPatient.edad}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Tipo de Sangre</Label>
                    <p className="text-sm font-medium">O+</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Códigos CIE-10</h3>
                  <p className="text-sm text-muted-foreground">Códigos de diagnóstico del paciente</p>
                </div>

                {cie10Codes.length > 0 ? (
                  <div className="space-y-3">
                    {cie10Codes.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {item.code.code}
                                </Badge>
                                {index === 0 && (
                                  <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                    Principal
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{item.code.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Fecha: {format(item.diagnosisDate, "PPP", { locale: es })}</span>
                              </div>
                              {item.observations && (
                                <p className="text-sm text-muted-foreground">
                                  Observaciones: {item.observations}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20">
                    <p className="text-sm font-medium text-muted-foreground mb-1">No hay códigos CIE-10 registrados</p>
                    <p className="text-xs text-muted-foreground">Este paciente no tiene códigos de diagnóstico</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alergias Conocidas</h3>
                <div className="p-3 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground">Alergia a la penicilina y a los mariscos</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Teléfono</Label>
                    <p className="text-sm font-medium">{viewPatient.telefono}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Contacto de Emergencia</Label>
                    <p className="text-sm font-medium">Juan García Pérez</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Teléfono de Emergencia</Label>
                    <p className="text-sm font-medium">5551234567</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-muted-foreground">Dirección</Label>
                    <p className="text-sm font-medium">Calle Principal #123, Col. Centro, Ciudad de México, CP 06000</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Seguro Médico</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Número de Seguro Social</Label>
                    <p className="text-sm font-medium">12345678901</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Institución de Seguro</Label>
                    <p className="text-sm font-medium">IMSS</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Registro</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Estado</Label>
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      {viewPatient.estado}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Fecha de Registro</Label>
                    <p className="text-sm font-medium">{viewPatient.registro}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setViewPatient(null)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPatient} onOpenChange={() => setEditPatient(null)}>
        <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Actualiza la información del paciente
            </DialogDescription>
          </DialogHeader>
          {editPatient && (
            <form className="space-y-6 overflow-y-auto pr-6 -mr-6 p-1 -m-1">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-expediente">Número de Expediente *</Label>
                    <Input id="edit-expediente" placeholder="Ej: EXP-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-curp">CURP *</Label>
                    <Input
                      id="edit-curp"
                      placeholder="Ej: ABCD123456HMCLEF01"
                      defaultValue={editPatient.curp}
                      maxLength={18}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nombre">Nombre(s) *</Label>
                    <Input id="edit-nombre" placeholder="Nombre(s) del paciente" defaultValue={editPatient.nombre} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-apellidoPaterno">Apellido Paterno *</Label>
                    <Input id="edit-apellidoPaterno" placeholder="Apellido paterno" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-apellidoMaterno">Apellido Materno</Label>
                    <Input id="edit-apellidoMaterno" placeholder="Apellido materno" />
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="edit-fechaNacimiento">Fecha de Nacimiento *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal hover:bg-transparent hover:text-foreground",
                              !fechaNacimiento && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fechaNacimiento ? format(fechaNacimiento, "P", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fechaNacimiento}
                            onSelect={setFechaNacimiento}
                            locale={es}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="edit-estadoNacimiento">Estado de Nacimiento *</Label>
                      <Select value={estadoNacimiento} onValueChange={setEstadoNacimiento}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(estadosMexico).map(([codigo, nombre]) => (
                            <SelectItem key={codigo} value={codigo}>
                              {nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="edit-genero">Género *</Label>
                      <Select value={genero} onValueChange={setGenero}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="edit-tipoSangre">Tipo de Sangre</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="No Determinado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Códigos CIE-10</h3>
                    <p className="text-sm text-muted-foreground">Gestiona los códigos de diagnóstico del paciente</p>
                  </div>
                </div>

                {showCie10Warning && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-600">El primer código será marcado como diagnóstico principal</p>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Agregar Nuevo Código CIE-10</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-codigoCie10">Código CIE-10 *</Label>
                        <Popover open={openCie10} onOpenChange={setOpenCie10}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCie10}
                              className="w-full justify-between"
                            >
                              {selectedCie10
                                ? `${selectedCie10.code} - ${selectedCie10.description.substring(0, 30)}...`
                                : "Seleccionar código..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Buscar código..."
                                value={searchCie10}
                                onValueChange={setSearchCie10}
                                className="h-9"
                              />
                              <CommandList className="max-h-[300px] overflow-y-auto">
                                {searchCie10.length < 2 ? (
                                  <CommandEmpty>Escribe al menos 2 caracteres...</CommandEmpty>
                                ) : cie10Options.length === 0 ? (
                                  <CommandEmpty>No se encontraron códigos.</CommandEmpty>
                                ) : (
                                  <CommandGroup>
                                    {cie10Options.map((option) => (
                                      <CommandItem
                                        key={option.id}
                                        value={option.id}
                                        onSelect={() => {
                                          setSelectedCie10(selectedCie10?.id === option.id ? null : option)
                                          setOpenCie10(false)
                                        }}
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium">{option.code}</div>
                                          <div className="text-sm text-muted-foreground">{option.description}</div>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            selectedCie10?.id === option.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-fechaDiagnostico">Fecha de Diagnóstico *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal hover:bg-transparent hover:text-foreground",
                                !fechaDiagnostico && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fechaDiagnostico ? format(fechaDiagnostico, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={fechaDiagnostico}
                              onSelect={setFechaDiagnostico}
                              locale={es}
                              initialFocus
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-observacionesCie10">Observaciones</Label>
                      <Textarea
                        id="edit-observacionesCie10"
                        placeholder="Observaciones adicionales..."
                        rows={3}
                        value={observacionesCie10}
                        onChange={(e) => setObservacionesCie10(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddCie10}
                      disabled={!selectedCie10 || !fechaDiagnostico}
                    >
                      Agregar Código
                    </Button>
                  </CardContent>
                </Card>

                {cie10Codes.length > 0 ? (
                  <div className="space-y-3">
                    {cie10Codes.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {item.code.code}
                                </Badge>
                                {index === 0 && (
                                  <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                    Principal
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{item.code.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Fecha: {format(item.diagnosisDate, "PPP", { locale: es })}</span>
                              </div>
                              {item.observations && (
                                <p className="text-sm text-muted-foreground">
                                  Observaciones: {item.observations}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCie10(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-4 bg-muted rounded-full mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">No hay códigos CIE-10</p>
                    <p className="text-xs text-muted-foreground">Agrega el primer código usando el formulario de arriba</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Alergias Conocidas</h3>
                <div className="space-y-2">
                  <Textarea placeholder="Describir alergias conocidas del paciente..." rows={4} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-telefono">Teléfono</Label>
                    <Input id="edit-telefono" placeholder="Ej: 5551234567" defaultValue={editPatient.telefono} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-contactoEmergencia">Contacto de Emergencia</Label>
                    <Input id="edit-contactoEmergencia" placeholder="Nombre del contacto de emergencia" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-telefonoEmergencia">Teléfono de Emergencia</Label>
                    <Input id="edit-telefonoEmergencia" placeholder="Teléfono del contacto de emergencia" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-direccion">Dirección</Label>
                  <Textarea id="edit-direccion" placeholder="Dirección completa del paciente..." rows={3} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Seguro Médico</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-numeroSeguro">Número de Seguro Social</Label>
                    <Input id="edit-numeroSeguro" placeholder="Número de seguro social" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-institucionSeguro">Institución de Seguro</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar institución" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imss">IMSS</SelectItem>
                        <SelectItem value="issste">ISSSTE</SelectItem>
                        <SelectItem value="pemex">PEMEX</SelectItem>
                        <SelectItem value="sedena">SEDENA</SelectItem>
                        <SelectItem value="semar">SEMAR</SelectItem>
                        <SelectItem value="privado">Seguro Privado</SelectItem>
                        <SelectItem value="ninguno">Sin Seguro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditPatient(null)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
