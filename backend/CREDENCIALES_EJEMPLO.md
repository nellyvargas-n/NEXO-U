# Credenciales NEXO U — documentación SIN contraseñas

Los roles son: `usuario` (estudiante escolar/universitario), `empresa` y `admin`.
No hay credenciales reales ni contraseñas predeterminadas en este ZIP.

Para crear cuentas ficticias solo en una **rama Neon de pruebas**, usa
`docker compose exec -e ALLOW_DEMO_SEED=true api python -m scripts.seed_demo_accounts`.
El script genera claves aleatorias **al momento de ejecutarse** y deja una
copia privada en `.local_credentials/CREDENCIALES_GENERADAS.md` dentro del contenedor.

No publiques el archivo generado ni copies claves a `.env.example`.
La contraseña de Neon solo pertenece a `backend/.env` local.
