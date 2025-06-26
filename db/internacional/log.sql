CREATE TABLE GSI_LogAuditoria (
    IdLog INT IDENTITY(1,1) PRIMARY KEY,
    Accion NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(500) NOT NULL,
    Ruta NVARCHAR(300) NULL,
    Usuario NVARCHAR(100) NOT NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE PROCEDURE GSI_SP_InsertarLog
    @Accion NVARCHAR(100),
    @Descripcion NVARCHAR(500),
    @Ruta NVARCHAR(300),
    @Usuario NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO GSI_LogAuditoria (Accion, Descripcion, Ruta, Usuario)
    VALUES (@Accion, @Descripcion, @Ruta, @Usuario);

    -- Devuelve 1 si todo ok (puedes cambiar por el Id insertado si lo necesitas)
    SELECT CAST(1 AS BIT) AS Exito;
END