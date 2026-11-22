"""Ayuda contextual de acceso: nunca solicita contraseñas ni códigos."""


def auth_help(topic: str = "login") -> str:
    """Devuelve pasos seguros, sin manejar contraseñas personales."""
    if topic == "roles":
        return "Estudiante usa 'usuario'; organización usa 'empresa'; el administrador se crea mediante un script protegido."
    if topic == "password":
        return "Usa una contraseña distinta de Neon y de JWT_SECRET. No la compartas en chats ni repositorios."
    return "Regístrate o inicia sesión; usa el token Bearer solo con el backend NEXO U y nunca lo publiques."
