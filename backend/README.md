# NEXO U Backend (Docker + Neon)

**Primero lee [README-NEON-3-ROLES.md](README-NEON-3-ROLES.md)**.

# NEXO U — Backend MVP (Docker)

**Solo backend**, sin React. Incluye una página de prueba integrada en FastAPI.

## Requisitos
- Docker Desktop encendido, con Docker Compose v2.

## Iniciar
Abre una terminal en esta carpeta (`backend`) y ejecuta:

```bash
docker compose up --build -d
docker compose ps
```

Abre **http://localhost:8000/** para ver el panel de prueba y **http://localhost:8000/docs** para Swagger.

## Demo
- `GET /api/v1/match`: Camila cumple 4 de 5 requisitos (falta Inglés B1).
- `POST /api/v1/courses/1/complete` en Swagger: body `{"student_id":1}` y cabecera `x-emitter-key: change-me-for-local-demo` (solo para demostración local).
- Vuelve a `GET /api/v1/match`: debe mostrar 5 de 5.
- Para restaurar el caso: `POST /api/v1/demo/reset` con la misma cabecera.

**Aviso:** el curso y la oportunidad de la demo son ficticios, no convocatorias oficiales. La clave incluida es exclusivamente para entorno local; no publiques este contenedor en Internet.

## Diagnóstico
```bash
docker compose ps
docker compose logs --tail=100 api
docker compose down
```

Si el puerto 8000 está ocupado, cambia `"8000:8000"` a `"8001:8000"` en `docker-compose.yml` y entra a `http://localhost:8001/`.

## Pruebas sin Docker (opcional)
```bash
pip install -r requirements.txt
pytest -q
```

## Persistencia
SQLite se guarda en el volumen Docker `nexo_data`. `docker compose down` no borra los datos. Para reiniciar la demo, usa el endpoint `/api/v1/demo/reset`.
