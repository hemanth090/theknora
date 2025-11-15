# Build stage
FROM rust:1.75 as builder

WORKDIR /app/backend

# Copy manifests
COPY backend/Cargo.toml ./Cargo.toml
COPY backend/Cargo.lock ./Cargo.lock

# Copy source code
COPY backend/src ./src

# Build for release
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/backend/target/release/knora-backend /app/knora-backend

# Create data directories
RUN mkdir -p /app/data/uploads /app/data/vector_store

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the binary
CMD ["/app/knora-backend"]
