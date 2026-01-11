#!/bin/bash
set -e
echo 'Building...'
npm run build
echo 'Deploying...'
kubectl apply -f k8s/
echo 'Done!'