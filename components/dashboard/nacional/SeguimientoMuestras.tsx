"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Save, XCircle } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { ApiService } from "@/services/api.service";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import { useRef } from "react";
import Swal from "sweetalert2";

function FloatingInput({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  type = "text",
  textarea = false,
}: {
  label: string;
  name?: string;
  value: any;
  onChange?: (e: React.ChangeEvent<any>) => void;
  readOnly?: boolean;
  type?: string;
  textarea?: boolean;
}) {
  const inputClass = readOnly
    ? "block w-full rounded-lg border border-gray-200 bg-gray-100 text-gray-500 px-3 py-2 text-sm shadow-sm"
    : "block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";
  return (
    <div className="w-full">
      <label className="block mb-1 text-xs font-semibold text-slate-500">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          value={value ?? ''}
          onChange={onChange}
          readOnly={readOnly}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          readOnly={readOnly}
          className={inputClass}
        />
      )}
    </div>
  );
}

function KardexInput({ value, readOnly = false }: {
  value: string;
  readOnly?: boolean;
}) {
  const inputClass = readOnly
    ? "block w-full rounded-lg border border-gray-200 bg-gray-100 text-gray-500 px-3 py-2 text-sm shadow-sm"
    : "block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";
  return (
    <div className="w-full">
      <label className="block mb-1 text-xs font-semibold text-slate-500">Kardex</label>
      <input
        type="number"
        name="kardex"
        value={value ?? ''}
        readOnly={readOnly}
        min="0"
        pattern="[0-9]*"
        inputMode="numeric"
        className={inputClass}
      />
    </div>
  );
}

