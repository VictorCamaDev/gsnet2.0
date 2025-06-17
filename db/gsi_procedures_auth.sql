CREATE OR ALTER PROCEDURE [dbo].[GSI_ObtenerUsuarioPorEmail]
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        idUsuario,
        codigoUsuario,
        correo,
        password,
        nombres,
        loginUsuario,
        idPerfil,
        nroDocumento
    FROM gs0genesys.dbo.usuario
    WHERE correo = @Email
      AND activo = 1;
END;

CREATE OR ALTER PROCEDURE [dbo].[GSI_RefreshToken_Guardar]
    @UserId NVARCHAR(50),
    @Token NVARCHAR(256),
    @ExpiryDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM GSI_RefreshTokens WHERE UserId = @UserId)
    BEGIN
        UPDATE GSI_RefreshTokens
        SET Token = @Token, ExpiryDate = @ExpiryDate
        WHERE UserId = @UserId
    END
    ELSE
    BEGIN
        INSERT INTO GSI_RefreshTokens (UserId, Token, ExpiryDate)
        VALUES (@UserId, @Token, @ExpiryDate)
    END
END;


CREATE OR ALTER PROCEDURE [dbo].[GSI_RefreshToken_Validar]
    @UserId NVARCHAR(50),
    @Token NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM GSI_RefreshTokens
    WHERE UserId = @UserId
      AND Token = @Token
      AND ExpiryDate > GETUTCDATE()
END;

CREATE OR ALTER PROCEDURE [dbo].[GSI_Usuario_Autenticar]
    @_usuario NVARCHAR(255),
    @_contrasena NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        idUsuario,
        codigoUsuario,
        correo,
        password,
        nombres,
        loginUsuario,
        idPerfil,
        nroDocumento
    FROM gs0genesys.dbo.usuario
    WHERE loginUsuario = @_usuario
      AND password = @_contrasena
      AND activo = 1;
END