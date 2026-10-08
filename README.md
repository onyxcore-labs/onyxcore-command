# OnyxCore Command Center

> High-velocity founder operations platform and hardware testbed for deep-tech venture execution.

![OnyxCore Status](https://img.shields.io/badge/Status-Active%20Sprint-emerald?style=flat-square)
![Cluster](https://img.shields.io/badge/Supabase-eu--west--1-blue?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Tailwind-slate?style=flat-square)

---

## 🏛️ Executive Architecture

The **OnyxCore Command Center** provides unified operational synchronization, real-time presence, component inventory tracking, and ideation consensus across the founding team.

### Co-Founders & Core Verticals

| Founder | Handle | Core Responsibility |
| :--- | :--- | :--- |
| **Maximilian Ghambuna** | `@ghambuna` | **Lead & Firmware Systems** (ESP32, 1-Wire, RTOS, Sensors) |
| **Brian Shamba** | `@shamba` | **UI & Systems Architecture** (Executive Design Tokens, Routing) |
| **Aidan Maganga** | `@maganga` | **Client Operations & QA** (Field Pilots, SLA Verification) |
| **Blessing Mchele** | `@mchele` | **Backend & Data Pipelines** (PostgreSQL, Realtime Telemetry, Supabase) |

---

## ⚡ Core Operational Modules

1. **Authentication & Session Gate**
   - Secure founder passcode gate defaulting to lowercase surnames (`ghambuna`, `shamba`, `maganga`, `mchele`).
   - Dynamic credentials management allowing in-app updates saved to PostgreSQL.

2. **My Objectives (Personalized Execution Engine)**
   - Personalized workspace dynamically scoped to the logged-in founder.
   - Live velocity slider (0–100%) and instant blocker status toggle (`CLEAR // IN FLOW` vs. `IMPEDIMENT / STALLED`).
   - Domain-tailored checklist with squad quick-pulse bar.

3. **Squad Sync & Live Blocker Board**
   - Real-time 4-founder matrix broadcasting online presence and blockers.
   - Realtime multi-window sync powered by Supabase WebSockets.

4. **Project Radar & Social Ideation Feed**
   - Opportunity stream for logging prospective pilots, deep-tech architectures, and hardware videos.
   - Responsive inline media embeds (YouTube, X/Twitter, GitHub, external links).
   - Consensus voting controls: `Under Discussion`, `Approved for Sprint`, `Passed / Archived`.

5. **Hardware Inventory & Component Registry**
   - Lab-grade hardware tracking for testbed microcontrollers, sensors, and wireless radios (ESP32 DevKits, DS18B20 probes, Quectel cellular modules, power circuits).

6. **Squad Comms & AI Advisor Dock**
   - Floating dual-terminal dock with live multi-channel team chat (`#all-hands`, `#firmware-hw`, `#backend-data`, etc.).
   - Integrated Gemini AI advisor with LaTeX formula rendering and Markdown code support.

---

## 🛠️ Tech Stack & Infrastructure

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend / Database:** Supabase PostgreSQL (`eu-west-1`)
- **Realtime Layer:** Supabase WebSockets (`supabase_realtime` publication)
  - Tables: `founder_status`, `squad_messages`, `project_ideas`, `hardware_inventory`
- **AI Engine:** Google Gemini (Flash series)

---

## 🚀 Local Development Setup

### 1. Clone & Install

```bash
git clone [https://github.com/onyxcore-labs/onyxcore-command.git](https://github.com/onyxcore-labs/onyxcore-command.git)
cd onyxcore-command
npm install
