"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ApiService } from "@/services/api.service"

export interface ProductoInternacional {
  registroProductoId: number;
  producto: string;
  tipoProducto: string;
  claseUso: string;
  formulacion: string;
  bandaToxicologica: string;
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
  const [productos, setProductos] = useState<ProductoInternacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const apiService = new ApiService();


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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(producto: ProductoInternacional) {
    alert(`Editar producto: ${producto.producto}`);
  }

  function handleDelete(producto: ProductoInternacional) {
    if (confirm(`¿Eliminar producto ${producto.producto}?`)) {
    }
  }

  const filtered = productos.filter(p =>
    (p.producto?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.ingredienteActivo?.[0]?.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (p.claseUso?.toLowerCase() || "").includes(search.toLowerCase())
  );


  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Consulta de Productos Internacionales</h1>
        <Button className="bg-green-700 hover:bg-green-800 text-white rounded-lg shadow" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Registrar nuevo
        </Button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Buscar por nombre o país..."
          className="w-full md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <svg className="animate-spin h-8 w-8 text-green-700" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" />
            <circle className="opacity-80" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="90" strokeDashoffset="60" />
          </svg>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-slate-100 bg-white">
          <table className="min-w-[3000px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">ID</th>
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
                filtered.map((producto, index) => (
                  <tr key={producto.registroProductoId} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2 text-center text-slate-600 font-medium">{index + 1}</td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
                        <Pencil className="w-4 h-4 text-green-700" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(producto)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                    <td className="px-4 py-2 text-center font-medium text-slate-800">{producto.producto}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.tipoProducto || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.ingredienteActivo?.[0]?.nombre || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.ingredienteActivo?.[0]?.concentracion || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.ingredienteActivo?.[0]?.porcentaje || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.formulacion || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.claseUso || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.bandaToxicologica || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.presentacionRegistrada || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.estabilidadProducto || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {producto.avance?.statusAvance || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.avance?.valor || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">{producto.certificado?.numeroCertificado || "-"}</td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {producto.certificado?.fechaRegistro
                        ? new Date(producto.certificado.fechaRegistro).toLocaleDateString()
                        : "-"}
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
    </div>
  );
}
