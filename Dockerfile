FROM alpine:latest

# Install required packages
RUN apk add --no-cache curl unzip ca-certificates bash

WORKDIR /app

# Download and extract PocketBase with better error handling
RUN echo "Downloading PocketBase..." && \
    curl -L -o pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip" && \
    echo "Downloaded successfully. Extracting..." && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase && \
    echo "PocketBase setup complete:" && \
    ls -la /app/ && \
    ./pocketbase --version

# Copy schema if exists (optional)
COPY pocketbase_schema.json* ./

# Create data directory with proper permissions
RUN mkdir -p pb_data && chmod 755 pb_data

# Verify PocketBase executable
RUN echo "Final verification:" && ls -la /app/pocketbase

EXPOSE 8090

# Run PocketBase with full path
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/pb_data"]
