-- 1. Ingrediente Activo
CREATE TABLE GSI_Int_IngredienteActivo (
    IngredienteActivoId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 2. Clase de Uso
CREATE TABLE GSI_Int_ClaseUso (
    ClaseUsoId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 3. Banda Toxicológica
CREATE TABLE GSI_Int_BandaTox (
    BandaToxId INT PRIMARY KEY IDENTITY(1,1),
    Color NVARCHAR(20) NULL,
    Descripcion NVARCHAR(100) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 4. Cultivos
CREATE TABLE GSI_Int_Cultivo (
    CultivoId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 5. Lista de Avance
CREATE TABLE GSI_Int_ListaAvance (
    ListaAvanceId INT PRIMARY KEY IDENTITY(1,1),
    TipoLista INT NULL,
    Nombre NVARCHAR(200) NULL,
    Valor INT NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 6. Tipo Registro Marca
CREATE TABLE GSI_Int_TipoRegistroMarca (
    TipoRegistroMarcaId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 7. Clase Registro Marca
CREATE TABLE GSI_Int_ClaseRegistroMarca (
    ClaseRegistroMarcaId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 8. Empresas
CREATE TABLE GSI_Int_Empresa (
    EmpresaId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(200) NULL,
    Direccion NVARCHAR(200) NULL,
    Pais NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 9. Formulación
CREATE TABLE GSI_Int_Formulacion (
    FormulacionId INT PRIMARY KEY IDENTITY(1,1),
    Codigo NVARCHAR(10) NULL,
    Descripcion NVARCHAR(100) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 10. Tipo de Producto
CREATE TABLE GSI_Int_TipoProducto (
    TipoProductoId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NOT NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 11. Tipo de Empresa
CREATE TABLE GSI_Int_TipoEmpresa (
    TipoEmpresaId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NULL,
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 12. Empresa Tipo
CREATE TABLE GSI_Int_EmpresaTipo (
    EmpresaTipoId INT PRIMARY KEY IDENTITY(1,1),
    EmpresaId INT NULL,
    TipoEmpresaId INT NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NULL,
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_EmpresaTipo_Empresa FOREIGN KEY (EmpresaId) REFERENCES GSI_Int_Empresa(EmpresaId),
    CONSTRAINT FK_EmpresaTipo_TipoEmpresa FOREIGN KEY (TipoEmpresaId) REFERENCES GSI_Int_TipoEmpresa(TipoEmpresaId)
);

-- 13. Producto
CREATE TABLE GSI_Int_Producto (
    ProductoId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NULL,
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 14. Plaga
CREATE TABLE GSI_Int_Plaga (
    PlagaId INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NULL,
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);
-- FIN DEL SCRIPT DE TABLAS MAESTRAS INTERNACIONAL
