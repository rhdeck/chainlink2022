#!/bin/bash
curl -sSL https://get.docker.com/ | sh
sudo usermod -aG docker $USER
mkdir /root/postgres
docker create --name postgres --volume /root/postgres:/var/lib/postgresql -e PGDATA=/var/lib/postgresql/data -e POSTGRES_PASSWORD=chainlink --expose 5432 -it postgres
docker start postgres
apt-get -y install postgresql-client-12
echo "create database chainlink;" > initdb.sql
psql postgresql://postgres:chainlink@172.17.0.2:5432 -f initdb.sql 
mkdir /root/chainlink
echo "my_wallet_password" > /root/chainlink/.password
echo "user@example.com" >> /root/chainlink/.api
echo "password" >> /root/chainlink/.api
echo "OOT=/chainlink" >> /root/chainlink/.env
echo "LOG_LEVEL=debug" >> /root/chainlink/.env
#echo "ETH_CHAIN_ID=80001" >> /root/chainlink/.env
echo "CHAINLINK_TLS_PORT=0" >> /root/chainlink/.env
echo "SECURE_COOKIES=false" >> /root/chainlink/.env
echo "ALLOW_ORIGINS=*" >> /root/chainlink/.env
echo "DATABASE_URL=postgresql://postgres:chainlink@172.17.0.2:5432/chainlink?sslmode=disable" >> /root/chainlink/.env
docker create --expose 6688 -v ~/chainlink:/chainlink -it --env-file=/root/chainlink/.env --name chainlink -it smartcontract/chainlink:1.4.1-root local n -p /chainlink/.password -a /chainlink/.api
docker create --expose 6688 -v ~/chainlink:/chainlink -it --env-file=/root/chainlink/.env --name secondary -it smartcontract/chainlink:1.4.1-root local n -p /chainlink/.password -a /chainlink/.api
echo "#\!/bin/sh" >> /etc/init.d/polynodes 
echo "docker start postgres" >> /etc/init.d/polynodes
echo "docker start chainlink" >> /etc/init.d/polynodes
echo "docker start secondary" >> /etc/init.d/polynodes
echo "cd /root/repo/ExternalAdapterTemplate && yarn start >> /var/log/node.log 2>1 &" >> /etc/init.d/polynodes
chmod +x /etc/init.d/polynodes
docker stop postgres
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get update 
apt-get install -y nodejs
apt-get install -y yarn
git clone https://github.com/rhdeck/chainlink2022 /root/repo
cd /root/repo/ExternalAdapterTemplate
yarn
/etc/init.d/polynodes 
sleep 10
docker exec chainlink /bin/bash -c "\
    chainlink admin login --file /chainlink/.api && \
    chainlink chains evm create -id 42 \"{}\" ;
    chainlink nodes evm create \
        --name alchemy_polygon \
        --ws-url wss://polygon-mainnet.g.alchemy.com/v2/{{ALCHEMY_POLYGON_KEY}} \
        --http-url https://polygon-mainnet.g.alchemy.com/v2/{{ALCHEMY_POLYGON_KEY}} \
        --type primary \
        --chain-id 42
"
docker exec chainlink /bin/bash -c "\
    chainlink admin login --file /chainlink/.api && \
    chainlink chains evm create -id 80001 \"{}\" ;
    chainlink nodes evm create \
        --name alchemy_mumbai \
        --ws-url wss://polygon-mumbai.g.alchemy.com/v2/{{ALCHEMY_MUMBAI_KEY}} \
        --http-url https://polygon-mumbai.g.alchemy.com/v2/{{ALCHEMY_MUMBAI_KEY}} \
        --type primary \
        --chain-id 80001
"
curl {{ZAP_URL}}?key={{key}}