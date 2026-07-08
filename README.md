# Multi-Tier Kubernetes Load-Balancer Setup

This repository contains a multi-tier Kubernetes application architecture featuring:
1. **HAProxy Reverse Proxy:** Configured with a ConfigMap and dynamic DNS service discovery to balance traffic using round-robin directly across individual application pods.
2. **Node.js Application Tier:** 3 replicated Node.js pods running on Node 18 Alpine, built via an optimized multi-stage Docker build.
3. **Database Tier:** A PostgreSQL 15 database instance with injected environment variables.

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
* [Docker](https://www.docker.com/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/)
* A local Kubernetes cluster (e.g., [Minikube](https://minikube.sigs.k8s.io/) or [Kind](https://kind.sigs.k8s.io/))

---

## Setup Instructions

### 1. Start your Kubernetes Cluster
If you are using Minikube, start your cluster:
```bash
minikube start
```

### 2. Configure Docker Daemon Environment
If you are using Minikube, configure your shell to build images directly inside the Minikube Docker environment (so Kubernetes can access your local images without pushing them to a remote registry):
```bash
eval $(minikube docker-env)
```

### 3. Build the Docker Image
Build the Node.js application image using the optimized multi-stage Dockerfile:
```bash
docker build -t kiyoboy/loadbalancer:1.0 .
```

### 4. Deploy Manifests to Kubernetes
Apply the configuration files in the correct sequence (they will automatically load from the `kubernetes/` folder):
```bash
kubectl apply -f kubernetes/
```
This command deploys:
- **ConfigMap:** Injected database details (`ENVIRONMENT`, `DB_HOST`, `DB_USER`, `DB_PORT`, `DB_NAME`, `DB_PASSWORD`).
- **Node.js Deployment & Headless Service:** Spawns 3 replica pods and registers them under a headless service for HAProxy DNS resolution.
- **HAProxy Deployment & NodePort Service:** Exposes external HTTP traffic on port `30080`.
- **PostgreSQL 15 Deployment & Service:** Boots the relational database.

---

## Verification & Testing

### 1. Access the Application
To access the application through the HAProxy load balancer:

* **Using Minikube:** Run the following command to retrieve the service URL:
  ```bash
  minikube service haproxy-service
  ```
* **Using Kind / Docker Desktop:** Access the application directly in your browser at:
  ```
  http://localhost:30080
  ```

### 2. Verify Load Balancing (Round-Robin)
When you access the webpage, you will see host and environment metadata. To verify HAProxy is load-balancing across the replica pods:
- Refresh the page multiple times, or run a `curl` query in your terminal:
  ```bash
  while true; do curl -s http://<HAProxy-IP>:<Port> | grep "Server ID"; sleep 1; done
  ```
- You should observe the **Server ID** (matching the Pod hostname) cycle through 3 distinct pod names in a round-robin order.

### 3. Verify Database Integration
- The webpage displays a **Database Connection** status.
- Once the PostgreSQL container is fully initialized, the status will show **Connected** along with the current database system time.
