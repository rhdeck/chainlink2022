import { createApiClient } from "dots-wrapper";
import { generateKeyPair } from "crypto";
import { ssh, pki } from "node-forge";
import { readFileSync } from "fs";
import { NodeSSH } from "node-ssh";
import mustache from "mustache";
import { join } from "path";
import { loadStringAsset } from "@raydeck/local-assets";
import { validateKey } from "./utils";
type KeyPair = {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
};
let droplet_prefix = "polynodes";
export function setPrefix(prefix: string) {
  droplet_prefix = prefix;
}
export function getPrefix() {
  return droplet_prefix;
}
const STANDARD_IMAGE = "ubuntu-20-04-x64";
async function createDOClient() {
  const token = process.env.DO_TOKEN || "";
  if (!token) throw new Error("DO_TOKEN not set");
  const client = createApiClient({
    token,
  });
  return client;
}
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

let staticClient: Awaited<ReturnType<typeof createApiClient>> | undefined;
async function getClient() {
  if (staticClient) return staticClient;
  const dots = await createDOClient();
  staticClient = dots;
  return dots;
}
export async function getDroplets() {
  const dots = await getClient();
  const droplets = await dots.droplet.listDroplets({});
  return droplets.data.droplets
    .filter((d) => d.name.startsWith(droplet_prefix))
    .map((d) => ({ ...d, key: d.name.replace(`${droplet_prefix}-`, "") }));
}
export async function getDropletByName(name: string) {
  const droplets = await getDroplets();
  return droplets.find((d) => d.name === name);
}
export async function getDropletByKey(key: string) {
  return getDropletByName(`${droplet_prefix}-${key}`);
}
async function makeUserData(key: string) {
  const userData = mustache.render(await loadStringAsset("user-data.sh"), {
    ...process.env,
    key,
  });
  return userData;
}
export async function createDroplet(key: string) {
  if (!validateKey(key))
    throw new Error("invalid key - must be letters and numbers only");
  const dots = await getClient();
  const { publicKey, privateKey, fingerprint } = await makeKeyPair();
  // console.log("Public key is ", publicKey);
  const keyResponse = await await dots.sshKey.createSshKey({
    name: `key_${key}`,
    public_key: publicKey,
  });
  const id = keyResponse.data.ssh_key.id;
  const user_data = await makeUserData(key);
  console.log(user_data);
  // process.exit();
  const response = await dots.droplet.createDroplet({
    image: STANDARD_IMAGE,
    region: "nyc3",
    size: "s-1vcpu-2gb",
    name: `${droplet_prefix}-${key}`,
    backups: false,
    monitoring: false,
    ssh_keys: [id],
    user_data,
    tags: ["uninitialized", `${droplet_prefix}-${key}`],
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
  const dots = await createDOClient();
  await dots.droplet.rebuildDroplet({
    droplet_id,
    image: toImage,
  });
}
let getPrivateKey = async (key: string): Promise<string> => {
  const privateKey = readFileSync(`${key}_root_private.key`, "utf-8");
  return privateKey;
};
export function setGetPrivateKey(newFunc: typeof getPrivateKey) {
  getPrivateKey = newFunc;
}
export async function sshTo(key: string) {
  //get the ID
  const droplet = await getDropletByKey(key);
  if (!droplet) throw new Error("No droplet found");
  const { id } = droplet;
  const privateKey = await getPrivateKey(key);
  const obj = await sshToId(id, privateKey);
  return obj;
}
export async function sshToId(droplet_id: number, privateKey: string) {
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
