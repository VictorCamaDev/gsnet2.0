-- Ingrediente Activo
SELECT * FROM GSI_Int_IngredienteActivo;
-- Clase de Uso
SELECT * FROM GSI_Int_ClaseUso;
-- Banda Toxicológica
SELECT * FROM GSI_Int_BandaTox;
-- Cultivos
SELECT * FROM GSI_Int_Cultivo;
-- Lista de Avance
SELECT * FROM GSI_Int_ListaAvance;
-- Tipo Registro Marca
SELECT * FROM GSI_Int_TipoRegistroMarca;
-- Clase Registro Marca
SELECT * FROM GSI_Int_ClaseRegistroMarca;
-- Empresas
SELECT * FROM GSI_Int_Empresa;
-- Formulación
SELECT * FROM GSI_Int_Formulacion;
-- Tipo de Producto
SELECT * FROM GSI_Int_TipoProducto;
-- Tipo de Empresa
SELECT * FROM GSI_Int_TipoEmpresa;
-- Relación Empresa-Tipo
SELECT * FROM GSI_Int_EmpresaTipo;
-- Producto
SELECT * FROM GSI_Int_Producto
-- Plaga
SELECT * FROM GSI_Int_Plaga
-- Registro Producto
SELECT * FROM GSI_Int_RegistroProducto
-- 1. Registro + Datos
SELECT
    r.RegistroProductoId,
    tp.Nombre AS TipoProducto,
    p.Nombre AS Producto,
    ia.Nombre AS IngredienteActivo,
    r.Concentracion,
    r.Porcentaje,
    f.descripcion as Formulacion,
    cu.Nombre AS ClaseUso,
    bt.descripcion AS BandaToxicologica,
    r.PresentacionRegistrada,
    r.TipoEnvase,
    r.MaterialesEnvase,
    r.Descripcion,
    r.DictamenTecnico,
    r.EstabilidadProducto,
    r.Estado,
    r.FechaCreacion,
    r.UsuarioCreacion
FROM GSI_Int_RegistroProducto r
LEFT JOIN GSI_Int_TipoProducto tp ON r.IdTipoProducto = tp.TipoProductoId
LEFT JOIN GSI_Int_Producto p ON r.IdProducto = p.ProductoId
LEFT JOIN GSI_Int_IngredienteActivo ia ON r.IdIngredienteActivo = ia.IngredienteActivoId
LEFT JOIN GSI_Int_ClaseUso cu ON r.IdClaseUso = cu.ClaseUsoId
LEFT JOIN GSI_Int_BandaTox bt ON r.IdBandaToxicologica = bt.BandaToxId
LEFT JOIN GSI_Int_Formulacion f ON f.codigo = r.formulacion;
-- 2. Avance del Registro
SELECT
    ra.RegistroProductoId,
    la.Nombre AS StatusAvance,
    la.Valor,
    ra.NumeroExpediente,
    ra.PresentacionExpediente,
    ra.TerminoRegistro,
    ra.Comentario
FROM GSI_Int_RegistroAvance ra
LEFT JOIN GSI_Int_ListaAvance la ON ra.IdListaAvance = la.ListaAvanceId;
-- 3. Certificado
SELECT
    rc.RegistroProductoId,
    rc.NumeroCertificado,
    rc.FechaRegistro,
    rc.FechaActualizacion,
    rc.VigenciaRegistro,
    ef.Nombre AS Formulador,
    ef.Pais AS PaisFormulador,
    ef2.Nombre AS Fabricante,
    ef2.Pais AS PaisFabricante
FROM GSI_Int_RegistroCertificado rc
LEFT JOIN GSI_Int_Empresa ef ON rc.IdFormulador = ef.EmpresaId
LEFT JOIN GSI_Int_Empresa ef2 ON rc.IdFabricante = ef2.EmpresaId;
-- Uso
SELECT
    ru.RegistroUsoId,
    ru.RegistroProductoId,
    c.Nombre AS Cultivo,
    p.NombreComun AS PlagaNombreComun,
    p.NombreCientifico AS PlagaNombreCientifico,
    ru.Dosis,
    ru.NumeroResolucion,
    ru.LMR,
    ru.PCDias,
    ru.PRHoras,
    ru.Estado,
    ru.FechaCreacion,
    ru.UsuarioCreacion
FROM GSI_Int_RegistroUso ru
LEFT JOIN GSI_Int_Cultivo c ON ru.CultivoId = c.CultivoId
LEFT JOIN GSI_Int_Plaga p ON ru.PlagaId = p.PlagaId;
-- Fabricantes registrados
SELECT
    rf.RegistroProductoId,
    e.Nombre AS NombreEmpresa,
    e.Pais,
    e.Direccion
FROM GSI_Int_RegistroFabricante rf
LEFT JOIN GSI_Int_Empresa e ON rf.EmpresaId = e.EmpresaId
WHERE rf.RegistroProductoId = 1;
-- Formuladores registrados
SELECT
    rf.RegistroProductoId,
    e.Nombre AS NombreEmpresa,
    e.Pais,
    e.Direccion
FROM GSI_Int_RegistroFormulador rf
LEFT JOIN GSI_Int_Empresa e ON rf.EmpresaId = e.EmpresaId
WHERE rf.RegistroProductoId = 1;
-- Marca registrada
SELECT
    rm.RegistroMarcaId,
    rm.MarcaRegistrada,
    rm.NumeroRegistro,
    crm.Nombre AS ClaseRegistroMarca,
    trm.Nombre AS TipoRegistroMarca,
    rm.FechaRegistro,
    rm.VigenciaRegistro,
    rm.Logo
FROM GSI_Int_RegistroMarca rm
LEFT JOIN GSI_Int_ClaseRegistroMarca crm ON rm.ClaseRegistroMarcaId = crm.ClaseRegistroMarcaId
LEFT JOIN GSI_Int_TipoRegistroMarca trm ON rm.TipoRegistroMarcaId = trm.TipoRegistroMarcaId
WHERE rm.RegistroProductoId = 1;
-- Documentos asociados
SELECT
    d.RegistroMarcaId,
    d.NombreDocumento,
    d.TipoArchivo,
    d.FechaCreacion
FROM GSI_Int_RegistroMarcaDocumento d
WHERE d.RegistroMarcaId = 1;