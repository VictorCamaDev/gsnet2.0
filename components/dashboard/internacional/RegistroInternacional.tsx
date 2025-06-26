"use client"

import type React from "react"
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Trash2,
  ClipboardList,
  Leaf,
  FileText,
  Target,
  Factory,
  Building,
  Bookmark,
  FileCheck,
  Eye,
  X,
  Upload,
  Search,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import type { IntProductoRegistradoEntity } from "@/types/registro"
import { cn } from "@/lib/utils"
import { ApiService } from "@/services/api.service"
import Swal from "sweetalert2"
import { toast } from "react-hot-toast";

// Define interfaces for master data
interface MasterDataItem {
  id: number
  nombre: string
  [key: string]: any
}

interface IngredienteActivo {
  id?: number
  nombre: string
  concentracion: string
  porcentaje: string
}

interface Plaga {
  id?: number
  nombreComun: string
  nombreCientifico: string
  dosis: string
  lmr: string
  pcDias: number
  prHoras: number
}

interface Uso {
  id?: number
  cultivoId?: number
  cultivoNombre: string
  numeroResolucion: string
  plagas: Plaga[]
}

interface Empresa {
  id?: number
  nombre: string
  pais: string
  direccion: string
}

interface DocumentoAdjunto {
  id: string
  nombre: string
  tipo: string
  tamano: string
  archivo: File
}

interface FormulacionItem extends MasterDataItem {
  codigo: string
  descripcion: string
}

interface BandaToxItem extends MasterDataItem {
  color: string
  descripcion: string
}

