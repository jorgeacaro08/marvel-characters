# API de Personajes Marvel

API REST en NestJS para el taller de ISIS3710. Usa la base de datos PostgreSQL de este repositorio.

## Como correrla

Desde la raiz del repositorio:

```bash
docker compose up -d --build
```

Eso levanta la base de datos y la API. Swagger queda en http://localhost:3000/docs

Para apagar todo:

```bash
docker compose down
```

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /teams | Lista todos los equipos |
| GET | /teams/{id} | Obtiene un equipo por su id |
| GET | /teams/{id}/characters | Lista los personajes del equipo |
| POST | /teams | Crea un equipo, opcionalmente con characterIds |
| PUT | /teams/{id} | Reemplaza el equipo completo |
| PATCH | /teams/{id}/characters | Asigna personajes al equipo |
| DELETE | /teams/{id} | Elimina un equipo |
| GET | /characters | Lista los personajes, filtros ?status y ?teamId |
| GET | /characters/{id} | Obtiene un personaje con los datos de su equipo |
| POST | /characters | Crea un personaje |
| PUT | /characters/{id} | Reemplaza el personaje completo |
| PATCH | /characters/{id}/status | Cambia solo el estado |
| DELETE | /characters/{id} | Elimina un personaje |
