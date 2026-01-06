# none.snmp v0.2

**Autonomous Network Intelligence Center**

A modern, high-performance network monitoring dashboard built with Astro, React, and Tailwind CSS. Designed with a terminal-inspired aesthetic for high-density information display.

## 🚀 Features

- **Global Dashboard**: Real-time metrics on device health, subnet distribution, and interface status.
- **Topology View**: Visual representation of network infrastructure and device interconnections.
- **Device Inventory**: Comprehensive management of discovered nodes with deep SNMP inspection.
- **Task Scheduler**: Automated subnet scanning and periodic SNMP polling using cron expressions.
- **Docker Ready**: Multi-stage build process optimized for production deployment.

## 🛠️ Stack

- **Frontend**: Astro, React, Tailwind CSS (v4), Lucide Icons.
- **Charts**: Recharts for high-performance data visualization.
- **Tooling**: Bun (runtime), Docker & Docker Compose.

## 📝 TODO / Roadmap

- [ ] **Authentication & Access Control**: Implement secure login system and session management.
- [ ] **ICMP Monitoring**: Ping-based status tracking for legacy devices without SNMP support.
- [ ] **Windows GPO Integration**: Active Directory integration for automated configuration and policy alignment.
- [ ] **Interactive Topology**: Enhance the network graph with real-time connection status.
- [ ] **Alerting Engine**: Configurable notifications (Webhooks/Telegram) for device downtime.
- [ ] **Export Module**: Generate PDF/CSV reports of network inventory and health history.
- [ ] **V3 Security Audit**: Deeper validation of SNMP v3 encryption profiles.
- [ ] **Theme Customization**: Support for multiple "hacker-style" color schemes.

## 📦 Deployment

1. Build and run with Docker Compose:

```bash
docker-compose up --build
```

2. Access the dashboard at `http://localhost:4321`.

---

_Monitoring the unseen, one packet at a time._
