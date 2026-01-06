# none.snmp v0.2

**Autonomous Network Intelligence Center**

A modern, high-performance network monitoring dashboard built with Astro, React, and Tailwind CSS. Designed with a terminal-inspired aesthetic for high-density information display.

## 📖 ¿Qué es none.snmp?

none.snmp es una herramienta de **inteligencia de red** diseñada para administradores que necesitan visibilidad total sobre su infraestructura sin complicaciones. No es solo un panel de gráficas; es un motor de descubrimiento y auditoría que entiende cómo están conectados tus dispositivos.

## 🛠️ Capacidades del Sistema

Con este proyecto puedes realizar las siguientes operaciones críticas:

- **Descubrimiento Autónomo**: Escanea rangos de red (CIDR) completos para encontrar dispositivos vivos e identificarlos automáticamente mediante perfiles SNMP.
- **Localización de Dispositivos (Trace Origin)**: ¿No sabes dónde está pinchado un equipo? Introduce su IP o MAC y el sistema rastrea las tablas ARP y FDB de tus switches para decirte el Switch y el Puerto exacto donde se encuentra.
- **Inventario Profundo**: Inspecciona especificaciones de hardware (CPU, RAM, Discos), versiones de software, números de serie y estados de interfaces de red en tiempo real.
- **Mapeo de Topología**: Gracias a la integración con protocolos de vecinos (LLDP/CDP), el sistema entiende la jerarquía de tu red y cómo se interconectan los nodos core.
- **Automatización Programada**: Configura tareas recurrentes mediante expresiones Cron para mantener el inventario siempre actualizado y realizar auditorías nocturnas de salud.
- **Identificación por Firmas**: Resuelve la identidad de equipos desconocidos cruzando firmas digitales y direcciones de gestión registradas.

## 🚀 Stack Tecnológico

- **Frontend**: Astro, React, Tailwind CSS (v4), Lucide Icons.
- **Visualización**: Recharts para monitorización de rendimiento.
- **Runtime**: Bun + Node.js (Adapter).
- **Despliegue**: Docker & Docker Compose.

## 📝 TODO / Roadmap

- [ ] **Dashboard UI/UX Overhaul**: Rediseñar la pantalla principal para que los datos mostrados tengan una jerarquía más lógica y útil para la toma de decisiones.
- [ ] **Authentication & Access Control**: Implementar sistema de login seguro y gestión de sesiones.
- [ ] **ICMP Monitoring**: Monitorización por ping para dispositivos que no soportan SNMP.
- [ ] **Windows GPO Integration**: Integración con políticas de grupo para despliegue y configuración automática.
- [ ] **Alerting Engine**: Notificaciones en tiempo real (Webhooks/Telegram) ante caídas de servicio.
- [ ] **Interactive Topology**: Mejorar el grafo de red con estados de conexión en tiempo real.

## 📦 Despliegue Rápido

1. Define tu URL de backend:

```bash
export PUBLIC_BACKEND_URL=http://tu-api:3000
```

2. Levanta con Docker:

```bash
docker-compose up --build
```

---

_Monitoring the unseen, one packet at a time._
