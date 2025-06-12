"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { ApiService } from "@/services/api.service";

export interface MuestraNacional {
  nro: number;
  año: number;
  empresa: string;
  formulador: string;
  origen: string;
  supplier: string;
  oc: string;
  marca: string;
  ia: string;
  presentacion: string;
  quantity: number;
  priceUsd: number;
  status: string;
  ingresoPlanta: string | null;
  kardex: string;
  destinoDeLaMuestra: string | null;
  fechaDeEnsayoCampo: string | null;
  fechaDeCulminacionDeEnsayo: string | null;
  resultadoDeCampo: string | null;
  comentarios: string | null;
}

export default function SeguimientoMuestras() {
  const [muestras, setMuestras] = useState<MuestraNacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const apiService = new ApiService();

  useEffect(() => {
    fetchMuestras();
  }, []);

  async function fetchMuestras() {
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
      const res = await apiService.post<any>(
        "/RegistroNacional/ObtenerOCS",
        headers
      );
      if (!res.success) throw new Error(res.error || "Error al obtener muestras");
      setMuestras(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(muestra: MuestraNacional) {
    alert(`Editar muestra: ${muestra.marca}`);
  }

  function handleDelete(muestra: MuestraNacional) {
    if (confirm(`¿Eliminar muestra ${muestra.marca}?`)) {
      // Implementar lógica de eliminación
    }
  }

  const filtered = muestras.filter(m =>
    m.marca.toLowerCase().includes(search.toLowerCase()) ||
    m.oc.toLowerCase().includes(search.toLowerCase()) ||
    m.status.toLowerCase().includes(search.toLowerCase()) ||
    m.origen.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfMax = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => (i + 1).toString());
    }

    if (currentPage <= halfMax) {
      return Array.from({ length: maxPagesToShow - 1 }, (_, i) => (i + 1).toString()).concat('...');
    }

    if (currentPage >= totalPages - halfMax) {
      return ['...'].concat(
        Array.from({ length: maxPagesToShow - 1 }, (_, i) => (totalPages - (maxPagesToShow - 2) + i).toString())
      );
    }

    return ['...'].concat(
      Array.from({ length: maxPagesToShow - 3 }, (_, i) => (currentPage - 1 + i).toString())
    ).concat('...');
  };

  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Seguimiento de Muestras Nacionales</h1>
        <Button className="bg-green-700 hover:bg-green-800 text-white rounded-lg shadow" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Registrar nueva muestra
        </Button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Buscar por marca, OC o estado..."
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
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-xl shadow border border-slate-100 bg-white">
            <table className="min-w-[3000px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">N°</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Acciones</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Año</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Empresa</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Formulador</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Origen</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Proveedor</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">OC</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Marca</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">IA</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Presentación</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Cantidad</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Precio USD</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Estado</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Kardex</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700">Ingreso Planta</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700">Destino</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700">Fecha Ensayo</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700">Fecha Culminación</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700">Resultado Campo</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 bg-blue-50 text-blue-700">Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center py-8 text-slate-400">
                      No hay muestras registradas.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((muestra) => (
                    <tr key={muestra.nro} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.nro}</td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(muestra)}>
                          <Pencil className="w-4 h-4 text-green-700" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(muestra)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.año}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.empresa}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.formulador}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.origen}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.supplier}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.oc}</td>
                      <td className="px-4 py-2 text-center font-medium text-slate-800">{muestra.marca}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.ia}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.presentacion}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.quantity}</td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.priceUsd}</td>
                      <td className="px-4 py-2 text-center text-slate-600">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          {muestra.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-slate-600">{muestra.kardex}</td>
                      <td className="px-4 py-2 text-center text-blue-700">{muestra.ingresoPlanta || '-'}</td>
                      <td className="px-4 py-2 text-center text-blue-700">{muestra.destinoDeLaMuestra || '-'}</td>
                      <td className="px-4 py-2 text-center text-blue-700">{muestra.fechaDeEnsayoCampo || '-'}</td>
                      <td className="px-4 py-2 text-center text-blue-700">{muestra.fechaDeCulminacionDeEnsayo || '-'}</td>
                      <td className="px-4 py-2 text-center text-blue-700">{muestra.resultadoDeCampo || '-'}</td>
                      <td className="px-4 py-2 text-center text-blue-700">{muestra.comentarios || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>Mostrar</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newPerPage = parseInt(e.target.value);
                  setItemsPerPage(newPerPage);
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="border rounded px-2 py-1"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>registros por página</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Página {currentPage} de {totalPages}</span>
            </div>
          </div>

          <Pagination>
            <PaginationContent className="flex items-center space-x-2">
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}
                  className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Primera
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <ChevronLeft className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <span className="text-gray-500">...</span>
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Number(page));
                      }}
                      className={page === String(currentPage) ? 'text-blue-600' : ''}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(totalPages);
                  }}
                  className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Última
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
