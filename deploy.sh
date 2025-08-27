#!/bin/bash

git reset --hard 
git checkout master 
git pull origin main
docker compose up -d