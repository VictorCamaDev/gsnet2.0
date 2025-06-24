-- =============================================
-- Script de creación de procedimientos almacenados para catálogos
-- Incluye parámetro @Empresa para filtrado multiempresa
-- =============================================

-- IngredienteActivo
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerIngredienteActivo
AS
BEGIN
    SELECT IngredienteActivoId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_IngredienteActivo WHERE Estado = 1
END
GO

-- ClaseUso
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerClaseUso
AS
BEGIN
    SELECT ClaseUsoId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_ClaseUso WHERE Estado = 1
END
GO

-- BandaToxicologica
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerBandaToxicologica
AS
BEGIN
    SELECT BandaToxId, Color, Descripcion, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_BandaTox WHERE Estado = 1
END
GO

-- Cultivo
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerCultivo
AS
BEGIN
    SELECT CultivoId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_Cultivo WHERE Estado = 1
END
GO

-- ListaAvance
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerListaAvance
AS
BEGIN
    SELECT ListaAvanceId, TipoLista, Nombre, Valor, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_ListaAvance WHERE Estado = 1
END
GO

-- TipoRegistroMarca
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerTipoRegistroMarca
AS
BEGIN
    SELECT TipoRegistroMarcaId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_TipoRegistroMarca WHERE Estado = 1
END
GO

-- ClaseRegistroMarca
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerClaseRegistroMarca
AS
BEGIN
    SELECT ClaseRegistroMarcaId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_ClaseRegistroMarca WHERE Estado = 1
END
GO

-- Empresa (Fabricantes)
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerFabricantes
AS
BEGIN
    SELECT EmpresaId, Nombre, Direccion, Pais, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_Empresa WHERE Estado = 1
END
GO

-- Formulacion
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerFormulacion
AS
BEGIN
    SELECT FormulacionId, Codigo, Descripcion, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_Formulacion WHERE Estado = 1
END
GO

-- TipoProducto
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerTipoProducto
AS
BEGIN
    SELECT TipoProductoId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion
    FROM GSI_Int_TipoProducto WHERE Estado = 1
END
GO

-- Plaga
CREATE OR ALTER PROCEDURE GSI_SP_ObtenerPlaga
AS
BEGIN
    SELECT PlagaId, Nombre, Estado, FechaCreacion, UsuarioCreacion, FechaModificacion, UsuarioModificacion, NombreCientifico
    FROM GSI_Int_Plaga WHERE Estado = 1
END
GO