"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Search, Filter, Frown, FilterX } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface CIE10Item {
  id: string
  code: string
  description: string
  category: string | null
}

interface CIE10Response {
  data: CIE10Item[]
  categories: string[]
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function TruncatedTextWithTooltip({ text, className = "" }: { text: string, className?: string }) {
  const textRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (element) {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    }
  }, [text])

  if (isTruncated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div ref={textRef} className={`truncate cursor-default ${className}`}>
            {text}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div ref={textRef} className={`truncate ${className}`}>
      {text}
    </div>
  )
}

export default function CIE10Page() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [allData, setAllData] = useState<CIE10Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/mau/api/cie10/all`)

        if (!response.ok) {
          throw new Error('Error al cargar los datos')
        }

        const result: CIE10Response = await response.json()

        setAllData(result.data)
        setCategories(result.categories)
      } catch (error) {
        console.error('Error al cargar el catálogo CIE-10:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    let filtered = allData

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (searchTerm) {
      const normalizedSearch = normalizeText(searchTerm)
      filtered = filtered.filter(item => {
        const normalizedCode = normalizeText(item.code)
        const normalizedDescription = normalizeText(item.description)
        return (
          normalizedCode.includes(normalizedSearch) ||
          normalizedDescription.includes(normalizedSearch)
        )
      })
    }

    return filtered
  }, [allData, searchTerm, selectedCategory])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catálogo CIE-10</h1>
        <p className="text-muted-foreground mt-2">
          Clasificación Internacional de Enfermedades
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o descripción..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[450px] !h-10">
            <div className="flex items-center gap-2 w-full overflow-hidden">
              <Filter className="h-4 w-4 shrink-0" />
              <span className="truncate">
                <SelectValue placeholder="Todas las categorías" />
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchTerm || selectedCategory) && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("")
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
          <CardTitle>Diagnósticos</CardTitle>
          <CardDescription>
            {loading ? 'Cargando...' : `${filteredData.length} códigos encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="size-8 mb-4" />
              <p className="text-sm text-muted-foreground">Cargando catálogo CIE-10...</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              <div className="min-h-[500px]">
                <TooltipProvider>
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b text-sm text-muted-foreground">
                        <th className="text-left font-medium p-3 w-[10%]">Código</th>
                        <th className="text-left font-medium p-3 w-[50%]">Descripción</th>
                        <th className="text-left font-medium p-3 w-[40%]">Capítulo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 pr-1">
                            <Badge variant="outline" className="font-mono">
                              {item.code}
                            </Badge>
                          </td>
                          <td className="p-3 pl-1">
                            <TruncatedTextWithTooltip text={item.description} />
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            <TruncatedTextWithTooltip text={item.category || ""} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TooltipProvider>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;

                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-muted-foreground">
              <Frown className="h-12 w-12 mb-4 opacity-50" />
              <p>No se encontraron códigos que coincidan con la búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
