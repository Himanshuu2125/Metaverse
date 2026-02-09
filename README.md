# 🌐 Project Metaverse

[![Deploy to Render](https://img.shields.io/badge/Deploy%20to-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

**Project Metaverse** is a high-performance, real-time 3D social platform built with a modern full-stack architecture. It combines immersive 3D environments with robust social features like voice calls, real-time chat, and a proximity-based interaction system.

---

## 🚀 Key Features

-   **🎮 Immersive 3D Environment**: Interactive world built with **Three.js** and **React Three Fiber**, featuring smooth player movement and synchronization.
-   **🎙️ Real-time Voice Calls**: Seamless peer-to-peer voice communication using **WebRTC** and custom signaling.
-   **💬 Professional Chat System**: Persistent friend-based chat and real-time proximity-based messaging via **Socket.IO**.
-   **🔐 Passwordless Authentication**: Secure and friction-less onboarding using **Firebase OTP (One-Time Password)** system.
-   **👥 Social Ecosystem**: Full-fledged friend system with real-time requests, status tracking, and profile customization.
-   **🤖 Intelligent Proximity Detection**: Dynamic interaction triggers (E-key detection) when players are near each other.
-   **🐳 Cloud-Native Architecture**: Fully containerized with **Docker** and optimized for automated deployment on **Render**.

---

## 🛠️ Tech Stack

### Frontend
-   **React & Vite**: Modern UI framework with optimized build tooling.
-   **Three.js / R3F**: 3D rendering engine for the metaverse environment.
-   **Tailwind CSS**: Utility-first styling for a premium, responsive UI.
-   **Firebase SDK**: Authentication and client-side security.
-   **Socket.IO Client**: Real-time state synchronization.

### Backend
-   **Node.js & Express**: High-performance server environment.
-   **Socket.IO**: Real-time bidirectional event handling.
-   **Firebase Admin SDK**: Managed authentication and user data.
-   **Nodemailer**: Automated OTP delivery system.
-   **WebRTC**: P2P communication infrastructure.

### DevOps
-   **Docker**: Multi-stage builds for minimal production image size.
-   **Docker Compose**: Streamlined local development environment.
-   **Render**: Continuous Deployment (CD) pipeline.

---

## 🚦 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18+)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)

### Local Development (via Docker)
The fastest way to get started is using Docker Compose:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Himanshuu2125/Metaverse.git
    cd Metaverse
    ```

2.  **Configure Environment Variables**:
    Create `.env` files for both client and server based on the `.env.example` templates provided in their respective directories.

3.  **Spin up the containers**:
    ```bash
    docker compose up --build
    ```
    The app will be available at `http://localhost:3000`.

### Manual Setup (without Docker)

1.  **Backend**:
    ```bash
    cd server-side
    npm install
    npm start
    ```

2.  **Frontend**:
    ```bash
    cd client-side
    npm install
    npm run dev
    ```

---

## 🔑 Environment Variables

### Server-side (`/server-side/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (default: 3000) |
| `ALLOWED_ORIGINS` | CORS allowed domains (comma-separated) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail credentials for OTP delivery |
| `FIREBASE_*` | Firebase Admin SDK configuration |

### Client-side (`/client-side/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_SERVER_URL` | Backend URL (Automatically detects current origin in production) |
| `VITE_FIREBASE_*` | Firebase Client SDK configuration |

---

## 🏗️ Architecture Overview

The system follows a classic **Client-Server-Realtime** pattern:
1.  **Express Server** acts as the primary API gateway and identity validator.
2.  **Socket.IO Layer** handles the high-frequency state updates (movement, chat messages).
3.  **WebRTC Layer** establishes P2P tunnels for voice traffic, mediated by the server for initial handshaking.
4.  **Firebase** serves as the source of truth for identity and secure session management.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author
**Himanshu** - *Initial Work* - [Himanshuu2125](https://github.com/Himanshuu2125)
