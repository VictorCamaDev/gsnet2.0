-- 1. Registro Producto
CREATE TABLE GSI_Int_RegistroProducto (
    RegistroProductoId INT PRIMARY KEY IDENTITY(1,1),
    IdTipoProducto INT NULL,               
    IdProducto INT NULL,                    
    IdIngredienteActivo INT NULL,           
    Concentracion NVARCHAR(50) NULL,        
    Porcentaje NVARCHAR(20) NULL,           
    Formulacion NVARCHAR(50) NULL,          
    IdClaseUso INT NULL,                    
    IdBandaToxicologica INT NULL,           
    PresentacionRegistrada NVARCHAR(100) NULL,  
    TipoEnvase NVARCHAR(50) NULL,           
    MaterialesEnvase NVARCHAR(100) NULL,    
    Descripcion NVARCHAR(255) NULL,         
    DictamenTecnico NVARCHAR(255) NULL,     
    EstabilidadProducto NVARCHAR(50) NULL,  
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL
);

-- 2. Avance del Registro
CREATE TABLE GSI_Int_RegistroAvance (
    RegistroAvanceId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL,          
    IdListaAvance INT NULL,                       
    NumeroExpediente NVARCHAR(50) NULL,
    PresentacionExpediente DATE NULL,          
    TerminoRegistro DATE NULL,
    Comentario NVARCHAR(255) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_RegistroAvance_RegistroProducto FOREIGN KEY (RegistroProductoId)
        REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CONSTRAINT FK_RegistroAvance_ListaAvance FOREIGN KEY (IdListaAvance)
        REFERENCES GSI_Int_ListaAvance(ListaAvanceId)
);

-- 3. Registro de Certificado
CREATE TABLE GSI_Int_RegistroCertificado (
    RegistroCertificadoId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL,         -- FK a GSI_Int_RegistroProducto
    NumeroCertificado NVARCHAR(50) NULL,
    FechaRegistro DATE NULL,
    FechaActualizacion DATE NULL,
    VigenciaRegistro NVARCHAR(50) NULL,
    IdFormulador INT NULL,                   -- FK a GSI_Int_Empresa
    IdFabricante INT NULL,                   -- FK a GSI_Int_Empresa
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_RegistroCertificado_RegistroProducto FOREIGN KEY (RegistroProductoId)
        REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CONSTRAINT FK_RegistroCertificado_Formulador FOREIGN KEY (IdFormulador)
        REFERENCES GSI_Int_Empresa(EmpresaId),
    CONSTRAINT FK_RegistroCertificado_Fabricante FOREIGN KEY (IdFabricante)
        REFERENCES GSI_Int_Empresa(EmpresaId)
);

-- 4. Registro de Uso
CREATE TABLE GSI_Int_RegistroUso (
    RegistroUsoId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL,      -- FK a GSI_Int_RegistroProducto
    CultivoId INT NOT NULL,               -- FK a GSI_Int_Cultivo
    PlagaId INT NOT NULL,                 -- FK a GSI_Int_Plaga
    Dosis NVARCHAR(50) NULL,              -- Texto libre
    NumeroResolucion NVARCHAR(50) NULL,   -- Texto libre
    LMR NVARCHAR(50) NULL,                -- Texto libre
    PCDias INT NULL,                      -- Número libre (puede ser NULL si NA)
    PRHoras INT NULL,                     -- Número libre (puede ser NULL)
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_RegistroUso_RegistroProducto FOREIGN KEY (RegistroProductoId)
        REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CONSTRAINT FK_RegistroUso_Cultivo FOREIGN KEY (CultivoId)
        REFERENCES GSI_Int_Cultivo(CultivoId),
    CONSTRAINT FK_RegistroUso_Plaga FOREIGN KEY (PlagaId)
        REFERENCES GSI_Int_Plaga(PlagaId)
);

-- 5. Fabricantes registrados por producto
CREATE TABLE GSI_Int_RegistroFabricante (
    RegistroFabricanteId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL,      -- FK a GSI_Int_RegistroProducto
    EmpresaId INT NOT NULL,               -- FK a GSI_Int_Empresa
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_RegistroFabricante_RegistroProducto FOREIGN KEY (RegistroProductoId)
        REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CONSTRAINT FK_RegistroFabricante_Empresa FOREIGN KEY (EmpresaId)
        REFERENCES GSI_Int_Empresa(EmpresaId)
);

-- 6. Formuladores registrados por producto
CREATE TABLE GSI_Int_RegistroFormulador (
    RegistroFormuladorId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL,      -- FK a GSI_Int_RegistroProducto
    EmpresaId INT NOT NULL,               -- FK a GSI_Int_Empresa
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_RegistroFormulador_RegistroProducto FOREIGN KEY (RegistroProductoId)
        REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CONSTRAINT FK_RegistroFormulador_Empresa FOREIGN KEY (EmpresaId)
        REFERENCES GSI_Int_Empresa(EmpresaId)
);

-- 7. Marca registrada
CREATE TABLE GSI_Int_RegistroMarca (
    RegistroMarcaId INT PRIMARY KEY IDENTITY(1,1),
    RegistroProductoId INT NOT NULL,          -- FK a GSI_Int_RegistroProducto
    MarcaRegistrada NVARCHAR(100) NULL,       -- Texto libre
    NumeroRegistro NVARCHAR(50) NULL,         -- Texto libre
    ClaseRegistroMarcaId INT NULL,            -- FK a GSI_Int_ClaseRegistroMarca
    TipoRegistroMarcaId INT NULL,             -- FK a GSI_Int_TipoRegistroMarca
    FechaRegistro DATE NULL,
    VigenciaRegistro DATE NULL,
    Logo VARBINARY(MAX) NULL,                 -- Imagen/logo (almacenado en base de datos)
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioCreacion NVARCHAR(50) NULL,
    FechaModificacion DATETIME NULL,
    UsuarioModificacion NVARCHAR(50) NULL,
    CONSTRAINT FK_RegistroMarca_RegistroProducto FOREIGN KEY (RegistroProductoId)
        REFERENCES GSI_Int_RegistroProducto(RegistroProductoId),
    CONSTRAINT FK_RegistroMarca_Clase FOREIGN KEY (ClaseRegistroMarcaId)
        REFERENCES GSI_Int_ClaseRegistroMarca(ClaseRegistroMarcaId),
    CONSTRAINT FK_RegistroMarca_Tipo FOREIGN KEY (TipoRegistroMarcaId)
        REFERENCES GSI_Int_TipoRegistroMarca(TipoRegistroMarcaId)
);

-- 8. RefreshTokens
CREATE TABLE GSI_RefreshTokens (
    Id INT IDENTITY PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    Token NVARCHAR(256) NOT NULL,
    ExpiryDate DATETIME NOT NULL
)
