# Clínica Veterinaria — MVP SaaS (NestJS)
Implementa la **Tarea 2** de la actividad:

- **2a) DTO con class-validator + @ApiProperty** → `src/citas/dto/crear-cita.dto.ts`
- **2b) Comunicación síncrona vs asíncrona**
  - Síncrono → `POST /api/v1/citas` responde inmediatamente.
  - Asíncrono → al crear la cita se emite el evento `cita.creada`; el worker
    (`NotificacionesListener`) envía el recordatorio en segundo plano.
- **2c) Patrón Saga** → `POST /api/v1/saga/agendar-y-cobrar` ejecuta:
  1. `ReservarHorario`
  2. `ApartarInventarioVacuna`
  3. `CobrarPago`
  4. `ConfirmarCita`

  Si algún paso falla se ejecutan las compensaciones en orden inverso:
  `ReembolsarPago` → `LiberarInventarioVacuna` → `LiberarHorario`.

---

## Requisitos

- **Node.js 18+** (recomendado 20)
- npm 9+

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run start:dev
```

La API queda en `http://localhost:3000` y Swagger UI en `http://localhost:3000/docs`.

## Pruebas rápidas con `curl`

### 1) Crear cita (síncrono + async detrás)

```bash
curl -X POST http://localhost:3000/api/v1/citas \
  -H "Content-Type: application/json" \
  -d '{
    "mascotaId": "MAS-4501",
    "veterinarioId": "VET-07",
    "fechaHora": "2026-08-05T10:30:00Z",
    "motivo": "Vacunacion anual",
    "canal": "web"
  }'
```

La respuesta llega en milisegundos. En los logs del servidor verás,
1.5 s después, `Recordatorio enviado ...` — esa es la parte asíncrona.

Consulta el historial del worker:

```bash
curl http://localhost:3000/api/v1/notificaciones/historial
```

### 2) Ejecutar la Saga (camino feliz)

```bash
curl -X POST http://localhost:3000/api/v1/saga/agendar-y-cobrar \
  -H "Content-Type: application/json" \
  -d '{
    "mascotaId": "MAS-4501",
    "veterinarioId": "VET-07",
    "fechaHora": "2026-08-06T09:00:00Z",
    "vacuna": "vacunaTriple",
    "tarjetaTerminaEn": "4242"
  }'
```

Respuesta esperada: `"exito": true` con la bitácora de los 4 pasos en `OK`.

### 3) Saga con **fallo en el pago** (compensa los pasos 1 y 2)

```bash
curl -X POST http://localhost:3000/api/v1/saga/agendar-y-cobrar \
  -H "Content-Type: application/json" \
  -d '{
    "mascotaId": "MAS-4501",
    "veterinarioId": "VET-07",
    "fechaHora": "2026-08-07T11:00:00Z",
    "vacuna": "vacunaAntirrabica",
    "tarjetaTerminaEn": "0000"
  }'
```

### 4) Saga con **fallo en el último paso** (compensa 3 → 2 → 1)

```bash
curl -X POST http://localhost:3000/api/v1/saga/agendar-y-cobrar \
  -H "Content-Type: application/json" \
  -d '{
    "mascotaId": "MAS-4501",
    "veterinarioId": "VET-07",
    "fechaHora": "2026-08-08T12:00:00Z",
    "vacuna": "vacunaTriple",
    "tarjetaTerminaEn": "4242",
    "forzarFalloConfirmacion": true
  }'
```

En los logs verás las tres líneas `COMPENSACION: ...` en orden inverso.

### 5) Validación (class-validator rechazando datos)

```bash
curl -X POST http://localhost:3000/api/v1/citas \
  -H "Content-Type: application/json" \
  -d '{ "mascotaId": "BAD", "veterinarioId": "VET-07", "fechaHora": "no-fecha", "canal": "otro" }'
```

Respuesta 400 con los mensajes de cada decorador.

---

## Estructura

```
src/
├── main.ts                       # Bootstrap + Swagger
├── app.module.ts
├── citas/                        # 2a: DTO + endpoint sincrono + emision de evento
│   ├── dto/crear-cita.dto.ts
│   ├── citas.controller.ts
│   ├── citas.service.ts
│   └── citas.module.ts
├── notificaciones/               # 2b: worker ASINCRONO
│   ├── notificaciones.listener.ts
│   ├── notificaciones.service.ts
│   ├── notificaciones.controller.ts
│   └── notificaciones.module.ts
├── horarios/                     # 2c paso 1 + compensacion
├── inventario/                   # 2c paso 2 + compensacion
├── pagos/                        # 2c paso 3 SINCRONO + compensacion
└── saga/                         # 2c orquestador
    ├── iniciar-saga.dto.ts
    ├── saga.controller.ts
    ├── saga.service.ts
    └── saga.module.ts
```
