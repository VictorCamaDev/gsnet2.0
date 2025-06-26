export interface LogPayload {
  accion: string;
  descripcion: string;
  ruta: string;
}

export async function insertarLog(payload: LogPayload) {
  try {
    // Construir headers obligatorios desde sessionStorage
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const selectedCompany = sessionStorage.getItem("selected_company");
    if (selectedCompany) {
      try {
        const companyObj = JSON.parse(selectedCompany);
        if (companyObj?.id) {
          headers["IdEmpresa"] = companyObj.id.toString();
        }
      } catch (e) {
        console.warn("Error parseando selected_company:", e);
      }
    }
    const currentUser = sessionStorage.getItem("current_user");
    if (currentUser) {
      try {
        const userObj = JSON.parse(currentUser);
        if (userObj?.codigoUsuario) {
          headers["codigousuario"] = userObj.codigoUsuario.toString();
        }
        if (userObj?.loginUsuario) {
          headers["loginusuario"] = userObj.loginUsuario;
        }
      } catch (e) {
        console.warn("Error parseando current_user:", e);
      }
    }
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Log/InsertarLog`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Error enviando log de auditoría', err);
  }
}
