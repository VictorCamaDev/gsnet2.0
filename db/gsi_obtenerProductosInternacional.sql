CREATE OR ALTER PROCEDURE [dbo].[SP_RegInt_ObtenerProductosRegistrados]
AS
BEGIN
    SET NOCOUNT ON;

    /* ==== CTEs para agrupar múltiples formuladores / fabricantes del CERTIFICADO ==== */
    ;WITH CertFormuladores AS (
        SELECT rcf.RegistroCertificadoId,
               STRING_AGG(e.Nombre, ', ')  AS Formulador,
               STRING_AGG(e.Pais  , ', ')  AS PaisFormulador
        FROM GSI_Int_RegistroCertificadoFormulador rcf
        JOIN GSI_Int_Empresa e ON e.EmpresaId = rcf.EmpresaId
        GROUP BY rcf.RegistroCertificadoId
    ),
    CertFabricantes AS (
        SELECT rcf.RegistroCertificadoId,
               STRING_AGG(e.Nombre, ', ')  AS Fabricante,
               STRING_AGG(e.Pais  , ', ')  AS PaisFabricante
        FROM GSI_Int_RegistroCertificadoFabricante rcf
        JOIN GSI_Int_Empresa e ON e.EmpresaId = rcf.EmpresaId
        GROUP BY rcf.RegistroCertificadoId
    )

    SELECT
        CAST(r.RegistroProductoId AS varchar)                              AS RegistroProductoId,
        ISNULL(tp.Nombre, '-')                                             AS TipoProducto,
        ISNULL(r.Producto,  '-')                                             AS Producto,
        ISNULL(ia.Nombre, '-')                                             AS IngredienteActivo,
        ISNULL(r.Concentracion,'-')                                        AS Concentracion,
        ISNULL(r.Porcentaje,   '-')                                        AS Porcentaje,
        ISNULL(f.Descripcion,  '-')                                        AS Formulacion,
        ISNULL(cu.Nombre,      '-')                                        AS ClaseUso,
        ISNULL(bt.Descripcion, '-')                                        AS BandaToxicologica,
        ISNULL(r.PresentacionRegistrada,'-')                               AS PresentacionRegistrada,
        ISNULL(r.TipoEnvase,'-')                                           AS TipoEnvase,
        ISNULL(r.MaterialesEnvase,'-')                                     AS MaterialesEnvase,
        ISNULL(r.Descripcion,'-')                                          AS Descripcion,
        ISNULL(r.DictamenTecnico,'-')                                      AS DictamenTecnico,
        ISNULL(r.EstabilidadProducto,'-')                                  AS EstabilidadProducto,

        -- Avance
        ISNULL(ra.NumeroExpediente, '-')                                   AS NumeroExpediente,
        ISNULL(CONVERT(varchar,ra.PresentacionExpediente,120), '-')        AS PresentacionExpediente,
        ISNULL(CONVERT(varchar,ra.TerminoRegistro,120),      '-')          AS TerminoRegistro,
        ISNULL(ra.Comentario, '-')                                         AS Comentario,
        ISNULL(la.Nombre,    '-')                                          AS StatusAvance,
        ISNULL(CAST(la.Valor AS varchar), '0')                             AS Valor,

        -- Certificado
        ISNULL(rc.NumeroCertificado,'-')                                   AS NumeroCertificado,
        ISNULL(CONVERT(varchar,rc.FechaRegistro,120),       '-')           AS FechaRegistro,
        ISNULL(CONVERT(varchar,rc.FechaActualizacion,120),  '-')           AS FechaActualizacion,
        ISNULL(rc.VigenciaRegistro,'-')                                    AS VigenciaRegistro,
        ISNULL(cf.Formulador,        '-')                                   AS Formulador,
        ISNULL(cf.PaisFormulador,    '-')                                   AS PaisFormulador,
        ISNULL(cfab.Fabricante,      '-')                                   AS Fabricante,
        ISNULL(cfab.PaisFabricante,  '-')                                   AS PaisFabricante,

        -- Uso
        ISNULL(ru.CultivoId,'0')                                           AS CultivoId,
        ISNULL(c.Nombre,'-')                                               AS CultivoNombre,
        ISNULL(pl.Nombre,'-')                                              AS PlagaNombreComun,
        ISNULL(pl.NombreCientifico,'-')                                    AS PlagaNombreCientifico,
        ISNULL(ru.Dosis,'-')                                               AS Dosis,
        ISNULL(ru.NumeroResolucion,'-')                                    AS NumeroResolucion,
        ISNULL(ru.LMR,'-')                                                 AS LMR,
        ISNULL(ru.PCDias,'0')                                              AS PCDias,
        ISNULL(ru.PRHoras,'0')                                             AS PRHoras,

        -- Fabricantes (producto)
        ISNULL(e.Nombre,'-')                                               AS FabricanteNombre,
        ISNULL(e.Pais,'-')                                                 AS FabricantePais,
        ISNULL(e.Direccion,'-')                                            AS FabricanteDireccion,

        -- Formuladores (producto)
        ISNULL(ef3.Nombre,'-')                                             AS FormuladorNombre,
        ISNULL(ef3.Pais,'-')                                               AS FormuladorPais,
        ISNULL(ef3.Direccion,'-')                                          AS FormuladorDireccion,

        -- Marca
        ISNULL(rm.RegistroMarcaId,'0')                                     AS RegistroMarcaId,
        ISNULL(rm.MarcaRegistrada,'-')                                     AS MarcaRegistrada,
        ISNULL(rm.NumeroRegistro,'-')                                      AS NumeroRegistro,
        ISNULL(crm.Nombre,'-')                                             AS ClaseRegistroMarca,
        ISNULL(trm.Nombre,'-')                                             AS TipoRegistroMarca,
        ISNULL(CONVERT(varchar,rm.FechaRegistro,120),  '-')                AS FechaRegistroMarca,
        ISNULL(CONVERT(varchar,rm.VigenciaRegistro,120), '-')              AS VigenciaMarca,
        ISNULL(CONVERT(varchar(max),rm.Logo), '-')                         AS Logo,

        -- Documentos
        ISNULL(d.NombreDocumento,'-')                                      AS NombreDocumento,
        ISNULL(d.TipoArchivo,'-')                                          AS TipoArchivo,
        ISNULL(CONVERT(varchar,d.FechaCreacion,120), '-')                  AS FechaDocumento
    FROM  GSI_Int_RegistroProducto r
    LEFT JOIN GSI_Int_TipoProducto             tp  ON r.IdTipoProducto     = tp.TipoProductoId
    LEFT JOIN GSI_Int_IngredienteActivo        ia  ON r.IdIngredienteActivo= ia.IngredienteActivoId
    LEFT JOIN GSI_Int_ClaseUso                 cu  ON r.IdClaseUso         = cu.ClaseUsoId
    LEFT JOIN GSI_Int_BandaTox                 bt  ON r.IdBandaToxicologica= bt.BandaToxId
    LEFT JOIN GSI_Int_Formulacion              f   ON f.Codigo             = r.Formulacion

    -- Avance
    LEFT JOIN GSI_Int_RegistroAvance           ra  ON r.RegistroProductoId = ra.RegistroProductoId
    LEFT JOIN GSI_Int_ListaAvance              la  ON ra.IdListaAvance     = la.ListaAvanceId

    -- Certificado
    LEFT JOIN GSI_Int_RegistroCertificado      rc  ON r.RegistroProductoId = rc.RegistroProductoId
    LEFT JOIN CertFormuladores                 cf  ON rc.RegistroCertificadoId = cf.RegistroCertificadoId
    LEFT JOIN CertFabricantes                  cfab ON rc.RegistroCertificadoId = cfab.RegistroCertificadoId

    -- Uso
    LEFT JOIN GSI_Int_RegistroUso              ru  ON r.RegistroProductoId = ru.RegistroProductoId
    LEFT JOIN GSI_Int_Cultivo                  c   ON ru.CultivoId         = c.CultivoId
    LEFT JOIN GSI_Int_Plaga                    pl  ON ru.PlagaId           = pl.PlagaId

    -- Fabricantes (producto)
    LEFT JOIN GSI_Int_RegistroFabricante       rf  ON r.RegistroProductoId = rf.RegistroProductoId
    LEFT JOIN GSI_Int_Empresa                  e   ON rf.EmpresaId         = e.EmpresaId

    -- Formuladores (producto)
    LEFT JOIN GSI_Int_RegistroFormulador       rfm ON r.RegistroProductoId = rfm.RegistroProductoId
    LEFT JOIN GSI_Int_Empresa                  ef3 ON rfm.EmpresaId        = ef3.EmpresaId

    -- Marca
    LEFT JOIN GSI_Int_RegistroMarca            rm  ON r.RegistroProductoId = rm.RegistroProductoId
    LEFT JOIN GSI_Int_ClaseRegistroMarca       crm ON rm.ClaseRegistroMarcaId = crm.ClaseRegistroMarcaId
    LEFT JOIN GSI_Int_TipoRegistroMarca        trm ON rm.TipoRegistroMarcaId  = trm.TipoRegistroMarcaId

    -- Documentos
    LEFT JOIN GSI_Int_RegistroMarcaDocumento   d   ON rm.RegistroMarcaId   = d.RegistroMarcaId

    WHERE r.Estado = 1
    ORDER BY r.RegistroProductoId DESC;
END;