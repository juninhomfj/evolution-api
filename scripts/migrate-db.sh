#!/bin/bash

set -e

echo "========================================"
echo " Iniciando migration do banco (Prisma)"
echo "========================================"

if [ -z "$DATABASE_CONNECTION_URI" ]; then
  echo "ERRO: DATABASE_CONNECTION_URI não está definida"
  exit 1
fi

echo "DATABASE_CONNECTION_URI encontrada"

npx prisma generate
npx prisma migrate deploy

echo "========================================"
echo " Migration concluída com sucesso"
echo "========================================"
