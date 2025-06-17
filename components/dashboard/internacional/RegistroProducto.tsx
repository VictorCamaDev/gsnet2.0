"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";

interface IngredienteActivo {
  nombre: string;
  concentracion: string;
  porcentaje: string;
}

interface Empresa {
  nombre: string;
  pais: string;
  direccion: string;
}

interface Plaga {
  nombreComun: string;
  nombreCientifico: string;
  dosis: string;
  lmr: string;
  pcDias: number;
  prHoras: number;
}

interface Cultivo {
  cultivoId: number;
  cultivoNombre: string;
  numeroResolucion: string;
  plagas: Plaga[];
}

export default function RegistroProducto() {
  const [formData, setFormData] = useState({
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
    avance: {
      numeroExpediente: "",
      presentacionExpediente: "",
      terminoRegistro: "",
      comentario: "",
      statusAvance: "",
      valor: ""
    },
    certificado: {
      numeroCertificado: "",
      fechaRegistro: "",
      fechaActualizacion: "",
      vigenciaRegistro: "",
      formulador: [] as Empresa[],
      fabricante: [] as Empresa[]
    },
    fabricantes: [] as Empresa[],
    formuladores: [] as Empresa[],
    marca: {
      registroMarcaId: 0,
      marcaRegistrada: "",
      numeroRegistro: "",
      claseRegistroMarca: "",
      tipoRegistroMarca: "",
      fechaRegistro: "",
      vigencia: "",
      logo: ""
    },
    usos: [] as Cultivo[]
  });

  const [ingredientes, setIngredientes] = useState<IngredienteActivo[]>([{ nombre: "", concentracion: "", porcentaje: "" }]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([{ cultivoId: 1, cultivoNombre: "", numeroResolucion: "", plagas: [] }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIngrediente = () => {
    setIngredientes(prev => [...prev, { nombre: "", concentracion: "", porcentaje: "" }]);
  };

  const handleRemoveIngrediente = (index: number) => {
    setIngredientes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCultivo = () => {
    setCultivos(prev => [...prev, { cultivoId: prev.length + 1, cultivoNombre: "", numeroResolucion: "", plagas: [] }]);
  };

  const handleRemoveCultivo = (index: number) => {
    setCultivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPlaga = (cultivoIndex: number) => {
    const newCultivos = [...cultivos];
    newCultivos[cultivoIndex].plagas.push({
      nombreComun: "",
      nombreCientifico: "",
      dosis: "",
      lmr: "",
      pcDias: 0,
      prHoras: 0
    });
    setCultivos(newCultivos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    //console.log({
      ...formData,
      ingredienteActivo: ingredientes,
      usos: cultivos
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="usos">Usos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Producto</label>
                    <Select name="tipoProducto" onValueChange={(value) => handleInputChange({ target: { name: "tipoProducto", value } } as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUIMICOS">Químicos</SelectItem>
                        <SelectItem value="BIOLOGICOS">Biológicos</SelectItem>
                        <SelectItem value="FERTILIZANTES">Fertilizantes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Producto</label>
                    <Input name="producto" onChange={handleInputChange} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Formulación</label>
                    <Input name="formulacion" onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Clase de Uso</label>
                    <Select name="claseUso" onValueChange={(value) => handleInputChange({ target: { name: "claseUso", value } } as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona clase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUNGICIDA">Fungicida</SelectItem>
                        <SelectItem value="INSECTICIDA">Insecticida</SelectItem>
                        <SelectItem value="HERBICIDA">Herbicida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredientes">
          <Card>
            <CardHeader>
              <CardTitle>Ingredientes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {ingredientes.map((ingrediente, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <Input 
                      value={ingrediente.nombre} 
                      onChange={(e) => {
                        const newIngredientes = [...ingredientes];
                        newIngredientes[index].nombre = e.target.value;
                        setIngredientes(newIngredientes);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Concentración</label>
                    <Input 
                      value={ingrediente.concentracion} 
                      onChange={(e) => {
                        const newIngredientes = [...ingredientes];
                        newIngredientes[index].concentracion = e.target.value;
                        setIngredientes(newIngredientes);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Porcentaje</label>
                    <Input 
                      value={ingrediente.porcentaje} 
                      onChange={(e) => {
                        const newIngredientes = [...ingredientes];
                        newIngredientes[index].porcentaje = e.target.value;
                        setIngredientes(newIngredientes);
                      }}
                    />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveIngrediente(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={handleAddIngrediente}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Ingrediente
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresas">
          {/* Similar structure for empresas section */}
        </TabsContent>

        <TabsContent value="usos">
          <Card>
            <CardHeader>
              <CardTitle>Usos y Cultivos</CardTitle>
            </CardHeader>
            <CardContent>
              {cultivos.map((cultivo, cultivoIndex) => (
                <div key={cultivo.cultivoId} className="mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cultivo</label>
                      <Input 
                        value={cultivo.cultivoNombre} 
                        onChange={(e) => {
                          const newCultivos = [...cultivos];
                          newCultivos[cultivoIndex].cultivoNombre = e.target.value;
                          setCultivos(newCultivos);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Resolución</label>
                      <Input 
                        value={cultivo.numeroResolucion} 
                        onChange={(e) => {
                          const newCultivos = [...cultivos];
                          newCultivos[cultivoIndex].numeroResolucion = e.target.value;
                          setCultivos(newCultivos);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {cultivo.plagas.map((plaga, plagaIndex) => (
                      <div key={plagaIndex} className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nombre Común</label>
                          <Input 
                            value={plaga.nombreComun} 
                            onChange={(e) => {
                              const newCultivos = [...cultivos];
                              newCultivos[cultivoIndex].plagas[plagaIndex].nombreComun = e.target.value;
                              setCultivos(newCultivos);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nombre Científico</label>
                          <Input 
                            value={plaga.nombreCientifico} 
                            onChange={(e) => {
                              const newCultivos = [...cultivos];
                              newCultivos[cultivoIndex].plagas[plagaIndex].nombreCientifico = e.target.value;
                              setCultivos(newCultivos);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Dosis</label>
                          <Input 
                            value={plaga.dosis} 
                            onChange={(e) => {
                              const newCultivos = [...cultivos];
                              newCultivos[cultivoIndex].plagas[plagaIndex].dosis = e.target.value;
                              setCultivos(newCultivos);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">LMR</label>
                          <Input 
                            value={plaga.lmr} 
                            onChange={(e) => {
                              const newCultivos = [...cultivos];
                              newCultivos[cultivoIndex].plagas[plagaIndex].lmr = e.target.value;
                              setCultivos(newCultivos);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={() => handleAddPlaga(cultivoIndex)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Plaga
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveCultivo(cultivoIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                onClick={handleAddCultivo}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Cultivo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white">
          Registrar Producto
        </Button>
      </div>
    </form>
  );
}
