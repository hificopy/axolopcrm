#!/bin/bash

echo "Fixing npm cache permissions..."
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
echo "✅ npm cache permissions fixed"
