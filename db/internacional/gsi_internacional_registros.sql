CREATE OR ALTER PROCEDURE SP_RegInt_EliminarProducto
    @IdProducto INT,
    @Usuario NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE GSI_Int_RegistroProducto
    SET
        Estado = 0,
        UsuarioModificacion = @Usuario,
        FechaModificacion = GETDATE()
    WHERE
        RegistroProductoId = @IdProducto;

    IF @@ROWCOUNT > 0
        SELECT 1;
    ELSE
        SELECT 0;
END