#!/bin/bash
echo "Deploying to Atelier to Production from master"

pm2 stop npm 
cd /var/www/linux571.ewi.utwente.nl/atelier
echo "Updating repo from git"
git --git-dir=/var/www/linux571.ewi.utwente.nl/atelier.git --work-tree=/var/www/linux571.ewi.utwente.nl/atelier checkout master -f
echo "NPM install"
npm i 
npm run prod-build
pm2 delete "atelier" || true
pm2 start npm --name "atelier"  -- start
echo "Atelier Deployed"


