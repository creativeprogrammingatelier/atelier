#!/bin/bash
echo "Deploying to Atelier to Production from master"

pm2 stop npm 
cd /var/www/linux571.ewi.utwente.nl/atelier
echo ‘post-receive: git check out…’
git --git-dir=/var/www/linux571.ewi.utwente.nl/atelier.git --work-tree=/var/www/linux571.ewi.utwente.nl/atelier checkout master -f



npm i 
npm run build-all
pm2 start npm  
echo "Atelier Deployed"


