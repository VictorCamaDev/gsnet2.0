"use client";
import './swal2-compact.css';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Loader2, FileX2, Filter, X } from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog';

import { ApiService } from "@/services/api.service"
import Swal from "sweetalert2";

export interface ProductoInternacional {
  registroProductoId: number;
  producto: string;
  tipoProducto: string;
  claseUso: string;
  formulacion: string;
  bandaToxicologica: string;
  color: string;
  presentacionRegistrada: string;
  estabilidadProducto: string;
  ingredienteActivo: {
    nombre: string;
    concentracion: string;
    porcentaje: string;
  }[];
  avance: {
    statusAvance: string;
    valor: string;
  };
  certificado: {
    numeroCertificado: string;
    fechaRegistro: string;
    vigenciaRegistro: string;
  };
  usos: {
    cultivoId: number;
    cultivoNombre: string;
    numeroResolucion: string;
    plagas: {
      nombreComun: string;
      nombreCientifico: string;
      dosis: string;
      lmr: string;
      pcDias: number;
      prHoras: number;
    }[];
  }[];
}

export default function ConsultaInternacionalPage() {
  // ...
  const [productos, setProductos] = useState<ProductoInternacional[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const selectedProducto = selectedRowId ? productos.find(p => p.registroProductoId === selectedRowId) : null;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const apiService = new ApiService();

  const [tipoProductoFilter, setTipoProductoFilter] = useState<string>("");
  const [formulacionFilter, setFormulacionFilter] = useState<string>("");
  const [claseUsoFilter, setClaseUsoFilter] = useState<string>("");
  const [bandaToxicolFilter, setBandaToxicolFilter] = useState<string>("");
  const [avanceFilter, setAvanceFilter] = useState<string>("");

  const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

  const tipoProductoOptions = unique(productos.map(p => p.tipoProducto));
  const formulacionOptions = unique(productos.map(p => p.formulacion));
  const claseUsoOptions = unique(productos.map(p => p.claseUso));
  const bandaToxicolOptions = unique(productos.map(p => p.bandaToxicologica));


  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    setError("");
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

    try {
      const res = await apiService.get<any>(
        "/RegistroInternacional/ObtenerRegistrosInternacionales",
        headers
      );
      if (!res.success) throw new Error(res.error || "Error al obtener productos");
      setProductos(res.data);
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("404")) {
        setProductos([]);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(producto: ProductoInternacional) {
    router.push(`/dashboard/internacional/registro?id=${producto.registroProductoId}`);
  }

  async function handleDelete(producto: ProductoInternacional) {
    const result = await Swal.fire({
      title: `¿Eliminar "${producto.producto}"?`,
      text: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#222',
      width: 320,
      customClass: {
        popup: 'swal2-compact-modal',
        title: 'swal2-compact-title',
        htmlContainer: 'swal2-compact-text',
        actions: 'swal2-compact-actions',
        confirmButton: 'swal2-compact-confirm',
        cancelButton: 'swal2-compact-cancel',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    setError("");
    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });
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
    try {
      // Agregar codigousuario y loginusuario a los headers si existen
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
      const res = await apiService.post<any>(
        `/RegistroInternacional/eliminar-producto`,
        { Id: producto.registroProductoId },
        headers
      );
      if (!res.success) throw new Error(res.error || "Error al eliminar producto");

      const res2 = await apiService.post<any>(
        `/Log/InsertarLog`,
        { accion: "Eliminar registro internacional", descripcion: `Se eliminó el registro internacional con ID ${producto.registroProductoId}`, ruta: window.location.pathname },
        headers
      );

      await fetchProductos();
      Swal.close();
      await Swal.fire({
        icon: 'success',
        title: '¡Producto eliminado!',
        text: 'El producto fue eliminado correctamente.',
        showConfirmButton: false,
        timer: 1800,
        background: '#ecfdf5',
        color: '#065f46',
      });
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Error al eliminar producto");
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'Ups... Ocurrió un error',
        text: `No se pudo eliminar el producto. ${err.message || ''}`,
        confirmButtonColor: '#dc2626',
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const filtered = productos.filter(p => {
    // Filtro de búsqueda general
    const matchesSearch =
      (p.producto?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.ingredienteActivo?.[0]?.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.claseUso?.toLowerCase() || "").includes(search.toLowerCase());
    // Filtros avanzados
    const matchesTipoProducto = !tipoProductoFilter || p.tipoProducto === tipoProductoFilter;
    const matchesFormulacion = !formulacionFilter || p.formulacion === formulacionFilter;
    const matchesClaseUso = !claseUsoFilter || p.claseUso === claseUsoFilter;
    const matchesBandaToxicol = !bandaToxicolFilter || (p.color && p.color.trim().toLowerCase() === bandaToxicolFilter.trim().toLowerCase());
    const avanceVal = parseFloat(p.avance?.valor || "0");
    let matchesAvance = true;
    if (avanceFilter === "completados") matchesAvance = avanceVal === 100;
    if (avanceFilter === "pendientes") matchesAvance = avanceVal < 100;
    return matchesSearch && matchesTipoProducto && matchesFormulacion && matchesClaseUso && matchesBandaToxicol && matchesAvance;
  });


  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Consulta de Productos Internacionales</h1>
        <Button
          className="bg-green-700 hover:bg-green-800 text-white rounded-lg shadow"
          size="sm"
          disabled={navigating}
          onClick={() => {
            setNavigating(true);
            router.push("/dashboard/internacional/registro");
          }}
        >
          {navigating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {navigating ? "Redirigiendo..." : "Registrar nuevo"}
        </Button>
      </div>
      {/* Buscador y botón de filtros */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Buscar por nombre, ingrediente, o clase de uso..."
          className="w-full md:w-72"
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button
              type="button"
              className="flex gap-2 items-center bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition rounded shadow-sm px-4"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-fade-in" />
            <Dialog.Content
              className="fixed top-0 right-0 h-full w-full max-w-xs bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-2xl z-50 flex flex-col p-8 gap-4 rounded-l-3xl border-l border-slate-200 animate-[drawer-pop_0.45s_cubic-bezier(0.23,1,0.32,1)] outline-none"
              style={{ boxShadow: 'rgba(30, 41, 59, 0.20) 0px 12px 36px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <Dialog.Title asChild>
                  <span className="text-lg font-semibold text-slate-800">Filtros avanzados</span>
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    className="text-slate-400 hover:text-slate-700 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-green-700"
                    aria-label="Cerrar filtros"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </Dialog.Close>
              </div>
              {/* Chips de filtros activos */}
              {(tipoProductoFilter || formulacionFilter || claseUsoFilter || bandaToxicolFilter || avanceFilter || search) && (
                <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
                  {search && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shadow hover:bg-green-200 transition cursor-pointer">
                      <Filter className="w-3 h-3" /> "{search}"
                    </span>
                  )}
                  {tipoProductoFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow hover:bg-blue-200 transition cursor-pointer">
                      <span className="font-bold">Tipo:</span> {tipoProductoFilter}
                    </span>
                  )}
                  {formulacionFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold shadow hover:bg-purple-200 transition cursor-pointer">
                      <span className="font-bold">Formulación:</span> {formulacionFilter}
                    </span>
                  )}
                  {claseUsoFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold shadow hover:bg-orange-200 transition cursor-pointer">
                      <span className="font-bold">Uso:</span> {claseUsoFilter}
                    </span>
                  )}
                  {bandaToxicolFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold shadow hover:bg-rose-200 transition cursor-pointer">
                      <span className="font-bold">Banda:</span> {bandaToxicolFilter}
                    </span>
                  )}
                  {avanceFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold shadow hover:bg-slate-300 transition cursor-pointer">
                      <span className="font-bold">Avance:</span> {avanceFilter === 'completados' ? '100%' : '<100%'}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">Tipo Producto</label>
                  <select
                    className="border rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-green-600 transition hover:shadow focus:shadow"
                    value={tipoProductoFilter}
                    onChange={e => { setTipoProductoFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todos</option>
                    {tipoProductoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">Formulación</label>
                  <select
                    className="border rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-green-600 transition hover:shadow focus:shadow"
                    value={formulacionFilter}
                    onChange={e => { setFormulacionFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas</option>
                    {formulacionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">Clase de Uso</label>
                  <select
                    className="border rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-green-600 transition hover:shadow focus:shadow"
                    value={claseUsoFilter}
                    onChange={e => { setClaseUsoFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas</option>
                    {claseUsoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">Banda Toxicológica (Color)</label>
                  <select
                    className="border rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-green-600 transition hover:shadow focus:shadow"
                    value={bandaToxicolFilter}
                    onChange={e => { setBandaToxicolFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todas</option>
                    {(() => {
                      // Contar productos por color normalizado
                      const colorMap: Record<string, string> = {
                        rojo: "#ef4444",
                        azul: "#3b82f6",
                        verde: "#22c55e",
                        amarillo: "#fde047",
                        naranja: "#fb923c",
                        violeta: "#a78bfa",
                        negro: "#000000",
                        gris: "#64748b",
                        marrón: "#92400e",
                        blanco: "#f1f5f9"
                      };
                      const colorCounts: Record<string, { raw: string, count: number }> = {};
                      productos.forEach(p => {
                        if (p.color) {
                          const norm = p.color.trim().toLowerCase();
                          if (!colorCounts[norm]) colorCounts[norm] = { raw: p.color.trim(), count: 0 };
                          colorCounts[norm].count++;
                        }
                      });
                      // Ordenar por cantidad descendente
                      const sortedColors = Object.entries(colorCounts)
                        .sort((a, b) => b[1].count - a[1].count);
                      return sortedColors.map(([norm, { raw, count }]) => {
                        const colorCss = colorMap[norm] || raw;
                        return (
                          <option key={norm} value={raw}>
                            <span style={{ color: colorCss }}>{"\u25CF"}</span> {raw} ({count})
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-2 font-medium flex items-center gap-1">Avance</label>
                  <select
                    className="border rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-green-600 transition hover:shadow focus:shadow"
                    value={avanceFilter}
                    onChange={e => { setAvanceFilter(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Todos</option>
                    <option value="completados">Completados (100%)</option>
                    <option value="pendientes">Pendientes (&lt;100%)</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 text-slate-700 font-semibold shadow hover:from-slate-200 hover:to-slate-300 transition text-base"
                    onClick={() => {
                      setTipoProductoFilter("");
                      setFormulacionFilter("");
                      setClaseUsoFilter("");
                      setBandaToxicolFilter("");
                      setAvanceFilter("");
                      setSearch("");
                    }}
                  >
                    Limpiar filtros
                  </button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white rounded-lg shadow-lg mt-1 text-base py-2 font-bold tracking-wide"
                  >
                    Aplicar filtros
                  </Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Mensaje del producto seleccionado */}
      {selectedProducto && (
        <div className="mt-4 p-3 mb-4 rounded bg-green-50 border border-green-200 text-green-800 text-center font-semibold shadow">
          Producto seleccionado: {selectedProducto.producto}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <svg className="animate-spin h-8 w-8 text-green-700" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" />
            <circle className="opacity-80" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="90" strokeDashoffset="60" />
          </svg>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 text-slate-500 gap-4">
          <FileX2 className="w-14 h-14" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-4 border border-dashed rounded-xl">
          <FileX2 className="w-14 h-14" />
          <p className="text-lg font-medium">NO SE TIENEN PRODUCTOS REGISTRADOS</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-slate-100 bg-white">
          <table className="min-w-[3000px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Codigo de Producto</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Acciones</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Producto</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Tipo Producto</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Ingrediente Activo</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Concentración</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Porcentaje</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Formulación</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Clase de Uso</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Banda Toxicológica</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Presentación</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Estabilidad</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Estado</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Avance (%)</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Certificado</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Fecha Registro</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Vigencia</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Resolución</th>
              </tr>
            </thead>
            <tbody>


              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-8 text-slate-400">
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                paginated.map((producto, index) => (
                  <tr
                    key={producto.registroProductoId}
                    className={`hover:bg-slate-50 transition ${selectedRowId === producto.registroProductoId ? 'bg-green-50 ring-2 ring-green-300' : ''}`}
                    onClick={() => setSelectedRowId(producto.registroProductoId)}
                  >
                    <td className="px-4 py-2 text-center text-slate-600 font-medium">{producto.registroProductoId}</td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
                        <Pencil className="w-4 h-4 text-green-700" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(producto)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                    <td className="px-4 py-2 text-left font-medium text-slate-800">{producto.producto}</td>
                    <td className="px-4 py-2 text-left text-slate-600">{producto.tipoProducto || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.ingredienteActivo?.[0]?.nombre || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.ingredienteActivo?.[0]?.concentracion || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.ingredienteActivo?.[0]?.porcentaje || "-"}</td>
                    <td className="px-4 py-2 text-left text-slate-600">{producto.formulacion || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.claseUso || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {(() => {
                        const colorMap: Record<string, string> = {
                          rojo: "#ef4444",
                          azul: "#3b82f6",
                          verde: "#22c55e",
                          amarillo: "#fde047",
                          naranja: "#fb923c",
                          violeta: "#a78bfa",
                          negro: "#000000",
                          gris: "#64748b",
                          marrón: "#92400e",
                          blanco: "#f1f5f9"
                        };
                        const raw = producto.color?.trim().toLowerCase();
                        const colorCss = raw ? (colorMap[raw] || producto.color) : undefined;
                        return colorCss ? (
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-1 align-middle border border-slate-200"
                            style={{ backgroundColor: colorCss }}
                            title={producto.color}
                          />
                        ) : null;
                      })()}
                      {producto.bandaToxicologica || "-"}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.presentacionRegistrada || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.estabilidadProducto || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {producto.avance?.statusAvance || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.avance?.valor + "%" || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.certificado?.numeroCertificado || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {producto.certificado?.fechaRegistro || "-"}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.certificado?.vigenciaRegistro || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.usos?.[0]?.numeroResolucion || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Controles de paginación */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-600">Página {currentPage} de {totalPages}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}



      {navigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 mr-4 animate-spin text-green-700" />
          <span className="text-lg font-semibold text-green-800">Redirigiendo...</span>
        </div>
      )}
    </div>
  );
}
