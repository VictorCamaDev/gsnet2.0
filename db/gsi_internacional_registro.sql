/* ======= 1. REGISTRO PRODUCTO ======= */
CREATE TABLE GSI_Int_RegistroProducto (
    RegistroProductoId INT PRIMARY KEY IDENTITY(1,1),
    IdTipoProducto      INT NULL REFERENCES GSI_Int_TipoProducto(TipoProductoId),
    Producto            NVARCHAR(50) NULL,
    IdIngredienteActivo INT NULL REFERENCES GSI_Int_IngredienteActivo(IngredienteActivoId),
    Concentracion       NVARCHAR(50) NULL,
    Porcentaje          NVARCHAR(20) NULL,
    Formulacion         NVARCHAR(50) NULL,                -- FK a Formulacion.Codigo
    IdClaseUso          INT NULL REFERENCES GSI_Int_ClaseUso(ClaseUsoId),
    IdBandaToxicologica INT NULL REFERENCES GSI_Int_BandaTox(BandaToxId),
    PresentacionRegistrada NVARCHAR(100) NULL,
    TipoEnvase          NVARCHAR(50) NULL,
    MaterialesEnvase    NVARCHAR(100) NULL,
    Descripcion         NVARCHAR(255) NULL,
    DictamenTecnico     NVARCHAR(255) NULL,
    EstabilidadProducto NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);
-- Unicidad de nombre mientras Estado = 1
CREATE UNIQUE INDEX UQ_RegistroProducto_Nombre
    ON GSI_Int_RegistroProducto(Producto)
    WHERE Estado = 1;

GO
/* ======= 2. REGISTRO AVANCE ======= */
CREATE TABLE GSI_Int_RegistroAvance (
    RegistroAvanceId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    IdListaAvance INT NULL REFERENCES GSI_Int_ListaAvance(ListaAvanceId),
    NumeroExpediente NVARCHAR(50) NULL,
    PresentacionExpediente DATE NULL,
    TerminoRegistro DATE NULL,
    Comentario NVARCHAR(255) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

GO
/* ======= 3. REGISTRO CERTIFICADO ======= */
CREATE TABLE GSI_Int_RegistroCertificado (
    RegistroCertificadoId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    NumeroCertificado NVARCHAR(50) NULL,
    FechaRegistro DATE NULL,
    FechaActualizacion DATE NULL,
    VigenciaRegistro NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);
CREATE UNIQUE INDEX UQ_RegistroCertificado_Numero
    ON GSI_Int_RegistroCertificado (NumeroCertificado);

GO
/* ----- Tablas puente certificado–empresa ----- */
CREATE TABLE GSI_Int_RegistroCertificadoFormulador (
    RegistroCertificadoFormuladorId INT PRIMARY KEY IDENTITY(1,1),
    RegistroCertificadoId INT NOT NULL REFERENCES GSI_Int_RegistroCertificado(RegistroCertificadoId),
    EmpresaId INT NOT NULL REFERENCES GSI_Int_Empresa(EmpresaId),
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT UQ_RC_Formulador UNIQUE (RegistroCertificadoId, EmpresaId)
);

CREATE TABLE GSI_Int_RegistroCertificadoFabricante (
    RegistroCertificadoFabricanteId INT PRIMARY KEY IDENTITY(1,1),
    RegistroCertificadoId INT NOT NULL REFERENCES GSI_Int_RegistroCertificado(RegistroCertificadoId),
    EmpresaId INT NOT NULL REFERENCES GSI_Int_Empresa(EmpresaId),
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT UQ_RC_Fabricante UNIQUE (RegistroCertificadoId, EmpresaId)
);

GO
/* ======= 4. REGISTRO USO ======= */
CREATE TABLE GSI_Int_RegistroUso (
    RegistroUsoId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CultivoId INT NOT NULL REFERENCES GSI_Int_Cultivo(CultivoId),
    PlagaId INT NOT NULL REFERENCES GSI_Int_Plaga(PlagaId),
    Dosis NVARCHAR(50) NULL,
    NumeroResolucion NVARCHAR(50) NULL,
    LMR NVARCHAR(50) NULL,
    PCDias INT NULL,
    PRHoras INT NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

GO
/* ======= 5. FABRICANTES por producto ======= */
CREATE TABLE GSI_Int_RegistroFabricante (
    RegistroFabricanteId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    EmpresaId INT NOT NULL REFERENCES GSI_Int_Empresa(EmpresaId),
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT UQ_RegistroFabricante UNIQUE (RegistroProductoId, EmpresaId)
);

GO
/* ======= 6. FORMULADORES por producto ======= */
CREATE TABLE GSI_Int_RegistroFormulador (
    RegistroFormuladorId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    EmpresaId INT NOT NULL REFERENCES GSI_Int_Empresa(EmpresaId),
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT UQ_RegistroFormulador UNIQUE (RegistroProductoId, EmpresaId)
);

GO
/* ======= 7. MARCA registrada ======= */
CREATE TABLE GSI_Int_RegistroMarca (
    RegistroMarcaId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    MarcaRegistrada NVARCHAR(100) NULL,
    NumeroRegistro NVARCHAR(50) NULL,
    ClaseRegistroMarcaId INT NULL REFERENCES GSI_Int_ClaseRegistroMarca(ClaseRegistroMarcaId),
    TipoRegistroMarcaId INT NULL REFERENCES GSI_Int_TipoRegistroMarca(TipoRegistroMarcaId),
    FechaRegistro DATE NULL,
    VigenciaRegistro DATE NULL,
    Logo VARBINARY(MAX) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

GO
/* ======= 8. DOCUMENTOS de marca ======= */
CREATE TABLE GSI_Int_RegistroMarcaDocumento (
    RegistroMarcaDocumentoId INT PRIMARY KEY IDENTITY(1,1),
    RegistroMarcaId INT NOT NULL REFERENCES GSI_Int_RegistroMarca(RegistroMarcaId),
    NombreDocumento NVARCHAR(150) NOT NULL,
    TipoArchivo NVARCHAR(50) NOT NULL,
    Ruta NVARCHAR(255) NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
);

GO
/* ======= 9. REFRESH TOKENS (autenticación) ======= */
CREATE TABLE GSI_RefreshTokens (
    Id INT IDENTITY PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    Token NVARCHAR(256) NOT NULL,
    ExpiryDate DATETIME NOT NULL
);