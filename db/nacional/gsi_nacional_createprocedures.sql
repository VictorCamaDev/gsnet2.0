--1. Modificacion de Tabla Seguimiento_OC
ALTER TABLE Seguimiento_OC
ADD 
    DestinoMuestra NVARCHAR(100) NULL,
    FechaEnsayoCampo DATE NULL,
    FechaTerminoEnsayo DATE NULL,
    ResultadoCampo NVARCHAR(100) NULL,
    Comentarios NVARCHAR(100) NULL;

--2. Creacion de Procedimientos
CREATE OR ALTER   PROCEDURE [dbo].[GSNET_Listar_SeguimientoOc]

    @FechaInicial varchar(100) = null,
    @FechaFinal varchar(100) = null,
    @Proveedor varchar(200) = null
AS
BEGIN
    DECLARE @rucEmpresa varchar(11) = '', @idClaseFormulador numeric(10, 0);
    DECLARE @nombreEmpresa varchar(50) = '';
    DECLARE @FechaInicialDate datetime;
    DECLARE @FechaFinalDate datetime;

    IF @FechaInicial IS NULL
    BEGIN
        SET @FechaInicialDate = '2025-01-01';
    END
    ELSE
    BEGIN
        SET @FechaInicialDate = CONVERT(datetime, @FechaInicial, 103); 
    END

    IF @FechaFinal IS NULL
    BEGIN
        SET @FechaFinalDate = GETDATE();
    END
    ELSE
    BEGIN
        SET @FechaFinalDate = CONVERT(datetime, @FechaFinal, 103);
    END

    SELECT @nombreEmpresa = Nombre FROM DatosEmpresa;
    SELECT @rucEmpresa = RUC FROM DatosEmpresa;

    IF (@rucEmpresa = '20191503482')
    BEGIN
        SET @idClaseFormulador = 11;
    END
    IF (@rucEmpresa = '20509089923')
    BEGIN
        SET @idClaseFormulador = 11;
    END
    IF (@rucEmpresa = '20607720992')
    BEGIN
        SET @idClaseFormulador = 11;
    END
    IF (@rucEmpresa = '20337935029')
    BEGIN
        SET @idClaseFormulador = 10;
    END

    SELECT DISTINCT
        soc.IdSeguimiento AS Nro,
        YEAR(oc.FechaOrden) AS Año,
		'Silvestre Peru SAC' AS Empresa,
        ipr.Propiedad AS Formulador,
        ISNULL(paisprov.Nombre, '') AS Origen,
        proveedor.agendaNombre AS Supplier,
        soc.OcNumeroOrden AS Oc,
        ISNULL((SELECT TOP 1 iprm.Propiedad 
                FROM ItemClasificacion ic2
                LEFT JOIN ItemClasificacion icm ON icm.ID_Item = ic2.ID_Item AND icm.ID_Clase = 2 
                LEFT JOIN ItemPropiedad iprm ON icm.Id_Propiedad = iprm.ID
                WHERE ic2.Id_item = ic.ID_Item), '') AS Marca,
        '' AS Ia,
        ISNULL(ocl.Presentacion, '') AS Presentacion,
        soc.Cantidad AS Quantity,
        ocl.Precio AS [Price (USD)],
        ISNULL(status.Texto, 'POR CONFIRMAR') AS Status,
        ISNULL(CONVERT(VARCHAR(10), soc.IngresoPlantaFecha, 103), '') AS [IngresoPlanta],
        soc.Item_Id AS KarDex,  -- Placeholder for KARDEX
        soc.DestinoMuestra AS [DestinoDeLaMuestra],  -- Placeholder for DESTINO DE LA MUESTRA
        ISNULL(CONVERT(VARCHAR(10), soc.FechaEnsayoCampo, 103), '') AS [FechaDeEnsayoCampo],  -- Placeholder for FECHA DE ENSAYO CAMPO
        ISNULL(CONVERT(VARCHAR(10), soc.FechaTerminoEnsayo, 103), '') AS [FechaDeCulminacionDeEnsayo],  -- Placeholder for FECHA DE CULMINACIÓN DE ENSAYO
        soc.ResultadoCampo AS [ResultadoDeCampo],  -- Placeholder for RESULTADO DE CAMPO
        soc.Comentarios AS Comentarios  -- Placeholder for COMENTARIOS
    FROM Seguimiento_OC soc
    INNER JOIN OCLinea ocl ON ocl.Op = soc.OcOrigen AND ocl.Item_ID = soc.Item_Id AND ocl.BackOrder <> ocl.Cantidad AND ocl.id_amarre = soc.idocl
    INNER JOIN OC oc ON soc.OcOrigen = oc.Op
    LEFT JOIN ItemClasificacion ic ON ic.ID_Item = ocl.item_ID AND ic.ID_Clase = @idClaseFormulador AND ic.ID_Item = ocl.item_ID
    LEFT JOIN ItemPropiedad ipr ON ic.Id_Propiedad = ipr.ID
    LEFT JOIN Items i ON i.ID = ocl.Item_ID
    LEFT JOIN tblItemEstructuraOpcion AS Opcion_G3 WITH (NOLOCK) ON Opcion_G3.ID_ItemEstructuraOpcion = i.Grupo3_Opcion 
    LEFT JOIN tblIMP_IncoTerm inc ON inc.ID_IncoTerm = oc.Incoterm
    INNER JOIN agenda AS proveedor ON proveedor.id_agenda = oc.id_agenda
    LEFT JOIN Direcciones dirprov ON dirprov.Op = oc.id_agenda AND dirprov.TablaOrigen = 'Agenda' AND dirprov.ID = soc.ID_AgendaDireccion
    LEFT JOIN Paises paisprov ON paisprov.ID_Pais = dirprov.ID_Pais
    LEFT JOIN ParametrosGenerales docAgenteAduana ON soc.DocAgenteAduanas = docAgenteAduana.Identificador AND docAgenteAduana.Grupo1 = 1 AND docAgenteAduana.Grupo2 = 1
    LEFT JOIN ParametrosGenerales factura ON soc.Factura = factura.Identificador AND factura.Grupo1 = 1 AND factura.Grupo2 = 2
    LEFT JOIN ParametrosGenerales status ON soc.IdStatus = status.Identificador AND status.Grupo1 = 1 AND status.Grupo2 = 3
    WHERE OC.FechaOrden BETWEEN @FechaInicialDate AND @FechaFinalDate
    AND (@Proveedor = '' OR @Proveedor IS NULL 
    OR OC.ID_Agenda LIKE '%' + @Proveedor + '%' OR proveedor.AgendaNombre LIKE '%' + @Proveedor + '%')
    ORDER BY soc.IdSeguimiento desc;
END
