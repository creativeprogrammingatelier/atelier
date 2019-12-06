#!/bin/bash
echo "Deploying to Atelier to Production from master"

cd #/var/www/linx571.ewi.utwente.nl/atelier-core 
pm2 stop npm 
git checkout master
git pull 
npm i 
npm run build-all
pm2 start npm  
echo "Atelier Deployed"