function ComboboxWithAddNew({
  data,
  value,
  onChange,
  placeholder,
  label,
  onAddNew,
}: {
  data: MasterDataItem[]
  value: number | string | undefined
  onChange: (value: number | string) => void
  placeholder: string
  label: string
  onAddNew: (value: string) => void
}) {

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showAddNew, setShowAddNew] = useState(false)

  const handleSelect = (currentValue: string) => {
    onChange(currentValue)
    setOpen(false)
  }

  const handleAddNew = () => {
    if (inputValue.trim()) {
      onAddNew(inputValue.trim())
      setInputValue("")
      setShowAddNew(false)
    }
  }

  useEffect(() => {
    setShowAddNew(
      inputValue.trim() !== "" && !data.some((item) => item.nombre.toLowerCase() === inputValue.toLowerCase()),
    )
  }, [inputValue, data])

  const selectedItem = data.find((item) => item.id === value || item.id === Number(value))

  return (
    <div className="flex flex-col space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full text-left font-normal"
          >
            {selectedItem ? selectedItem.nombre : placeholder}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                <CommandItem
                  onSelect={() => onAddNew(inputValue.trim())}
                  className="cursor-pointer text-green-600 font-medium flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {inputValue.trim() ? `Agregar "${inputValue.trim()}"` : 'Añadir nuevo'}
                </CommandItem>
                {data.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.nombre}
                    onSelect={() => handleSelect(item.id.toString())}
                    className={cn(
                      "cursor-pointer",
                      value === item.id && "bg-green-100 text-green-700"
                    )}
                  >
                    {item.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// --- Utilidad para normalizar tipos del payload ---
function normalizePayload(payload: any): any {
  // IDs y campos que deben ser number
  const numberFields = [
    "tipoProducto", "formulacion", "claseUso", "bandaToxicologica",
    "presentacionRegistrada", "tipoEnvase", "claseRegistroMarca", "tipoRegistroMarca",
    "id", "fabricante", "formulador", "cultivoId", "plagaId", "pcDias", "prHoras", "dosis", "lmr", "valor", "statusAvance"
  ];
  function normalize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(normalize);
    } else if (obj && typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        // Si es un campo de los que deben ser number y es string numérico
        if (numberFields.includes(key) && typeof obj[key] === "string" && !isNaN(Number(obj[key])) && obj[key] !== "") {
          newObj[key] = Number(obj[key]);
        }
        // IDs en arrays (fabricante, formulador)
        else if ((key === "fabricante" || key === "formulador") && Array.isArray(obj[key])) {
          newObj[key] = obj[key].map((id: any) => (typeof id === "string" && !isNaN(Number(id))) ? Number(id) : id);
        }
        // Recursividad para objetos anidados
        else {
          newObj[key] = normalize(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  }
  return normalize(payload);
}

export default function RegistroInternacional() {
  const apiService = new ApiService()
  const [submitting, setSubmitting] = useState(false)
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [ingredientesActivos, setIngredientesActivos] = useState<MasterDataItem[]>([])
  const [tiposProducto, setTiposProducto] = useState<MasterDataItem[]>([])
  const [clasesUso, setClasesUso] = useState<MasterDataItem[]>([])
  const [bandasTox, setBandasTox] = useState<BandaToxItem[]>([])
  const [formulaciones, setFormulaciones] = useState<FormulacionItem[]>([])
  const [cultivos, setCultivos] = useState<MasterDataItem[]>([])
  const [plagas, setPlagas] = useState<MasterDataItem[]>([])
  const [tiposRegistroMarca, setTiposRegistroMarca] = useState<MasterDataItem[]>([])
  const [clasesRegistroMarca, setClasesRegistroMarca] = useState<MasterDataItem[]>([])
  const [empresas, setEmpresas] = useState<MasterDataItem[]>([])
  const [listaAvances, setListaAvances] = useState<MasterDataItem[]>([])

  const [openPlagasDialog, setOpenPlagasDialog] = useState(false)
  const [selectedUsoIndex, setSelectedUsoIndex] = useState<number | null>(null)
  const [selectedPlagas, setSelectedPlagas] = useState<Plaga[]>([])
  const [openAddNewDialog, setOpenAddNewDialog] = useState(false)
  const [newItemType, setNewItemType] = useState<string>("")
  const [newItemName, setNewItemName] = useState<string>("")
  const [newItemData, setNewItemData] = useState<any>({})

  const [formData, setFormData] = useState<Partial<IntProductoRegistradoEntity>>({
    tipoProducto: "",
    producto: "",
    formulacion: "",
    claseUso: "",
    bandaToxicologica: "",
    presentacionRegistrada: "",
    tipoEnvase: "",
    materialesEnvase: "",
    descripcion: "",
    dictamenTecnico: "",
    estabilidadProducto: "",
    ingredienteActivo: [],
    avance: {
      numeroExpediente: "",
      presentacionExpediente: "",
      terminoRegistro: "",
      comentario: "",
      statusAvance: "",
      valor: "",
    },
    certificado: {
      numeroCertificado: "",
      fechaRegistro: "",
      fechaActualizacion: "",
      vigenciaRegistro: "",
      formulador: [],
      fabricante: [],
    },
    fabricantes: [],
    formuladores: [],
    marca: {
      marcaRegistrada: "",
      numeroRegistro: "",
      claseRegistroMarca: "",
      tipoRegistroMarca: "",
      fechaRegistro: "",
      vigencia: "",
      logo: "",
    },
    usos: [],
  })

  const [ingredientes, setIngredientes] = useState<IngredienteActivo[]>([])
  const [nuevoIngrediente, setNuevoIngrediente] = useState<IngredienteActivo>({
    nombre: "",
    concentracion: "",
    porcentaje: "",
  })

  const [fabricantes, setFabricantes] = useState<Empresa[]>([])
  const [formuladores, setFormuladores] = useState<Empresa[]>([])

  const [usos, setUsos] = useState<Uso[]>([])
  const [nuevoUso, setNuevoUso] = useState<{
    cultivoId?: number
    cultivoNombre: string
    numeroResolucion: string
  }>({
    cultivoNombre: "",
    numeroResolucion: "",
  })

  const [nuevaPlaga, setNuevaPlaga] = useState<Plaga>({
    nombreComun: "",
    nombreCientifico: "",
    dosis: "",
    lmr: "",
    pcDias: 0,
    prHoras: 0,
  })

  const [usoSeleccionado, setUsoSeleccionado] = useState<number | null>(null)
  const [plagasUso, setPlagasUso] = useState<Record<number, Plaga[]>>({})

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [documentos, setDocumentos] = useState<DocumentoAdjunto[]>([])
  const [previewDocument, setPreviewDocument] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const multipleFileInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { id: 1, title: "Información General del Producto", icon: ClipboardList },
    { id: 2, title: "Ingredientes Activos y Composición", icon: Leaf },
    { id: 3, title: "Estado y Avance del Registro", icon: FileText },
    { id: 4, title: "Aplicaciones y Usos Autorizados", icon: Target },
    { id: 5, title: "Datos del Fabricante", icon: Factory },
    { id: 6, title: "Datos del Formulador", icon: Building },
    { id: 7, title: "Información de Marca y Registro Comercial", icon: Bookmark },
    { id: 8, title: "Documentación y Archivos Adjuntos", icon: FileCheck },
  ]

  // Declarar fetchMasterData en el scope del componente
  const fetchMasterData = async () => {
    try {
      let headers: any = {};
      const selectedCompany = sessionStorage.getItem("selected_company");
      if (selectedCompany) {
        try {
          const companyObj = JSON.parse(selectedCompany);
          if (companyObj?.id) {
            headers["IdEmpresa"] = companyObj.id;
          }
        } catch (e) {
          console.warn("Error parseando selected_company:", e);
        }
      }

      const [
        ingredientesRes,
        tiposProductoRes,
        clasesUsoRes,
        bandasToxRes,
        formulacionesRes,
        cultivosRes,
        plagasRes,
        tiposRegistroMarcaRes,
        clasesRegistroMarcaRes,
        empresasRes,
        listaAvancesRes,
      ] = await Promise.all([
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/ingredientes-activos", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/tipos-producto", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/clases-uso", headers),
        apiService.get<{ data: BandaToxItem[] }>("/Formulario/bandas-toxicologicas", headers),
        apiService.get<{ data: FormulacionItem[] }>("/Formulario/formulaciones", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/cultivos", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/plagas", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/tipos-registro-marca", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/clases-registro-marca", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/empresas", headers),
        apiService.get<{ data: MasterDataItem[] }>("/Formulario/lista-avances", headers),
      ])

      if (Array.isArray(ingredientesRes)) {
        setIngredientesActivos(ingredientesRes)
      } else if (ingredientesRes?.data && Array.isArray(ingredientesRes.data)) {
        setIngredientesActivos(ingredientesRes.data)
      } else if (ingredientesRes?.data?.data && Array.isArray(ingredientesRes.data.data)) {
        setIngredientesActivos(ingredientesRes.data.data)
      } else {
        setIngredientesActivos([])
      }

      type ComboBoxItem = { value: number | string; label: string }

      function toComboBoxItemArray(arr: any[], valueKey: string, labelKey: string): ComboBoxItem[] {
        return Array.isArray(arr)
          ? arr.map(item => ({
            value: item[valueKey],
            label: item[labelKey],
          }))
          : []
      }

      // Empresas (ComboBox)
      let empresasFull: { id: number, nombre: string, pais: string, direccion: string }[] = [];
      // console.log("Empresas para combobox (raw):", empresasRes);
      if (Array.isArray(empresasRes)) {
        empresasFull = empresasRes.map(e => ({
          id: e.empresaId ?? e.id,
          nombre: e.nombre,
          pais: e.pais,
          direccion: e.direccion
        }));
      } else if (empresasRes?.data && Array.isArray(empresasRes.data)) {
        empresasFull = empresasRes.data.map(e => ({
          id: e.empresaId ?? e.id,
          nombre: e.nombre,
          pais: e.pais,
          direccion: e.direccion
        }));
      } else if (empresasRes?.data?.data && Array.isArray(empresasRes.data.data)) {
        empresasFull = empresasRes.data.data.map(e => ({
          id: e.empresaId ?? e.id,
          nombre: e.nombre,
          pais: e.pais,
          direccion: e.direccion
        }));
      } else {
        empresasFull = [];
      }
      // console.log("Empresas para combobox (full):", empresasFull);
      setEmpresas(empresasFull);
      // Tipos de producto
      if (Array.isArray(tiposProductoRes)) {
        setTiposProducto(tiposProductoRes)
      } else if (tiposProductoRes?.data && Array.isArray(tiposProductoRes.data)) {
        setTiposProducto(tiposProductoRes.data)
      } else if (tiposProductoRes?.data?.data && Array.isArray(tiposProductoRes.data.data)) {
        setTiposProducto(tiposProductoRes.data.data)
      } else {
        setTiposProducto([])
      }
      // Clases de uso
      if (Array.isArray(clasesUsoRes)) {
        setClasesUso(clasesUsoRes)
      } else if (clasesUsoRes?.data && Array.isArray(clasesUsoRes.data)) {
        setClasesUso(clasesUsoRes.data)
      } else if (clasesUsoRes?.data?.data && Array.isArray(clasesUsoRes.data.data)) {
        setClasesUso(clasesUsoRes.data.data)
      } else {
        setClasesUso([])
      }
      // Bandas toxicológicas
      if (Array.isArray(bandasToxRes)) {
        setBandasTox(bandasToxRes)
      } else if (bandasToxRes?.data && Array.isArray(bandasToxRes.data)) {
        setBandasTox(bandasToxRes.data)
      } else if (bandasToxRes?.data?.data && Array.isArray(bandasToxRes.data.data)) {
        setBandasTox(bandasToxRes.data.data)
      } else {
        setBandasTox([])
      }
      // Formulaciones
      if (Array.isArray(formulacionesRes)) {
        setFormulaciones(formulacionesRes)
      } else if (formulacionesRes?.data && Array.isArray(formulacionesRes.data)) {
        setFormulaciones(formulacionesRes.data)
      } else if (formulacionesRes?.data?.data && Array.isArray(formulacionesRes.data.data)) {
        setFormulaciones(formulacionesRes.data.data)
      } else {
        setFormulaciones([])
      }
      // Cultivos
      if (Array.isArray(cultivosRes)) {
        setCultivos(cultivosRes)
      } else if (cultivosRes?.data && Array.isArray(cultivosRes.data)) {
        setCultivos(cultivosRes.data)
      } else if (cultivosRes?.data?.data && Array.isArray(cultivosRes.data.data)) {
        setCultivos(cultivosRes.data.data)
      } else {
        setCultivos([])
      }
      // Plagas
      if (Array.isArray(plagasRes)) {
        setPlagas(plagasRes)
      } else if (plagasRes?.data && Array.isArray(plagasRes.data)) {
        setPlagas(plagasRes.data)
      } else if (plagasRes?.data?.data && Array.isArray(plagasRes.data.data)) {
        setPlagas(plagasRes.data.data)
      } else {
        setPlagas([])
      }
      // Tipos registro marca
      if (Array.isArray(tiposRegistroMarcaRes)) {
        setTiposRegistroMarca(tiposRegistroMarcaRes)
      } else if (tiposRegistroMarcaRes?.data && Array.isArray(tiposRegistroMarcaRes.data)) {
        setTiposRegistroMarca(tiposRegistroMarcaRes.data)
      } else if (tiposRegistroMarcaRes?.data?.data && Array.isArray(tiposRegistroMarcaRes.data.data)) {
        setTiposRegistroMarca(tiposRegistroMarcaRes.data.data)
      } else {
        setTiposRegistroMarca([])
      }
      // Clases registro marca
      if (Array.isArray(clasesRegistroMarcaRes)) {
        setClasesRegistroMarca(clasesRegistroMarcaRes)
      } else if (clasesRegistroMarcaRes?.data && Array.isArray(clasesRegistroMarcaRes.data)) {
        setClasesRegistroMarca(clasesRegistroMarcaRes.data)
      } else if (clasesRegistroMarcaRes?.data?.data && Array.isArray(clasesRegistroMarcaRes.data.data)) {
        setClasesRegistroMarca(clasesRegistroMarcaRes.data.data)
      } else {
        setClasesRegistroMarca([])
      }
      // Empresas
      if (Array.isArray(empresasRes)) {
        // console.log("Empresas:", empresasRes);
        setEmpresas(empresasRes.map(e => ({
          id: e.empresaId ?? e.id,
          nombre: e.nombre,
          pais: e.pais,
          direccion: e.direccion
        })));
      } else if (empresasRes?.data && Array.isArray(empresasRes.data)) {
        setEmpresas(empresasRes.data.map(e => ({
          id: e.empresaId ?? e.id,
          nombre: e.nombre,
          pais: e.pais,
          direccion: e.direccion
        })));
      } else if (empresasRes?.data?.data && Array.isArray(empresasRes.data.data)) {
        setEmpresas(empresasRes.data.data.map(e => ({
          id: e.empresaId ?? e.id,
          nombre: e.nombre,
          pais: e.pais,
          direccion: e.direccion
        })));
      } else {
        setEmpresas([])
      }
      // Lista avances
      if (Array.isArray(listaAvancesRes)) {
        setListaAvances(listaAvancesRes)
      } else if (listaAvancesRes?.data && Array.isArray(listaAvancesRes.data)) {
        setListaAvances(listaAvancesRes.data)
      } else if (listaAvancesRes?.data?.data && Array.isArray(listaAvancesRes.data.data)) {
        setListaAvances(listaAvancesRes.data.data)
      } else {
        setListaAvances([])
      }

    } catch (error) {
      console.error("Error fetching master data:", error)
    }
  }

  // --- HANDLE SUBMIT REGISTRO/ACTUALIZAR ---
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    Swal.fire({
      title: 'Guardando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    let headers: any = {};
    const selectedCompany = sessionStorage.getItem("selected_company");
    if (selectedCompany) {
      try {
        const companyObj = JSON.parse(selectedCompany);
        if (companyObj?.id) {
          headers["IdEmpresa"] = companyObj.id;
        }
      } catch (e) {
        console.warn("Error parseando selected_company:", e);
      }
    }
    // Agregar codigousuario y loginusuario
    const currentUser = sessionStorage.getItem("current_user");
    if (currentUser) {
      try {
        const userObj = JSON.parse(currentUser);
        if (userObj?.codigoUsuario) {
          headers.codigousuario = userObj.codigoUsuario.toString();
        }
        if (userObj?.loginUsuario) {
          headers.loginusuario = userObj.loginUsuario;
        }
      } catch (e) {
        console.warn("Error parseando current_user:", e);
      }
    }

    try {
      // Construir payload
      const certificadoWithIds: any = {
        ...(formData.certificado || {}),
        fabricante: fabricantes.map((f: any) => f.id),
        formulador: formuladores.map((f: any) => f.id),
      };
      const payload = {
        ...formData,
        fabricantes,
        formuladores,
        usos,
        ingredienteActivo: ingredientes,
        certificado: certificadoWithIds,
      };
      let endpoint = "/Formulario/guardar-producto";
      if (id) endpoint = "/Formulario/ActualizarRegistroInternacional";
      const normalizedPayload = normalizePayload(payload);
      const res = await apiService.post(endpoint, normalizedPayload, headers);
      if (res && (res.success)) {
        // Log de auditoría: creación o edición de registro internacional
        await apiService.post(
          '/Log/InsertarLog',
          {
            accion: id ? 'Editar registro internacional' : 'Nuevo registro internacional',
            descripcion: id
              ? `Se editó el registro internacional con ID ${id}`
              : `Se creó un nuevo registro internacional`,
            ruta: window.location.pathname,
          },
          headers 
        );
        id ? await Swal.fire({
          title: '¡Producto actualizado! 🎉',
          showConfirmButton: false,
          timer: 1800,
          background: '#ecfdf5',
          color: '#065f46',
        }) :
          await Swal.fire({
            title: '¡Producto registrado! 🎉',
            showConfirmButton: false,
            timer: 1800,
            background: '#ecfdf5',
            color: '#065f46',
          });
        window.location.href = "/dashboard/internacional/consulta";
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Ups... Ocurrió un error',
          text: 'No se pudo registrar el producto. Intenta nuevamente.',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Ups... Ocurrió un error',
        text: 'No se pudo registrar el producto. Intenta nuevamente.',
        confirmButtonColor: '#dc2626',
      });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Llamar fetchMasterData al montar el componente
  useEffect(() => {
    fetchMasterData()
  }, [])

  // Precarga de datos para edición
  useEffect(() => {
    if (id) {
      let headers: any = {};
      const selectedCompany = sessionStorage.getItem("selected_company");
      if (selectedCompany) {
        try {
          const companyObj = JSON.parse(selectedCompany);
          if (companyObj?.id) {
            headers["IdEmpresa"] = companyObj.id;
          }
        } catch (e) {
          console.warn("Error parseando selected_company:", e);
        }
      }
      apiService.get(`/RegistroInternacional/ObtenerRegistroInternacional/${id}`, headers)
        .then(res => {
          if (!res || !res.data) return;
          setFormData(res.data);
        });
    } else {
      console.log("No hay id");
    }
  }, [id])

  useEffect(() => {
    if (formData.ingredienteActivo && Array.isArray(formData.ingredienteActivo)) {
      setIngredientes(formData.ingredienteActivo as IngredienteActivo[]);
    }
  }, [formData.ingredienteActivo]);

  useEffect(() => {
    if (formData.usos && Array.isArray(formData.usos)) {
      setUsos(formData.usos as Uso[]);
    }
  }, [formData.usos]);

  useEffect(() => {
    if (formData.usos && Array.isArray(formData.usos)) {
      const plagasMap: Record<number, Plaga[]> = {};
      formData.usos.forEach((uso, index) => {
        plagasMap[index] = (uso.plagas || []).map((plaga: any) => ({
          id: plaga.id ?? undefined,
          nombreComun: plaga.nombreComun ?? "",
          nombreCientifico: plaga.nombreCientifico ?? "",
          dosis: plaga.dosis ?? "",
          lmr: plaga.lmr ?? "",
          pcDias: plaga.pcDias ?? 0,
          prHoras: plaga.prHoras ?? 0,
        }));
      });
      setPlagasUso(plagasMap);
    }
  }, [formData.usos]);

  useEffect(() => {
    if (formData.fabricantes && empresas.length > 0) {
      setFabricantes(
        (formData.fabricantes as any[]).map(f => {
          if (typeof f === 'number' || typeof f === 'string') {
            const emp = empresas.find(e => e.id === Number(f));
            return emp ? {
              id: emp.id,
              nombre: emp.nombre,
              pais: (emp as any).pais ?? '',
              direccion: (emp as any).direccion ?? ''
            } : { id: Number(f), nombre: '', pais: '', direccion: '' };
          }
          if (typeof f === 'object') {
            const emp = empresas.find(e => e.id === (f.id ?? f.empresaId));
            if (emp) {
              return {
                id: emp.id,
                nombre: emp.nombre,
                pais: (emp as any).pais ?? '',
                direccion: (emp as any).direccion ?? ''
              };
            }
            return {
              id: f.id ?? f.empresaId,
              nombre: f.nombre ?? '',
              pais: f.pais ?? '',
              direccion: f.direccion ?? ''
            };
          }
          return { id: '', nombre: '', pais: '', direccion: '' };
        }) as Empresa[]
      );
    }
    if (formData.formuladores && empresas.length > 0) {
      setFormuladores(
        (formData.formuladores as any[]).map(f => {
          if (typeof f === 'number' || typeof f === 'string') {
            const emp = empresas.find(e => e.id === Number(f));
            return emp ? {
              id: emp.id,
              nombre: emp.nombre,
              pais: (emp as any).pais ?? '',
              direccion: (emp as any).direccion ?? ''
            } : { id: Number(f), nombre: '', pais: '', direccion: '' };
          }
          if (typeof f === 'object') {
            const emp = empresas.find(e => e.id === (f.id ?? f.empresaId));
            if (emp) {
              return {
                id: emp.id,
                nombre: emp.nombre,
                pais: (emp as any).pais ?? '',
                direccion: (emp as any).direccion ?? ''
              };
            }
            return {
              id: f.id ?? f.empresaId,
              nombre: f.nombre ?? '',
              pais: f.pais ?? '',
              direccion: f.direccion ?? ''
            };
          }
          return { id: '', nombre: '', pais: '', direccion: '' };
        }) as Empresa[]
      );
    }
  }, [formData.fabricantes, formData.formuladores, empresas]);

  const handleAddNewItem = async (type: string, name: string, additionalData: any = {}) => {
    try {
      const data = {
        nombre: name,
        ...additionalData,
        estado: true,
        usuarioCreacion: (() => {
          try {
            const user = JSON.parse(sessionStorage.getItem("current_user") || "null");
            if (user && user.codigoUsuario && user.loginUsuario) {
              return `${user.codigoUsuario}-${user.loginUsuario}`;
            }
            return "desconocido";
          } catch {
            return "desconocido";
          }
        })(),
      };

      let endpoint = "";
      switch (type) {
        case "ingredienteActivo":
          endpoint = "/RegistroInternacional/maestras/ingredientes-activos";
          break;
        case "tipoProducto":
          endpoint = "/RegistroInternacional/maestras/tipos-producto";
          break;
        case "claseUso":
          endpoint = "/RegistroInternacional/maestras/clases-uso";
          break;
        case "bandaTox":
          endpoint = "/RegistroInternacional/maestras/bandas-toxicologicas";
          break;
        case "formulacion":
          endpoint = "/RegistroInternacional/maestras/formulaciones";
          break;
        case "cultivo":
          endpoint = "/RegistroInternacional/maestras/cultivos";
          break;
        case "plaga":
          endpoint = "/RegistroInternacional/maestras/plagas";
          break;
        case "tipoRegistroMarca":
          endpoint = "/RegistroInternacional/maestras/tipos-registro-marca";
          break;
        case "claseRegistroMarca":
          endpoint = "/RegistroInternacional/maestras/clases-registro-marca";
          break;
        case "empresa":
          endpoint = "/RegistroInternacional/maestras/empresas";
          break;
        case "listaAvance":
          endpoint = "/RegistroInternacional/maestras/lista-avances";
          break;
        default:
          console.error("Unknown master data type:", type);
          return null;
      }

      const headers: any = {};
      const selectedCompany = sessionStorage.getItem("selected_company");
      if (selectedCompany) {
        try {
          const companyObj = JSON.parse(selectedCompany);
          if (companyObj?.id) {
            headers["IdEmpresa"] = companyObj.id;
          }
        } catch (e) {
          console.warn("Error parseando selected_company:", e);
        }
      }
      const response = await apiService.post<{ id: number }>(endpoint, data, headers);

      if (response.success) {
        const newItem = { id: response.data?.id, nombre: name, ...additionalData };

        if (typeof fetchMasterData === 'function') {
          await fetchMasterData();
        }
        
        const { insertarLog } = await import('../../../utils/log');
        await insertarLog({
          accion: 'Alta maestro',
          descripcion: `Se agregó ${type} con nombre "${name}" y ID ${response.data?.id}`,
          ruta: window.location.pathname,
        });
        toast.success("¡Agregado exitosamente!");
        return newItem;
      } else {
        console.error("Error adding new item:", response.error);
        toast.error("No se pudo agregar el elemento. Intenta nuevamente.");
        return null;
      }
    } catch (error) {
      console.error("Error adding new item:", error);
      toast.error("Error de red o servidor. No se pudo agregar el elemento.");
      return null;
    }
  };

  const showAddNewDialog = (type: string, name: string) => {
    setNewItemType(type)
    setNewItemName(name)
    setNewItemData({})
    setOpenAddNewDialog(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  type NestedObject = Record<string, unknown> | undefined

  const handleNestedChange = (parent: keyof Partial<IntProductoRegistradoEntity>, field: string, value: string) => {
    setFormData((prev: Partial<IntProductoRegistradoEntity>) => {
      const nestedObj = prev[parent] as NestedObject
      if (Array.isArray(nestedObj)) {
        return prev
      }
      return {
        ...prev,
        [parent]: {
          ...(nestedObj || {}),
          [field]: value,
        },
      }
    })
  }

  const handleIngredienteInputChange = (field: string, value: string) => {
    setNuevoIngrediente((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddIngrediente = () => {
    setIngredientes([...ingredientes, { ...nuevoIngrediente }])
    setNuevoIngrediente({ nombre: "", concentracion: "", porcentaje: "" })
  }

  const handleRemoveIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index))
  }

  const handleUsoInputChange = (field: string, value: string | number) => {
    setNuevoUso((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddUso = () => {
    const newUso = {
      ...nuevoUso,
      plagas: [],
    }
    setUsos((prevUsos) => [...prevUsos, newUso])
    setNuevoUso({ cultivoNombre: "", numeroResolucion: "" })

    setPlagasUso((prev) => ({
      ...prev,
      [usos.length]: [],
    }))
  }

  const handleRemoveUso = (index: number) => {
    setUsos(usos.filter((_, i) => i !== index))
    const newPlagas = { ...plagasUso }
    delete newPlagas[index]
    setPlagasUso(newPlagas)
  }

  const handlePlagaInputChange = (field: string, value: string | number) => {
    setNuevaPlaga((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddPlaga = () => {
    if (usoSeleccionado !== null) {
      const currentPlagas = plagasUso[usoSeleccionado] || []
      const updatedPlagas = {
        ...plagasUso,
        [usoSeleccionado]: [...currentPlagas, { ...nuevaPlaga }],
      }
      setPlagasUso(updatedPlagas)

      const updatedUsos = [...usos]
      updatedUsos[usoSeleccionado].plagas = updatedPlagas[usoSeleccionado]
      setUsos(updatedUsos)

      setNuevaPlaga({
        nombreComun: "",
        nombreCientifico: "",
        dosis: "",
        lmr: "",
        pcDias: 0,
        prHoras: 0,
      })
    }
  }

  const handleRemovePlaga = (usoIndex: number, plagaIndex: number) => {
    const currentPlagas = [...(plagasUso[usoIndex] || [])]
    currentPlagas.splice(plagaIndex, 1)

    const updatedPlagas = {
      ...plagasUso,
      [usoIndex]: currentPlagas,
    }
    setPlagasUso(updatedPlagas)

    const updatedUsos = [...usos]
    updatedUsos[usoIndex].plagas = currentPlagas
    setUsos(updatedUsos)
  }

  // Add/remove fabricantes
  const handleAddFabricante = () => {
    setFabricantes([...fabricantes, { nombre: "", pais: "", direccion: "" }])
  }

  const handleRemoveFabricante = (index: number) => {
    if (fabricantes.length > 1) {
      setFabricantes(fabricantes.filter((_, i) => i !== index))
    }
  }

  const handleFabricanteChange = (index: number, field: string | null, value: any) => {
    const updatedFabricantes = [...fabricantes];
    if (field === null && typeof value === 'object') {
      updatedFabricantes[index] = { ...updatedFabricantes[index], ...value };
    } else {
      updatedFabricantes[index] = { ...updatedFabricantes[index], [field as string]: value };
    }
    setFabricantes(updatedFabricantes);
  }

  // Add/remove formuladores
  const handleAddFormulador = () => {
    setFormuladores([...formuladores, { nombre: "", pais: "", direccion: "" }])
  }

  const handleRemoveFormulador = (index: number) => {
    if (formuladores.length > 1) {
      setFormuladores(formuladores.filter((_, i) => i !== index))
    }
  }

  const handleFormuladorChange = (index: number, field: string | null, value: any) => {
    const updatedFormuladores = [...formuladores];
    if (field === null && typeof value === 'object') {
      updatedFormuladores[index] = { ...updatedFormuladores[index], ...value };
    } else {
      updatedFormuladores[index] = { ...updatedFormuladores[index], [field as string]: value };
    }
    setFormuladores(updatedFormuladores);
  }

  // --- NORMALIZADOR DE PAYLOAD PARA TIPOS NUMÉRICOS ---
  function normalizePayload(payload: any): any {
    const toNumber = (val: any) =>
      val === null || val === undefined || val === "" ? null : typeof val === "number" ? val : parseFloat(val);

    return {
      ...payload,
      registroProductoId: toNumber(payload.registroProductoId),
      tipoProducto: toNumber(payload.tipoProducto),
      formulacion: toNumber(payload.formulacion),
      claseUso: toNumber(payload.claseUso),
      bandaToxicologica: toNumber(payload.bandaToxicologica),
      avance: payload.avance
        ? {
          ...payload.avance,
          statusAvance: toNumber(payload.avance.statusAvance),
          valor: toNumber(payload.avance.valor),
        }
        : undefined,
      certificado: payload.certificado
        ? {
          ...payload.certificado,
          formulador: Array.isArray(payload.certificado.formulador)
            ? payload.certificado.formulador.map(toNumber)
            : [],
          fabricante: Array.isArray(payload.certificado.fabricante)
            ? payload.certificado.fabricante.map(toNumber)
            : [],
        }
        : undefined,
      ingredienteActivo: Array.isArray(payload.ingredienteActivo)
        ? payload.ingredienteActivo.map((ing: any) => ({
          ...ing,
          id: toNumber(ing.id),
        }))
        : [],
      fabricantes: Array.isArray(payload.fabricantes)
        ? payload.fabricantes.map((emp: any) => ({
          ...emp,
          id: toNumber(emp.id),
        }))
        : [],
      formuladores: Array.isArray(payload.formuladores)
        ? payload.formuladores.map((emp: any) => ({
          ...emp,
          id: toNumber(emp.id),
        }))
        : [],
      marca: payload.marca
        ? {
          ...payload.marca,
          claseRegistroMarca: toNumber(payload.marca.claseRegistroMarca),
          tipoRegistroMarca: toNumber(payload.marca.tipoRegistroMarca),
        }
        : undefined,
      usos: Array.isArray(payload.usos)
        ? payload.usos.map((uso: any) => ({
          ...uso,
          cultivoId: toNumber(uso.cultivoId),
          plagas: Array.isArray(uso.plagas)
            ? uso.plagas.map((plaga: any) => ({
              ...plaga,
              id: toNumber(plaga.id),
              dosis: toNumber(plaga.dosis),
              lmr: toNumber(plaga.lmr),
              pcDias: toNumber(plaga.pcDias),
              prHoras: toNumber(plaga.prHoras),
            }))
            : [],
        }))
        : [],
    };
  }

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Update form data
      setFormData((prev) => ({
        ...prev,
        marca: {
          ...prev.marca!,
          logo: URL.createObjectURL(file), // This is temporary for preview only
        },
      }))
    }
  }

  // Handle document uploads
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newDocumentos: DocumentoAdjunto[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        newDocumentos.push({
          id: `doc-${Date.now()}-${i}`,
          nombre: file.name,
          tipo: file.type,
          tamano: formatFileSize(file.size),
          archivo: file,
        })
      }

      setDocumentos([...documentos, ...newDocumentos])
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Preview document
  const handlePreviewDocument = (documento: DocumentoAdjunto) => {
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewDocument(reader.result as string)
    }
    reader.readAsDataURL(documento.archivo)
  }

  // Remove document
  const handleRemoveDocument = (id: string) => {
    setDocumentos(documentos.filter((doc) => doc.id !== id))
    if (previewDocument) {
      setPreviewDocument(null)
    }
  }


  //     

  //     // Reset form after successful submission
  //     setFormData({
  //       tipoProducto: "",
  //       producto: "",
  //       formulacion: "",
  //       claseUso: "",
  //       bandaToxicologica: "",
  //       presentacionRegistrada: "",
  //       tipoEnvase: "",
  //       materialesEnvase: "",
  //       descripcion: "",
  //       dictamenTecnico: "",
  //       estabilidadProducto: "",
  //       ingredienteActivo: [],
  //       avance: {
  //         numeroExpediente: "",
  //         presentacionExpediente: "",
  //         terminoRegistro: "",
  //         comentario: "",
  //         statusAvance: "",
  //         valor: "",
  //       },
  //       certificado: {
  //         numeroCertificado: "",
  //         fechaRegistro: "",
  //         fechaActualizacion: "",
  //         vigenciaRegistro: "",
  //         formulador: [],
  //         fabricante: [],
  //       },
  //       fabricantes: [],
  //       formuladores: [],
  //       marca: {
  //         marcaRegistrada: "",
  //         numeroRegistro: "",
  //         claseRegistroMarca: "",
  //         tipoRegistroMarca: "",
  //         fechaRegistro: "",
  //         vigencia: "",
  //         logo: "",
  //       },
  //       usos: [],
  //     })
  //     setIngredientes([])
  //     setFabricantes([])
  //     setFormuladores([])
  //     setUsos([])
  //     setPlagasUso({})
  //     setCurrentStep(1)
  //     setSubmitting(false)
  //   } catch (error) {
  //     console.error("Error registering product:", error)
  //     
  //   }
  // }

  // Navigation functions
  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <ClipboardList size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Información General del Producto</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Producto</label>
                <ComboboxWithAddNew
                  data={((tiposProducto || []).map((f) => ({ id: f.tipoProductoId, nombre: f.nombre })))}
                  value={formData.tipoProducto || ""}
                  onChange={(value) => handleInputChange("tipoProducto", value.toString())}
                  placeholder="Selecciona tipo de producto"
                  label="tipo de producto"
                  onAddNew={(name) => showAddNewDialog("tipoProducto", name)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Comercial</label>
                <Input
                  value={formData.producto || ""}
                  onChange={(e) => handleInputChange("producto", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Formulación</label>
                <ComboboxWithAddNew
                  data={(formulaciones || []).map((f) => ({ id: f.formulacionId, nombre: `${f.codigo} - ${f.descripcion}` }))}
                  value={formData.formulacion || ""}
                  onChange={(value) => handleInputChange("formulacion", value.toString())}
                  placeholder="Selecciona formulación"
                  label="formulación"
                  onAddNew={(name) => {
                    // Extract code and description if provided in format "CODE - Description"
                    const match = name.match(/^([A-Z0-9]+)\s*-\s*(.+)$/i)
                    if (match) {
                      handleAddNewItem("formulacion", name, { codigo: match[1], descripcion: match[2] })
                    } else {
                      showAddNewDialog("formulacion", name)
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Clase de Uso</label>
                <ComboboxWithAddNew
                  data={((clasesUso || []).map((f) => ({ id: f.claseUsoId, nombre: f.nombre })))}
                  value={formData.claseUso || ""}
                  onChange={(value) => handleInputChange("claseUso", value.toString())}
                  placeholder="Selecciona clase de uso"
                  label="clase de uso"
                  onAddNew={(name) => showAddNewDialog("claseUso", name)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banda Toxicológica</label>
                <ComboboxWithAddNew
                  data={(bandasTox || []).map((b) => ({ id: b.bandaToxId, nombre: b.descripcion + " - " + b.color}))}
                  value={formData.bandaToxicologica || ""}
                  onChange={(value) => handleInputChange("bandaToxicologica", value.toString())}
                  placeholder="Selecciona banda toxicológica"
                  label="banda toxicológica"
                  onAddNew={(name) => showAddNewDialog("bandaTox", name)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Presentación Registrada</label>
                <Input
                  value={formData.presentacionRegistrada || ""}
                  onChange={(e) => handleInputChange("presentacionRegistrada", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Envase</label>
                <Input
                  value={formData.tipoEnvase || ""}
                  onChange={(e) => handleInputChange("tipoEnvase", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Materiales del Envase</label>
              <Input
                value={formData.materialesEnvase || ""}
                onChange={(e) => handleInputChange("materialesEnvase", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  value={formData.descripcion || ""}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dictamen Técnico</label>
                <Textarea
                  value={formData.dictamenTecnico || ""}
                  onChange={(e) => handleInputChange("dictamenTecnico", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estabilidad del Producto</label>
              <Textarea
                value={formData.estabilidadProducto || ""}
                onChange={(e) => handleInputChange("estabilidadProducto", e.target.value)}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <Leaf size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Ingredientes Activos y Composición</h2>
            </div>

            {/* Input form for new ingredients */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <ComboboxWithAddNew
                    data={(ingredientesActivos || []).map(c => ({ id: c.ingredienteActivoId, nombre: c.nombre }))}
                    value={nuevoIngrediente.id}
                    onChange={(selectedId) => {
                      const ingredienteActivo = ingredientesActivos.find(c => c.ingredienteActivoId === Number(selectedId));
                      setNuevoIngrediente((prev) => ({
                        ...prev,
                        id: Number(selectedId),
                        nombre: ingredienteActivo ? ingredienteActivo.nombre : "",
                      }));
                    }}
                    placeholder="Selecciona ingrediente activo"
                    label="ingrediente activo"
                    onAddNew={(name) => showAddNewDialog("ingredienteActivo", name)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Concentración</label>
                  <Input
                    value={nuevoIngrediente.concentracion}
                    onChange={(e) => handleIngredienteInputChange("concentracion", e.target.value)}
                    placeholder="Ingrese concentración"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Porcentaje (%)</label>
                  <Input
                    value={nuevoIngrediente.porcentaje}
                    onChange={(e) => handleIngredienteInputChange("porcentaje", e.target.value)}
                    placeholder="Ingrese porcentaje (%)"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAddIngrediente}
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Table of added ingredients */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Items agregados</h3>

              {ingredientes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow >
                      <TableHead className="text-center">Nombre</TableHead>
                      <TableHead className="text-center">Concentración</TableHead>
                      <TableHead className="text-center">Porcentaje (%)</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredientes.map((ingrediente, index) => (
                      <TableRow key={index} className="text-center">
                        <TableCell>{ingrediente.nombre}</TableCell>
                        <TableCell>{ingrediente.concentracion}</TableCell>
                        <TableCell>{ingrediente.porcentaje}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngrediente(index)}
                            type="button"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">No hay ingredientes agregados</div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Estado y Avance del Registro</h2>
            </div>
            <p className="text-gray-500 mb-6">Complete los campos para continuar con el registro</p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Información de Avance</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Expediente</label>
                  <Input
                    value={formData.avance?.numeroExpediente || ""}
                    onChange={(e) => handleNestedChange("avance", "numeroExpediente", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Presentación Expediente</label>
                  <Input
                    type="date"
                    value={formData.avance?.presentacionExpediente || ""}
                    onChange={(e) => handleNestedChange("avance", "presentacionExpediente", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Término Registro</label>
                  <Input
                    type="date"
                    value={formData.avance?.terminoRegistro || ""}
                    onChange={(e) => handleNestedChange("avance", "terminoRegistro", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status Avance</label>
                  <ComboboxWithAddNew
                    data={((listaAvances || []).map((la) => ({ id: la.listaAvanceId, nombre: la.valor + "%" + " - " + la.nombre })))}
                    value={formData.avance?.statusAvance || ""}
                    onChange={(value) => {
                      handleNestedChange("avance", "statusAvance", value.toString());
                      const selected = (listaAvances || []).find(
                        (item) => item.listaAvanceId?.toString() === value.toString()
                      );
                      handleNestedChange("avance", "valor", selected ? selected.valor.toString() : "");
                    }}
                    placeholder="Selecciona status"
                    label="status de avance"
                    onAddNew={(name) => showAddNewDialog("listaAvance", name)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Comentario</label>
                <Textarea
                  value={formData.avance?.comentario || ""}
                  onChange={(e) => handleNestedChange("avance", "comentario", e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Valor</label>
                <Input
                  value={(() => {
                    const selected = (listaAvances || []).find(
                      (item) => item.listaAvanceId?.toString() === formData.avance?.statusAvance?.toString()
                    );
                    return selected ? `${selected.valor}%` : '';
                  })()}
                  readOnly
                  tabIndex={-1}
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Información de Certificado</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Certificado</label>
                  <Input
                    value={formData.certificado?.numeroCertificado || ""}
                    onChange={(e) => handleNestedChange("certificado", "numeroCertificado", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Registro</label>
                  <Input
                    type="date"
                    value={formData.certificado?.fechaRegistro || ""}
                    onChange={(e) => handleNestedChange("certificado", "fechaRegistro", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Actualización</label>
                  <Input
                    type="date"
                    value={formData.certificado?.fechaActualizacion || ""}
                    onChange={(e) => handleNestedChange("certificado", "fechaActualizacion", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vigencia de Registro</label>
                  <div className="flex items-center gap-2">
                    {(formData.certificado?.vigenciaRegistro || "").toLowerCase() === "indefinido" ? (
                      <Input
                        type="text"
                        value="INDEFINIDO"
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    ) : (
                      <Input
                        type="date"
                        value={formData.certificado?.vigenciaRegistro || ""}
                        onChange={(e) => handleNestedChange("certificado", "vigenciaRegistro", e.target.value)}
                        className=""
                      />
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(formData.certificado?.vigenciaRegistro || "").toLowerCase() === 'indefinido'}
                        onChange={(e) => handleNestedChange("certificado", "vigenciaRegistro", e.target.checked ? 'Indefinido' : '')}
                        className="accent-green-600"
                      />
                      Indefinido
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Aplicaciones y Usos Autorizados</h2>
            </div>

            {/* Input form for new usos - modificado para ocupar todo el ancho */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 w-full">
              <h3 className="text-lg font-medium mb-4">Agregar Cultivo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Nombre del Cultivo</label>
                  <ComboboxWithAddNew
                    data={((cultivos || []).map(c => ({ id: c.cultivoId, nombre: c.nombre })))}
                    value={nuevoUso.cultivoId}
                    onChange={(selectedId) => {
                      const cultivo = cultivos.find(c => c.cultivoId === Number(selectedId));
                      setNuevoUso((prev) => ({
                        ...prev,
                        cultivoId: Number(selectedId),
                        cultivoNombre: cultivo ? cultivo.nombre : "",
                      }));
                    }}
                    placeholder="Selecciona cultivo"
                    label="cultivo"
                    onAddNew={(name) => showAddNewDialog("cultivo", name)}
                  />
                </div>
                <div className="w-full relative">
                  <label className="block text-sm font-medium mb-1">Número de Resolución</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={nuevoUso.numeroResolucion}
                      onChange={(e) => handleUsoInputChange("numeroResolucion", e.target.value)}
                      placeholder="Ingrese número de resolución"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddUso}
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white min-h-[40px] min-w-[40px]"
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table of added usos - modificado para ocupar todo el ancho */}
            <div className="bg-green-50 p-4 rounded-lg w-full">
              <h3 className="text-lg font-medium mb-4">Cultivos agregados</h3>

              {usos.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre del Cultivo</TableHead>
                        <TableHead>Número de Resolución</TableHead>
                        <TableHead>Plagas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usos.map((uso, index) => (
                        <TableRow key={index}>
                          <TableCell>{uso.cultivoNombre}</TableCell>
                          <TableCell>{uso.numeroResolucion}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(plagasUso[index]?.length || 0) > 0 ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  {plagasUso[index]?.length || 0} plagas
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                  Sin plagas
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedPlagas(plagasUso[index] || [])
                                  setOpenPlagasDialog(true)
                                }}
                                type="button"
                                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setUsoSeleccionado(index)}
                                type="button"
                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveUso(index)}
                                type="button"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-md border border-gray-200 w-full">
                  No hay cultivos agregados
                </div>
              )}
            </div>

            {/* Plagas form for selected uso - modificado para ocupar todo el ancho */}
            {usoSeleccionado !== null && (
              <Card className="mt-6 w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">{usos[usoSeleccionado]?.cultivoNombre}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUsoSeleccionado(null)}
                    type="button"
                    className="h-8 w-8 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre Común</label>
                      <div className="relative">
                        <ComboboxWithAddNew
                          data={(plagas || []).map(p => ({ id: p.plagaId, nombre: p.nombre + " - " + p.nombreCientifico }))}
                          value={nuevaPlaga.id}
                          onChange={(value) => {
                            const stringValue = value.toString();
                            const plaga = plagas.find((e) => e.plagaId?.toString() === stringValue);
                            if (plaga) {
                              setNuevaPlaga((prev) => ({
                                ...prev,
                                id: plaga.plagaId,
                                nombreComun: plaga.nombre,
                                nombreCientifico: plaga.nombreCientifico ?? "",
                              }));
                            } else {
                              setNuevaPlaga((prev) => ({
                                ...prev,
                                id: undefined,
                                nombreComun: "",
                                nombreCientifico: "",
                              }));
                            }
                          }}
                          placeholder="Selecciona plaga"
                          label="plaga"
                          onAddNew={(name) => showAddNewDialog("plaga", name)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre Científico</label>
                      <Input
                        value={nuevaPlaga.nombreCientifico}
                        onChange={(e) => handlePlagaInputChange("nombreCientifico", e.target.value)}
                        placeholder="Ingrese nombre científico"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Dosis</label>
                      <Input
                        value={nuevaPlaga.dosis}
                        onChange={(e) => handlePlagaInputChange("dosis", e.target.value)}
                        placeholder="Ingrese dosis"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Unidades: gr/L o ml/L</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">LMR</label>
                      <Input
                        value={nuevaPlaga.lmr}
                        onChange={(e) => handlePlagaInputChange("lmr", e.target.value)}
                        placeholder="Ingrese LMR"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Límite Mínimo de Residuo</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">PC (Días)</label>
                      <Input
                        type="number"
                        value={nuevaPlaga.pcDias}
                        onChange={(e) => handlePlagaInputChange("pcDias", Number.parseInt(e.target.value) || 0)}
                        placeholder="Ingrese PC en días"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Período de Carencia</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">PR (Horas)</label>
                      <Input
                        type="number"
                        value={nuevaPlaga.prHoras}
                        onChange={(e) => handlePlagaInputChange("prHoras", Number.parseInt(e.target.value) || 0)}
                        placeholder="Ingrese PR en horas"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Período de Reingreso</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddPlaga}
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Plaga
                    </Button>
                  </div>

                  {(plagasUso[usoSeleccionado]?.length || 0) > 0 && (
                    <div className="mt-4 w-full">
                      <h4 className="text-md font-medium mb-2">Plagas agregadas</h4>
                      <div className="rounded-md border w-full">
                        <Table className="w-full">
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead className="w-1/4">Nombre Común</TableHead>
                              <TableHead className="w-1/4">Nombre Científico</TableHead>
                              <TableHead className="w-1/4">Dosis</TableHead>
                              <TableHead className="w-1/4 text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(plagasUso[usoSeleccionado] || []).map((plaga, plagaIndex) => (
                              <TableRow key={plagaIndex} className={plagaIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <TableCell>{plaga.nombreComun}</TableCell>
                                <TableCell>{plaga.nombreCientifico}</TableCell>
                                <TableCell>{plaga.dosis}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemovePlaga(usoSeleccionado, plagaIndex)}
                                    type="button"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 5:
        //console.log("Empresas para combobox:", empresas);
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <Factory size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Datos del Fabricante</h2>
            </div>

            {fabricantes.map((fabricante, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-lg font-semibold">Fabricante {index + 1}</h3>
                  {fabricantes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFabricante(index)}
                      type="button"
                      className="h-8 w-8 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre</label>
                      <div className="relative">
                        <ComboboxWithAddNew
                          data={empresas}
                          value={fabricante.id ? fabricante.id.toString() : ""}
                          onChange={(value) => {
                            const empresa = empresas.find(e => e.id.toString() === value.toString());
                            if (empresa) {
                              handleFabricanteChange(index, null, { ...empresa });
                            } else {
                              handleFabricanteChange(index, null, {
                                id: "",
                                nombre: value.toString(),
                                pais: "",
                                direccion: ""
                              });
                            }
                          }}
                          placeholder="Selecciona empresa"
                          label="empresa"
                          onAddNew={(name) => showAddNewDialog("empresa", name)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">País</label>
                      <Input
                        value={fabricante.pais || ""}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="País"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dirección</label>
                      <Input
                        value={fabricante.direccion || ""}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="Dirección"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button
                onClick={handleAddFabricante}
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar Fabricante
              </Button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <Building size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Datos del Formulador</h2>
            </div>

            {formuladores.map((formulador, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-lg font-semibold">Fabricante {index + 1}</h3>
                  {formuladores.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFormulador(index)}
                      type="button"
                      className="h-8 w-8 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre</label>
                      <div className="relative">
                        <ComboboxWithAddNew
                          data={empresas}
                          value={formulador.id ? formulador.id.toString() : ""}
                          onChange={(value) => {
                            const empresa = empresas.find(e => e.id.toString() === value.toString());
                            if (empresa) {
                              handleFormuladorChange(index, null, { ...empresa });
                            } else {
                              handleFormuladorChange(index, null, {
                                id: "",
                                nombre: value.toString(),
                                pais: "",
                                direccion: ""
                              });
                            }
                          }}
                          placeholder="Selecciona empresa"
                          label="empresa"
                          onAddNew={(name) => showAddNewDialog("empresa", name)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">País</label>
                      <Input
                        value={formulador.pais || ""}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="País"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dirección</label>
                      <Input
                        value={formulador.direccion || ""}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="Dirección"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAddFormulador}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar Formulador
              </Button>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <Bookmark size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Información de Marca y Registro Comercial</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Marca Registrada</label>
                <Input
                  value={formData.marca?.marcaRegistrada || ""}
                  onChange={(e) => handleNestedChange("marca", "marcaRegistrada", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número de Registro</label>
                <Input
                  value={formData.marca?.numeroRegistro || ""}
                  onChange={(e) => handleNestedChange("marca", "numeroRegistro", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Clase de Registro de Marca</label>
                <ComboboxWithAddNew
                  data={((clasesRegistroMarca || []).map(crm => ({ id: crm.claseRegistroMarcaId, nombre: crm.nombre })))}
                  value={formData.marca?.claseRegistroMarca || ""}
                  onChange={(value) => handleNestedChange("marca", "claseRegistroMarca", value.toString())}
                  placeholder="Selecciona clase de registro"
                  label="clase de registro"
                  onAddNew={(name) => showAddNewDialog("claseRegistroMarca", name)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Registro de Marca</label>
                <ComboboxWithAddNew
                  data={((tiposRegistroMarca || []).map(trm => ({ id: trm.tipoRegistroMarcaId, nombre: trm.nombre })))}
                  value={formData.marca?.tipoRegistroMarca || ""}
                  onChange={(value) => handleNestedChange("marca", "tipoRegistroMarca", value.toString())}
                  placeholder="Selecciona tipo de registro"
                  label="tipo de registro"
                  onAddNew={(name) => showAddNewDialog("tipoRegistroMarca", name)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Registro</label>
                <Input
                  type="date"
                  value={formData.marca?.fechaRegistro || ""}
                  onChange={(e) => handleNestedChange("marca", "fechaRegistro", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vigencia</label>
                <Input
                  value={formData.marca?.vigencia || ""}
                  onChange={(e) => handleNestedChange("marca", "vigencia", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo</label>
              <div className="flex items-center gap-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Haga clic para cargar o arrastrar y soltar</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo Preview"
                      className="h-24 w-auto rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                      onClick={() => {
                        setLogoPreview(null)
                        setLogoFile(null)
                        setFormData((prev) => ({
                          ...prev,
                          marca: {
                            ...prev.marca!,
                            logo: "",
                          },
                        }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-2 rounded-md text-white">
                <FileCheck size={24} />
              </div>
              <h2 className="text-2xl font-semibold">Documentación y Archivos Adjuntos</h2>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => multipleFileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="text-lg text-gray-500 mt-4">Haga clic para cargar o arrastrar y soltar</p>
              <p className="text-sm text-gray-400 mt-2">Puede seleccionar múltiples archivos</p>
              <input
                type="file"
                ref={multipleFileInputRef}
                className="hidden"
                multiple
                onChange={handleDocumentUpload}
              />
            </div>

            {documentos.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Documentos cargados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentos.map((doc) => (
                    <Card key={doc.id} className="p-4 flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {doc.tipo} • {doc.tamano}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreviewDocument(doc)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Responsive Steps Navigation */}
      <nav className="block md:hidden w-full bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2 px-2 py-3">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={cn(
                "flex flex-col items-center min-w-[80px] px-2 py-1 rounded-md text-xs transition-colors",
                currentStep === step.id
                  ? "bg-green-100 text-green-800 font-semibold border border-green-200"
                  : "text-gray-600 hover:bg-gray-50 border border-transparent",
              )}
            >
              <span className={cn(
                "mb-1 flex h-7 w-7 items-center justify-center rounded-full",
                currentStep === step.id ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500",
              )}>
                <step.icon className="h-4 w-4" />
              </span>
              {step.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </nav>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden items-start">
        {/* Sidebar Steps - Desktop only */}
        <aside className="hidden md:block w-72 bg-white border-r border-gray-200 flex-shrink-0 h-[640px] rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Pasos</h2>
            <nav className="space-y-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={cn(
                    "flex items-center w-full p-3 rounded-lg text-left transition-colors",
                    currentStep === step.id
                      ? "bg-green-100 text-green-800 font-medium border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      currentStep === step.id ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500",
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm leading-tight">{step.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-2 md:p-6 ">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8 w-full mx-auto mt-0 md:pt-6">
              <form onSubmit={handleSubmit} className="h-full">
                {renderStepContent()}
                {/* Botones de navegación al final, subidos y sin scroll extra */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 mt-8 mb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="w-full md:w-auto px-6 py-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <div className="flex items-center justify-center text-center w-full md:w-auto">
                    <span className="text-sm text-gray-500">
                      Paso {currentStep} de {steps.length}
                    </span>
                  </div>
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                    >
                      Siguiente
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                          {id ? 'Actualizando...' : 'Guardando...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {id ? 'Actualizar' : 'Guardar Registro'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={openPlagasDialog} onOpenChange={setOpenPlagasDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Plagas Registradas</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedPlagas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Común</TableHead>
                    <TableHead>Nombre Científico</TableHead>
                    <TableHead>Dosis</TableHead>
                    <TableHead>LMR</TableHead>
                    <TableHead>PC (Días)</TableHead>
                    <TableHead>PR (Horas)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPlagas.map((plaga, index) => (
                    <TableRow key={index}>
                      <TableCell>{plaga.nombreComun}</TableCell>
                      <TableCell>{plaga.nombreCientifico}</TableCell>
                      <TableCell>{plaga.dosis}</TableCell>
                      <TableCell>{plaga.lmr}</TableCell>
                      <TableCell>{plaga.pcDias}</TableCell>
                      <TableCell>{plaga.prHoras}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">No hay plagas registradas</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPlagasDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding new item with additional fields */}
      {openAddNewDialog && (
        <Dialog open={openAddNewDialog} onOpenChange={setOpenAddNewDialog}>
          <DialogContent
            className="rounded-2xl shadow-2xl bg-gradient-to-br from-green-50 via-white to-gray-100 border-0 p-0 animate-fade-in"
            style={{ minWidth: 380, maxWidth: 440 }}
          >
            <div className="px-8 pt-8 pb-2 flex flex-col items-center w-full">
              {/* Icono grande y colorido según tipo */}
              <div className="mb-2">
                {(() => {
                  switch (newItemType) {
                    case "bandaTox":
                      return <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 shadow-lg"><span className="text-3xl">🧪</span></span>;
                    case "formulacion":
                      return <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-400 shadow-lg"><span className="text-3xl">⚗️</span></span>;
                    case "empresa":
                      return <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-yellow-300 shadow-lg"><span className="text-3xl">🏢</span></span>;
                    case "plaga":
                      return <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-pink-400 shadow-lg"><span className="text-3xl">🐛</span></span>;
                    case "listaAvance":
                      return <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-blue-400 shadow-lg"><span className="text-3xl">📈</span></span>;
                    default:
                      return <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-200 shadow-lg"><span className="text-3xl">➕</span></span>;
                  }
                })()}
              </div>
              <DialogHeader className="w-full items-center">
                <DialogTitle className="text-center text-2xl font-bold tracking-tight text-gray-800 mb-1">
                  Agregar nuevo {newItemType}
                </DialogTitle>
                <span className="text-gray-500 text-sm font-normal text-center block mb-2">
                  Completa los campos requeridos para crear un nuevo registro.
                </span>
              </DialogHeader>
              <div className="w-full flex flex-col gap-4 mt-2 mb-1">
                {/* Campo nombre (siempre requerido) */}
                <Input
                  placeholder="Nombre"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all shadow-sm bg-white"
                />
                {/* Campos dinámicos según tipo */}
                {(() => {
                  switch (newItemType) {
                    case "bandaTox":
                      return (
                        <>
                          <Input
                            placeholder="Color"
                            value={newItemData.color || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, color: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all shadow-sm bg-white"
                          />
                        </>
                      );
                    case "formulacion":
                      return (
                        <>
                          <Input
                            placeholder="Código"
                            value={newItemData.codigo || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, codigo: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all shadow-sm bg-white"
                          />
                          <Textarea
                            placeholder="Descripción"
                            value={newItemData.descripcion || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, descripcion: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all shadow-sm bg-white"
                          />
                        </>
                      );
                    case "empresa":
                      return (
                        <>
                          <Input
                            placeholder="País"
                            value={newItemData.pais || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, pais: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all shadow-sm bg-white"
                          />
                          <Input
                            placeholder="Dirección"
                            value={newItemData.direccion || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, direccion: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all shadow-sm bg-white"
                          />
                        </>
                      );
                    case "plaga":
                      return (
                        <>
                          <Input
                            placeholder="Nombre científico"
                            value={newItemData.nombreCientifico || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, nombreCientifico: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all shadow-sm bg-white"
                          />
                        </>
                      );
                    case "listaAvance":
                      return (
                        <>
                          <Input
                            placeholder="Valor (%)"
                            type="number"
                            min={0}
                            max={100}
                            value={newItemData.valor || ""}
                            onChange={(e) =>
                              setNewItemData({ ...newItemData, valor: e.target.value })
                            }
                            className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm bg-white"
                          />
                        </>
                      );
                    default:
                      // Para tipos simples: tipoProducto, claseUso, tipoRegistroMarca, claseRegistroMarca, cultivo
                      return null;
                  }
                })()}
              </div>
              <div className="w-full flex gap-3 mt-4 mb-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow-md hover:scale-[1.03] hover:from-green-600 hover:to-green-800 transition-all duration-150"
                  disabled={!newItemName.trim()}
                  onClick={async () => {
                    await handleAddNewItem(newItemType, newItemName, newItemData);
                    setOpenAddNewDialog(false);
                    setNewItemName("");
                    setNewItemData({});
                  }}
                >
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-150"
                  onClick={() => setOpenAddNewDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
