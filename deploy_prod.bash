
echo "Deploying to Atelier to Production from master"

cd /var/www/linx571.ewi.utwente.nl/atelier-core \
&& pm2 stop npm  \
&& git checkout master \
&& git pull \
&& npm i \
&& npm run build \
&& pm2 stop npm  \
echo "Atelier Deployed"
