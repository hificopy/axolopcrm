#!/bin/bash

# Script to generate SSL certificates for axolop.hopto.org
# This should be run before starting the Docker containers

set -e

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/axolop.hopto.org.key 2048

# Generate certificate signing request
openssl req -new -key ssl/axolop.hopto.org.key -out ssl/axolop.hopto.org.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=axolop.hopto.org"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in ssl/axolop.hopto.org.csr -signkey ssl/axolop.hopto.org.key -out ssl/axolop.hopto.org.crt

echo "SSL certificates generated successfully!"
echo "Files created:"
echo "  - ssl/axolop.hopto.org.key (private key)"
echo "  - ssl/axolop.hopto.org.crt (certificate)"
echo ""
echo "Now you can run: docker-compose up -d"