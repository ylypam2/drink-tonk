type RolNormalizado = "ADMIN" | "EMPLEADO";
type ResultadoNormalizacion = 
  | { valido: true; rol: RolNormalizado }
  | { valido: false; razon: string };

export function normalizarRol(rol: unknown): ResultadoNormalizacion {
  if (typeof rol !== "string") {
    return { valido: false, razon: "Rol debe ser un string" };
  }

  const rolNormalizado = rol.trim().toUpperCase();

  if (rolNormalizado !== "ADMIN" && rolNormalizado !== "EMPLEADO") {
    return { valido: false, razon: "Rol no reconocido" };
  }

  return { valido: true, rol: rolNormalizado as RolNormalizado };
}

export function esRolValido(rol: unknown): rol is RolNormalizado {
  const resultado = normalizarRol(rol);
  return resultado.valido;
}
