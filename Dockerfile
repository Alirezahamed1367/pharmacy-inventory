FROM alpine:latest

# Install required packages
RUN apk add --no-cache curl unzip ca-certificates bash

WORKDIR /app

# Download and extract PocketBase with complete cleanup
RUN echo "Starting fresh PocketBase installation..." && \
    curl -L -o pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip" && \
    echo "Downloaded successfully. Extracting..." && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase && \
    echo "PocketBase setup complete:" && \
    ls -la /app/pocketbase

# Ensure completely clean database directory
RUN rm -rf /app/pb_data && mkdir -p /app/pb_data && chmod 755 /app/pb_data

# Copy reset trigger (this changes on each reset to force rebuild)
COPY db_reset_trigger.txt ./

EXPOSE 8090

# Start PocketBase with clean database
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/pb_data"]
