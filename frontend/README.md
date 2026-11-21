# Nexo U · Frontend

Landing inicial y demostración interactiva de Nexo U, una billetera estudiantil que conecta credenciales, oportunidades y apoyo financiero.

## Desarrollo local

```bash
npm install
npm run dev
```

La landing usa datos de ejemplo. En la demo, el botón **Simular validación del emisor** muestra cómo una oportunidad pasa de 4/5 a 5/5 requisitos.

Las pantallas de acceso están disponibles en `/login` y `/register`. Por ahora solo incluyen la interfaz y validación local de los campos; aún no envían ni guardan credenciales.

## Estructura

```text
src/
├── features/
│   ├── auth/          # Inicio de sesión y registro
│   ├── landing/       # Página pública, secciones y datos de demostración
│   └── navigation/   # Navegación pública y navegación autenticada
└── shared/
    ├── api/           # Cliente compartido para conectar el backend
    └── components/    # Componentes de marca compartidos
```

El cliente API toma su URL de `VITE_API_BASE_URL`. Copia `.env.example` a `.env.local` si necesitas apuntarlo a otro backend.
