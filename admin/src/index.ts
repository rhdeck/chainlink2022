import { createApiClient } from "dots-wrapper";
import { generateKeyPair } from "crypto";
import { ssh, pki } from "node-forge";
import { existsSync, readFileSync, unlinkSync } from "fs";
import { NodeSSH } from "node-ssh";
import dotenv from "dotenv";

dotenv.config();
type KeyPair = {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
};
const token = process.env.DO_TOKEN || "";
if (!token) throw new Error("DO_TOKEN not set");
const droplet_prefix = "droplet";
const STANDARD_IMAGE = "ubuntu-20-04-x64";
//#region Digital Ocean Droplet Creation
async function makeKeyPair() {
  let reject = (reason: any) => {
    console.error("this will never happen - rejected", reason);
  };
  let resolve = (value: KeyPair) => {
    console.error("this will never happen - resolved", value);
  };
  const promise = new Promise<KeyPair>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  const passphrase = "bibble";
  generateKeyPair(
    "rsa",
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase,
      },
    },
    (err, _publicKey, _privateKey) => {
      // Handle errors and use the generated key pair.
      if (err) reject(err);
      const publicKey = ssh.publicKeyToOpenSSH(
        pki.publicKeyFromPem(_publicKey)
      );
      // console.log({ publicKey });
      const fingerprint = pki.getPublicKeyFingerprint(
        pki.publicKeyFromPem(_publicKey),
        {
          encoding: "hex",
          delimiter: ":",
        }
      );
      // console.log("private key is", _privateKey);
      const privateKey = ssh.privateKeyToOpenSSH(
        pki.decryptRsaPrivateKey(_privateKey, passphrase)
      );
      // console.log(privateKey);
      resolve({ publicKey, privateKey, fingerprint });
    }
  );
  return promise;
}
export async function sleep(ms: number) {
  console.time("sleep");
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      console.timeEnd("sleep");
      resolve();
    }, ms)
  );
}
let staticClient: Awaited<ReturnType<typeof createApiClient>> | undefined;
async function getClient() {
  if (staticClient) return staticClient;
  const dots = await createApiClient({ token });
  staticClient = dots;
  return dots;
}
export async function getDropletByName(name: string) {
  const dots = await getClient();
  const droplets = await dots.droplet.listDroplets({});
  return droplets.data.droplets.find((d) => d.name === name);
}
export async function getDropletByKey(key: string) {
  return getDropletByName(`${droplet_prefix}-${key}`);
}

function makeUserData(key: string) {
  const mumbai_key = process.env.ALCHEMY_MUMBAI_KEY;
  const polygon_key = process.env.ALCHEMY_POLYGON_KEY;

  const userData = `#!/bin/bash
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
          --ws-url wss://polygon-mainnet.g.alchemy.com/v2/${mumbai_key} \
          --http-url https://polygon-mainnet.g.alchemy.com/v2/${mumbai_key} \
          --type primary \
          --chain-id 42
  "
  docker exec chainlink /bin/bash -c "\
      chainlink admin login --file /chainlink/.api && \
      chainlink chains evm create -id 80001 \"{}\" ;
      chainlink nodes evm create \
          --name alchemy_mumbai \
          --ws-url wss://polygon-mumbai.g.alchemy.com/v2/${polygon_key} \
          --http-url https://polygon-mumbai.g.alchemy.com/v2/${polygon_key} \
          --type primary \
          --chain-id 80001
  "
  curl https://hooks.zapier.com/hooks/catch/5907640/bkvrzcy/
`;
  return userData;
}
export async function createDroplet(key: string) {
  const dots = await getClient();
  const { publicKey, privateKey, fingerprint } = await makeKeyPair();
  // console.log("Public key is ", publicKey);
  const keyResponse = await await dots.sshKey.createSshKey({
    name: `key_${key}`,
    public_key: publicKey,
  });
  const id = keyResponse.data.ssh_key.id;
  const user_data = makeUserData(key);
  const response = await dots.droplet.createDroplet({
    image: STANDARD_IMAGE,
    region: "nyc3",
    size: "s-1vcpu-2gb",
    name: `polynodes-${key}`,
    backups: false,
    monitoring: false,
    ssh_keys: [id],
    user_data,
    tags: ["uninitialized", `droplet-${key}`],
  });
  const droplet = response.data.droplet;
  return { id: droplet.id, keyId: id, droplet, privateKey };
}
export async function destroyDroplet(droplet_id: number) {
  const dots = await getClient();
  await dots.droplet.destroyDropletAndAllAssociatedResources({
    droplet_id,
    acknowledge: true,
  });
}
export async function rebuildDroplet(
  droplet_id: number,
  toImage: string | number = STANDARD_IMAGE
) {
  const dots = await createApiClient({ token });
  await dots.droplet.rebuildDroplet({
    droplet_id,
    image: toImage,
  });
}
export async function sshTo(droplet_id: number, privateKey: string) {
  const dots = await getClient();
  const infoResponse = await dots.droplet.getDroplet({
    droplet_id,
  });
  const ip_address = infoResponse.data.droplet.networks.v4.find((network) => {
    return network.type === "public";
  })?.ip_address;
  const ssh = new NodeSSH();
  await ssh.connect({
    host: ip_address,
    username: "root",
    privateKey,
    readyTimeout: 10000,
  });
  if (!ssh.isConnected()) {
    throw new Error("Could not connect to ssh");
  }
  return {
    command: (command: string) => sshCommand(ssh, command),
    close: () => ssh.dispose(),
    ssh,
  };
}
export async function sshCommand(ssh: NodeSSH, command: string) {
  console.log("Running ssh command", command);
  const result = await ssh.execCommand(command);
  console.log("returned", result);
  return result;
}
//#endregion
//#region Managing external adapters
export async function deployCode(options: {
  droplet_id: number;
  username: string;
  privateKey: string;
  hash: string;
  path: string;
}) {
  const { droplet_id, hash, path, privateKey, username } = options;
  const dots = await getClient();
  const {
    data: {
      droplet: {
        name: key,
        networks: { v4: networks },
      },
    },
  } = await dots.droplet.getDroplet({ droplet_id });
  const ip_address = networks.find((network) => {
    return network.type === "public";
  })?.ip_address;
  if (!ip_address) throw new Error("no ip address found");
  const ssh = new NodeSSH();
  try {
    try {
      await ssh.connect({
        host: ip_address,
        username,
        privateKey,
        hostHash: "sha1",
        readyTimeout: 10000,
        hostVerifier: (thisHash, resolve) => {
          if (hash === thisHash) resolve(true);
          resolve(false);
        },
      });
    } catch (e) {}
    // Now make a directory
    await ssh.execCommand(`rm -rf /root/code`);
    await ssh.mkdir(`/root/code`);
    await ssh.execCommand(`cd /root/code`);
    await ssh.putDirectory(path, "/root/code");
    ssh.dispose();
  } catch (e) {}
}
//#endregion
