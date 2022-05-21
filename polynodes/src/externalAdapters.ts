//#region Managing external adapters

import { readFileSync, writeFileSync } from "fs";
import { NodeSSH } from "node-ssh";
import { escape } from "./utils";
//copy a directory
export async function deploy(ssh: NodeSSH, path: string, targetPath: string) {
  await ssh.putDirectory(path, targetPath);
  console.log("Hooray! Deployed directory");
}
export async function yarnInstall(ssh: NodeSSH, path: string) {
  const output = await ssh.execCommand(`cd ${path} && yarn install`);
  console.log("Hooray! Installed dependencies", output.stdout, output.stderr);
  return output.stdout;
}
export async function getEnvKeys(ssh: NodeSSH, path: string) {
  const output = await ssh.execCommand(`cd ${path} && yarn -s keys`);
  return output.stdout;
}
export async function addEnvKey(
  ssh: NodeSSH,
  path: string,
  key: string,
  value: string
) {
  const output = await ssh.execCommand(
    `cd ${path} && echo "${key}=${escape(value)}" >> .env`
  );
  return output.stdout;
}
export async function restart(ssh: NodeSSH, path: string) {
  const output = await ssh.execCommand(
    `cd ${path} && yarn stop; yarn start > output.log 2>&1 &`
  );
  console.log("Hooray! Restarted adapter", output.stdout, output.stderr);
  return output.stdout;
}
export async function check(ssh: NodeSSH, path: string) {
  const output = await ssh.execCommand(`cd ${path} && yarn status`);
  return output.stdout;
}

export function compileTemplate(name: string, sourceText: string) {
  const template = readFileSync("app_template.js", "utf8");
  const compiled = template.replace("//#mycode", sourceText);
  return compiled;
}
export async function uploadTemplate(
  ssh: NodeSSH,
  name: string,
  source: string
) {
  const tmpfile = `/tmp/${name}.js`;
  writeFileSync(tmpfile, source);
  const remoteFile = `/root/assets/endpoints/${name}.js`;
  await ssh.putFile(tmpfile, remoteFile);
}

// export async function deployCode(options: {
//   droplet_id: number;
//   username: string;
//   privateKey: string;
//   hash: string;
//   path: string;
// }) {
//   const { droplet_id, hash, path, privateKey, username } = options;
//   const dots = await getClient();
//   const {
//     data: {
//       droplet: {
//         name: key,
//         networks: { v4: networks },
//       },
//     },
//   } = await dots.droplet.getDroplet({ droplet_id });
//   const ip_address = networks.find((network) => {
//     return network.type === "public";
//   })?.ip_address;
//   if (!ip_address) throw new Error("no ip address found");
//   const ssh = new NodeSSH();
//   try {
//     try {
//       await ssh.connect({
//         host: ip_address,
//         username,
//         privateKey,
//         hostHash: "sha1",
//         readyTimeout: 10000,
//         hostVerifier: (thisHash, resolve) => {
//           if (hash === thisHash) resolve(true);
//           resolve(false);
//         },
//       });
//     } catch (e) {}
//     // Now make a directory
//     await ssh.execCommand(`rm -rf /root/code`);
//     await ssh.mkdir(`/root/code`);
//     await ssh.execCommand(`cd /root/code`);
//     await ssh.putDirectory(path, "/root/code");
//     ssh.dispose();
//   } catch (e) {}
// }
//#endregion
