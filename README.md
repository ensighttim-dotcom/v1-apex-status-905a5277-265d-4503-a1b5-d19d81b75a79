# Apex Status

A beautiful and real-time dashboard to monitor the health and performance of your API endpoints.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ensighttim-dotcom/generated-app-20251003-204937)

## About The Project

Apex Status is a visually stunning, real-time API monitoring dashboard. It allows users to add a list of their critical API endpoints and continuously track their health. The main dashboard provides an at-a-glance overview of each endpoint, displaying its status (Up, Down, Degraded), response time, and a historical performance chart.

All checks are performed securely from the Cloudflare edge network, providing accurate and reliable monitoring without exposing sensitive data to the client. The application is designed with a focus on visual excellence, intuitive user experience, and high performance.

### Key Features

*   **Real-Time Monitoring:** Get instant updates on the health of your API endpoints.
*   **Visual Dashboard:** An at-a-glance grid view of all monitored services with status, latency, and performance charts.
*   **Configurable Checks:** Define checks with custom URLs, HTTP methods, headers, and request bodies.
*   **Secure & Reliable:** All API checks are proxied through a Cloudflare Worker, ensuring security and preventing CORS issues.
*   **Modern UI/UX:** A clean, responsive interface built with Tailwind CSS and shadcn/ui, featuring a dark/light theme.
*   **Persistent State:** Endpoint configurations are securely stored using Cloudflare Durable Objects.

## Technology Stack

This project is built with a modern, full-stack TypeScript architecture.

*   **Frontend:**
    *   [React](https://react.dev/) - A JavaScript library for building user interfaces.
    *   [Vite](https://vitejs.dev/) - Next-generation frontend tooling.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
    *   [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components.
    *   [Lucide React](https://lucide.dev/) - Simply beautiful open-source icons.
    *   [Recharts](https://recharts.org/) - A composable charting library.
    *   [Zustand](https://zustand-demo.pmnd.rs/) - Small, fast and scalable state-management.
    *   [Framer Motion](https://www.framer.com/motion/) - A production-ready motion library for React.

*   **Backend:**
    *   [Hono](https://hono.dev/) - A small, simple, and ultrafast web framework for the Edge.
    *   [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment.
    *   [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) - Provides low-latency coordination and consistent storage.

*   **Language:**
    *   [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/) package manager
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) - The Cloudflare command-line tool.

```bash
bun install -g wrangler
```

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/apex-status.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd apex-status
    ```
3.  Install dependencies:
    ```bash
    bun install
    ```

### Local Development

To run the application locally, which includes the Vite dev server for the frontend and the Wrangler dev server for the backend worker, use the following command:

```bash
wrangler dev
```

This will start the development server, typically available at `http://localhost:8788`. The command handles live reloading for both the frontend and backend code.

## Project Structure

*   `src/`: Contains the frontend React application source code.
    *   `components/`: Reusable UI components.
    *   `pages/`: Top-level page components.
    *   `lib/`: Utility functions and API client.
*   `worker/`: Contains the backend Hono application for the Cloudflare Worker.
*   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend.

## Deployment

This application is designed for easy deployment to the Cloudflare network.

### One-Click Deploy

You can deploy this project to your own Cloudflare account with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ensighttim-dotcom/generated-app-20251003-204937)

### Manual Deployment via CLI

1.  **Login to Cloudflare:**
    If you haven't already, authenticate Wrangler with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Build the application:**
    This command bundles both the frontend and backend for production.
    ```bash
    bun run build
    ```

3.  **Deploy to Cloudflare:**
    This command publishes your application to your Cloudflare account.
    ```bash
    wrangler deploy
    ```

After deployment, Wrangler will provide you with the URL to your live application.