function EditRegistroModal({ open, muestra, onClose, onSave }: {
  open: boolean;
  muestra: MuestraNacional | null;
  onClose: () => void;
  onSave: (fields: Partial<MuestraNacional>) => void;
}) {
  // TODOS los hooks deben ir antes de cualquier return
  const [fields, setFields] = useState<Partial<MuestraNacional> & { detalleAgente?: string }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [kardexValidation, setKardexValidation] = useState<{ status: 'idle' | 'validating' | 'valid' | 'invalid'; message?: string }>({ status: 'idle' });
  const [kardexLoading, setKardexLoading] = useState(false);
  const apiService = new ApiService();
  const kardexLastValue = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<'registros' | 'comex'>('registros');

  // Utilidad para formatear fechas a YYYY-MM-DD para los inputs type=date
  function formatDateForInput(dateStr?: string | null): string {
    if (!dateStr) return '';
    // Si ya está en formato YYYY-MM-DD, no cambia nada
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Si viene en formato dd/mm/aaaa o similar, conviértelo
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    // Si no matchea, retorna string vacío
    return '';
  }

  React.useEffect(() => {
    if (muestra) {
      setFields({
        nro: muestra.nro,
        año: muestra.año,
        empresa: muestra.empresa,
        formulador: muestra.formulador,
        origen: muestra.origen,
        supplier: muestra.supplier,
        oc: muestra.oc,
        marca: muestra.marca,
        ia: muestra.ia,
        presentacion: muestra.presentacion,
        quantity: muestra.quantity,
        autorizacion: muestra.autorizacion,
        agente: muestra.agente,
        nroGuia: muestra.nroGuia,
        priceUsd: muestra.priceUsd,
        status: muestra.status,
        ingresoPlanta: formatDateForInput(muestra.ingresoPlanta),
        kardex: muestra.kardex,
        destinoDeLaMuestra: muestra.destinoDeLaMuestra,
        fechaDeEnsayoCampo: formatDateForInput(muestra.fechaDeEnsayoCampo),
        fechaDeCulminacionDeEnsayo: formatDateForInput(muestra.fechaDeCulminacionDeEnsayo),
        resultadoDeCampo: muestra.resultadoDeCampo,
        comentarios: muestra.comentarios
      });
      setKardexValidation({ status: 'idle' });
    }
  }, [muestra]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
    if (name === 'kardex') {
      setKardexValidation({ status: 'idle' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
    setTimeout(async () => {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea guardar los cambios?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d1d5db'
      });
      if (result.isConfirmed) {
        onSave(fields);
      }
    }, 300);
  }

  if (!muestra) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-full h-[95vh] max-h-[95vh] flex flex-col sm:w-[900px] sm:max-w-[900px] sm:h-[900px] sm:max-h-[900px]">
        <div className="px-10 flex flex-col gap-1">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-blue-900 flex items-center gap-2">
              <span className="inline-block bg-blue-600 rounded-full w-4 h-4 animate-pulse"></span>
              Editar Seguimiento
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="flex gap-2 border-b mb-6">
          <button
            type="button"
            className={`px-6 py-2 font-semibold transition border-b-2 ${activeTab === 'registros' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-slate-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('registros')}
          >
            Registros
          </button>
          <button
            type="button"
            className={`px-6 py-2 font-semibold transition border-b-2 ${activeTab === 'comex' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-slate-500 hover:text-green-600'}`}
            onClick={() => setActiveTab('comex')}
          >
            Comex
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-10 pb-4">
          <form onSubmit={handleSubmit} id="edit-form" className="h-full">
            {activeTab === 'registros' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 flex-1 content-start">
                <FloatingInput label="Empresa" name="empresa" value={fields.empresa ?? ''} readOnly />
                <FloatingInput label="Formulador" name="formulador" value={fields.formulador ?? ''} onChange={handleChange} readOnly/>
                <FloatingInput label="Origen" name="origen" value={fields.origen ?? ''} onChange={handleChange} readOnly/>
                <FloatingInput label="Marca" name="marca" value={fields.marca ?? ''} onChange={handleChange} readOnly/>
                <FloatingInput label="IA" name="ia" value={fields.ia ?? ''} onChange={handleChange} readOnly/>
                <KardexInput value={fields.kardex ?? ''} readOnly />
                <FloatingInput label="Autorización Importación" name="autorizacion" value={fields.autorizacion ?? ''} onChange={handleChange}/>
                <FloatingInput label="Ingreso a Planta" name="ingresoPlanta" value={fields.ingresoPlanta ?? ''} onChange={handleChange} type="date" />
                <div className="relative w-full">
                  <label className="block mb-1 text-xs font-semibold text-slate-500">Destino de la Muestra</label>
                  <select
                    name="destinoDeLaMuestra"
                    value={fields.destinoDeLaMuestra ?? ''}
                    onChange={handleChange}
                    className="block w-full rounded-lg border  px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Investigación">Investigación</option>
                    <option value="Registros">Registros</option>
                    <option value="Ad. Proveedor">Ad. Proveedor</option>
                  </select>
                </div>
                <FloatingInput label="Fecha de Ensayo Campo" name="fechaDeEnsayoCampo" value={fields.fechaDeEnsayoCampo ?? ''} onChange={handleChange} type="date" />
                <FloatingInput label="Fecha de Culminación de Ensayo" name="fechaDeCulminacionDeEnsayo" value={fields.fechaDeCulminacionDeEnsayo ?? ''} onChange={handleChange} type="date" />
                <div className="relative w-full">
                  <label className="block mb-1 text-xs font-semibold text-slate-500">Resultado de Campo</label>
                  <select
                    name="resultadoDeCampo"
                    value={fields.resultadoDeCampo ?? ''}
                    onChange={handleChange}
                    className="block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Eficaz">Eficaz</option>
                    <option value="No eficaz">No eficaz</option>
                  </select>
                </div>
                <FloatingInput label="Comentarios" name="comentarios" value={fields.comentarios ?? ''} onChange={handleChange} />
              </div>
            )}
            {activeTab === 'comex' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 flex-1 content-start opacity-90">
                <FloatingInput label="N°" name="nro" value={fields.nro ?? ''} readOnly />
                <FloatingInput label="Año" name="año" value={fields.año ?? ''} readOnly />
                <FloatingInput label="Supplier" name="supplier" value={fields.supplier ?? ''} readOnly />
                <FloatingInput label="OC" name="oc" value={fields.oc ?? ''} readOnly />
                <FloatingInput label="Presentación" name="presentacion" value={fields.presentacion ?? ''} readOnly />
                <FloatingInput label="Cantidad" name="quantity" value={fields.quantity ?? ''} readOnly />
                <div className="relative w-full">
                  <label className="block mb-1 text-xs font-semibold text-slate-500">Agente</label>
                  <select
                    name="agente"
                    value={fields.agente ?? ''}
                    disabled
                    className="block w-full rounded-lg border bg-gray-100 text-gray-500 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Seleccione...</option>
                    <option value="DHL">DHL</option>
                    <option value="FEDEX">FEDEX</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                {fields.agente === 'Otros' && (
                  <FloatingInput label="Detalle agente" name="detalleAgente" value={fields.detalleAgente ?? ''} readOnly />
                )}
                <FloatingInput label="Nro de Guía" name="nroGuia" value={fields.nroGuia ?? ''} readOnly />
                <FloatingInput label="Precio (USD)" name="priceUsd" value={fields.priceUsd ?? ''} readOnly />
                <FloatingInput label="Estado" name="status" value={fields.status ?? ''} readOnly />
              </div>
            )}
          </form>
        </div>
        <DialogFooter className="border-t bg-white py-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 transition font-semibold"
          >
            <XCircle className="w-5 h-5" />
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-form"
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-500 transition"
          >
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
          {saveError && (
            <span className="text-xs text-red-600 mt-1 block">{saveError}</span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export interface MuestraNacional {
  nro: number | null;
  año: number | null;
  empresa: string | null;
  formulador: string | null;
  origen: string | null;
  supplier: string | null;
  oc: string | null;
  marca: string | null;
  ia: string | null;
  presentacion: string | null;
  quantity: number | null;
  autorizacion: string | null;
  agente: string | null;
  nroGuia: string | null;
  priceUsd: string | null;
  status: string | null;
  ingresoPlanta: string | null;
  kardex: string | null;
  destinoDeLaMuestra: string | null;
  fechaDeEnsayoCampo: string | null;
  fechaDeCulminacionDeEnsayo: string | null;
  resultadoDeCampo: string | null;
  comentarios: string | null;
}

export default function SeguimientoMuestras() {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [showIdBox, setShowIdBox] = useState(false);

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
        {},
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMuestra, setEditingMuestra] = useState<MuestraNacional | null>(null);

  function handleEdit(muestra: MuestraNacional) {
    setEditingMuestra(muestra);
    setEditModalOpen(true);
  }

  function handleEditModalClose() {
    setEditModalOpen(false);
    setEditingMuestra(null);
  }

  async function handleEditSave(updatedFields: Partial<MuestraNacional>) {
    if (!editingMuestra) return;
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
    const updated = { ...editingMuestra, ...updatedFields };
    updated.nroGuia = String(updated.nroGuia ?? "");
    updated.priceUsd = String(updated.priceUsd ?? "");
    try {
      const res = await apiService.post("/RegistroNacional/ActualizarMuestraNacional", updated, headers);
      if (res.success) {
        // Insertar log de auditoría solo si fue exitoso
        await apiService.post(
          '/Log/InsertarLog',
          {
            accion: 'Actualizar seguimiento de muestra',
            descripcion: `Se actualizó el seguimiento de muestra con ID ${updated.nro}`,
            ruta: window.location.pathname,
          },
          headers
        );
        setMuestras(prev => prev.map(m => m.nro === updated.nro ? updated : m));
        await Swal.fire("¡Actualizado!", "El seguimiento de muestra ha sido actualizado.", "success");
        window.location.reload();
      } else {
        await Swal.fire("Error", res.error || "No se pudo actualizar el seguimiento de la muestra.", "error");
      }
    } catch (err) {
      await Swal.fire("Error", "No se pudo actualizar el seguimiento de la muestra.", "error");
      console.error(err);
    }
    handleEditModalClose();
  }


  async function handleDelete(muestra: MuestraNacional) {
    const result = await Swal.fire({
      title: `¿Está seguro?`,
      text: `¿Desea eliminar este seguimiento? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
    if (!result.isConfirmed) return;

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
      const apiService = new ApiService();
      // El endpoint espera el id en la URL
      const res = await apiService.post(`/RegistroNacional/EliminarRegistroNacional/${muestra.nro}`, {}, headers);
      if (res.success) {
        // Insertar log de auditoría solo si fue exitoso
        await apiService.post(
          '/Log/InsertarLog',
          {
            accion: 'Eliminar seguimiento de muestra',
            descripcion: `Se eliminó el seguimiento de muestra con ID ${muestra.nro}`,
            ruta: window.location.pathname,
          },
          headers
        );
        setMuestras(prev => prev.filter(m => m.nro !== muestra.nro));
        await Swal.fire("¡Eliminado!", "El seguimiento de muestra ha sido eliminado exitosamente.", "success");
      } else {
        await Swal.fire("Error", res.error || "No se pudo eliminar el seguimiento de la muestra.", "error");
      }
    } catch (err) {
      await Swal.fire("Error", "No se pudo eliminar el seguimiento de la muestra.", "error");
      console.error(err);
    }
  }



  const filtered = muestras.filter(m =>
    m.marca?.toLowerCase().includes(search.toLowerCase()) ||
    m.oc?.toLowerCase().includes(search.toLowerCase()) ||
    m.status?.toLowerCase().includes(search.toLowerCase()) ||
    m.origen?.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Seguimiento de Muestras Nacionales</h1>
      </div>
      {/* Leyenda de áreas */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <span className="text-sm text-slate-700">Los campos están agrupados y coloreados según el área responsable:</span>
        <div className="flex gap-2 mt-1 md:mt-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200">Área Registros</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold border border-green-200">Área Comex</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Buscar por marca, OC o estado..."
          className="w-full md:w-80"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Modal de edición */}
      <EditRegistroModal
        open={editModalOpen}
        muestra={editingMuestra}
        onClose={handleEditModalClose}
        onSave={handleEditSave}
      />
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
          {/* Cuadro de ID seleccionado */}
          {showIdBox && selectedRowId !== null && (
            <div className="mb-2 px-4 py-2 rounded bg-blue-50 text-blue-900 text-sm font-semibold shadow border border-blue-300 flex items-center gap-2">
              <span>Muestra seleccionada: </span>
              <span className="font-bold">N° {selectedRowId}</span>
              <button
                className="ml-auto px-2 py-0.5 rounded text-xs bg-blue-50 hover:bg-blue-50 transition"
                onClick={() => setShowIdBox(false)}
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Tabla sólo en desktop y laptop */}
          <div className="overflow-x-auto rounded-xl shadow border border-slate-100 bg-white hidden md:block">
            <table className="min-w-[3000px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {/* Definición de áreas para cada columna */}
                  {[
                    // { label: '#', area: null },
                    { label: 'Acciones', area: null },
                    // { label: 'Empresa', area: 'registros' },
                    { label: 'N°', area: 'comex' },
                    { label: 'Año', area: 'comex' },
                    { label: 'Supplier', area: 'comex' },
                    { label: 'Formulador', area: 'registros' },
                    { label: 'Origen', area: 'registros' },
                    { label: 'Marca', area: 'registros' },
                    { label: 'IA', area: 'registros' },
                    { label: 'Kardex', area: 'registros' },
                    { label: 'OC', area: 'comex' },
                    { label: 'Presentación', area: 'comex' },
                    { label: 'Cantidad', area: 'comex' },
                    { label: 'Autorización Importación', area: 'registros' },
                    { label: 'Agente', area: 'comex' },
                    { label: 'Nro de Guía', area: 'comex' },
                    { label: 'Precio (USD)', area: 'comex' },
                    { label: 'Estado', area: 'comex' },
                    { label: 'Ingreso a Planta', area: 'registros' },
                    { label: 'Destino de la Muestra', area: 'registros' },
                    { label: 'Fecha de Ensayo Campo', area: 'registros' },
                    { label: 'Fecha de Culminación de Ensayo', area: 'registros' },
                    { label: 'Resultado de Campo', area: 'registros' },
                    { label: 'Comentarios', area: 'registros' },
                  ].map((col, idx) => (
                    <th
                      key={col.label}
                      className={`px-4 py-2 text-center text-xs font-semibold whitespace-nowrap ${col.area === 'registros'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : col.area === 'comex'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'text-slate-600'
                        }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={27} className="text-center py-8 text-slate-400">
                      No hay muestras registradas.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((muestra, idx) => (
                    <tr
                      key={muestra.nro}
                      className={selectedRowId === muestra.nro ? "bg-blue-50" : "hover:bg-blue-50 cursor-pointer"}
                      onClick={() => {
                        setSelectedRowId(muestra.nro ?? null);
                        setShowIdBox(true);
                      }}
                    >
                      {/* <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + idx + 1}</td> */}
                      <td className="px-4 py-2 flex gap-2 justify-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(muestra)}>
                          <Pencil className="w-4 h-4 text-green-700" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(muestra)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                      {/* <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.empresa}</td> */}
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.nro}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.año}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.supplier}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.formulador}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.origen}</td>
                      <td className="px-4 py-2 text-center font-medium text-slate-800 whitespace-nowrap">{muestra.marca}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.ia}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.kardex}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.oc}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.presentacion}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.quantity}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.autorizacion}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.agente}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{muestra.nroGuia}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">{"$ " + muestra.priceUsd}</td>
                      <td className="px-4 py-2 text-center text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          {muestra.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-blue-700 whitespace-nowrap">{muestra.ingresoPlanta}</td>
                      <td className="px-4 py-2 text-center text-blue-700 whitespace-nowrap">{muestra.destinoDeLaMuestra}</td>
                      <td className="px-4 py-2 text-center text-blue-700 whitespace-nowrap">{muestra.fechaDeEnsayoCampo}</td>
                      <td className="px-4 py-2 text-center text-blue-700 whitespace-nowrap">{muestra.fechaDeCulminacionDeEnsayo}</td>
                      <td className="px-4 py-2 text-center text-blue-700 whitespace-nowrap">{muestra.resultadoDeCampo}</td>
                      <td className="px-4 py-2 text-center text-blue-700 whitespace-nowrap">{muestra.comentarios}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cards sólo en móviles */}
          <div className="block md:hidden space-y-4">
            {currentItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No hay muestras registradas.</div>
            ) : (
              currentItems.map((muestra, idx) => (
                <div key={muestra.nro} className="rounded-xl shadow border border-slate-100 bg-white p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-700">{muestra.marca}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(muestra)}>
                        <Pencil className="w-4 h-4 text-green-700" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(muestra)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {/* Campos agrupados por área */}
                  <div className="flex flex-col gap-1">
                    {/* Área Registros */}
                    <div className="bg-blue-50 rounded p-2 mb-1">
                      <div className="text-xs font-semibold text-blue-800 mb-1">Área Registros</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><span className="text-sm font-semibold">Empresa:</span> <span className="text-xs">{muestra.empresa}</span></div>
                        <div><span className="text-sm font-semibold">Formulador:</span> <span className="text-xs">{muestra.formulador}</span></div>
                        <div><span className="text-sm font-semibold">Origen:</span> <span className="text-xs">{muestra.origen}</span></div>
                        <div><span className="text-sm font-semibold">Marca:</span> <span className="text-xs">{muestra.marca}</span></div>
                        <div><span className="text-sm font-semibold">IA:</span> <span className="text-xs">{muestra.ia}</span></div>
                        <div><span className="text-sm font-semibold">Kardex:</span> <span className="text-xs">{muestra.kardex}</span></div>
                        <div><span className="text-sm font-semibold">Autorización Importación:</span> <span className="text-xs">{muestra.autorizacion || '-'}</span></div>
                        <div><span className="text-sm font-semibold">Ingreso a Planta:</span> <span className="text-xs">{muestra.ingresoPlanta || '-'}</span></div>
                        <div><span className="text-sm font-semibold">Destino de la Muestra:</span> <span className="text-xs">{muestra.destinoDeLaMuestra || '-'}</span></div>
                        <div><span className="text-sm font-semibold">Fecha de Ensayo Campo:</span> <span className="text-xs">{muestra.fechaDeEnsayoCampo || '-'}</span></div>
                        <div><span className="text-sm font-semibold">Fecha de Culminación de Ensayo:</span> <span className="text-xs">{muestra.fechaDeCulminacionDeEnsayo || '-'}</span></div>
                        <div className="col-span-2"><span className="text-sm font-semibold">Resultado de Campo:</span> <span className="text-xs">{muestra.resultadoDeCampo || '-'}</span></div>
                        <div className="col-span-2"><span className="text-sm font-semibold">Comentarios:</span> <span className="text-xs">{muestra.comentarios || '-'}</span></div>
                      </div>
                    </div>
                    {/* Área Comex */}
                    <div className="bg-green-50 rounded p-2 mb-1">
                      <div className="text-xs font-semibold text-green-800 mb-1">Área Comex</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <div><span className="text-sm font-semibold">N°:</span> <span className="text-xs">{muestra.nro}</span></div>
                        <div><span className="text-sm font-semibold">Año:</span> <span className="text-xs">{muestra.año}</span></div>
                        <div><span className="text-sm font-semibold">Supplier:</span> <span className="text-xs">{muestra.supplier}</span></div>
                        <div><span className="text-sm font-semibold">OC:</span> <span className="text-xs">{muestra.oc}</span></div>
                        <div><span className="text-sm font-semibold">Presentación:</span> <span className="text-xs">{muestra.presentacion}</span></div>
                        <div><span className="text-sm font-semibold">Cantidad:</span> <span className="text-xs">{muestra.quantity}</span></div>
                        <div><span className="text-sm font-semibold">Agente:</span> -</div>
                        <div><span className="text-sm font-semibold">Nro de Guía:</span> -</div>
                        <div><span className="text-sm font-semibold">Precio (USD):</span> <span className="text-xs">{muestra.priceUsd + "$"}</span></div>
                        <div className="col-span-2"><span className="text-sm font-semibold">Estado:</span> <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">{muestra.status}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                    if (currentPage !== 1) setCurrentPage(1);
                  }}
                  className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                  tabIndex={currentPage === 1 ? -1 : 0}
                  aria-disabled={currentPage === 1}
                >
                  Primera
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                  tabIndex={currentPage === 1 ? -1 : 0}
                  aria-disabled={currentPage === 1}
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
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                  aria-disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage !== totalPages) setCurrentPage(totalPages);
                  }}
                  className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}
                  tabIndex={currentPage === totalPages ? -1 : 0}
                  aria-disabled={currentPage === totalPages}
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