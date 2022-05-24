//#region Managing external adapters

import { readFileSync, writeFileSync } from "fs";
import { NodeSSH } from "node-ssh";
import { escape } from "./utils";
import { loadStringAsset } from "@raydeck/local-assets";
//copy a directory
export async function deploy(
  ssh: NodeSSH,
  path: string,
  targetPath: string = "/root/nodeserver"
) {
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
export async function restart(ssh: NodeSSH, path: string = "/root/nodeserver") {
  const cmd = `yarn stop`;
  console.log("Running stop cmd", cmd);
  const output = await ssh.execCommand(cmd, { cwd: path, execOptions: {} });
  console.log("On our way! Stopped adapter", output.stdout, output.stderr);
  const cmd2 = `nohup yarn start  >> /var/log/node.log 2>&1 < /dev/null &`;
  console.log("Running start cmd", cmd2);
  const output2 = await ssh.execCommand(cmd2, { cwd: path });
  console.log("Hooray! Restarted adapter", output2.stdout, output2.stderr);
  return output.stdout;
}
export async function check(ssh: NodeSSH, path: string) {
  const output = await ssh.execCommand(`cd ${path} && yarn status`);
  return output.stdout;
}

export async function compileTemplate(name: string, sourceText: string) {
  const template = await loadStringAsset("app_template.js");

  const compiled = template
    .replace("//#mycode", sourceText)
    .replace("//#name", `//Name of Endpoint: ${name}`);
  return compiled;
}
export async function uploadTemplate(
  ssh: NodeSSH,
  name: string,
  source: string,
  path: string = "/root/nodeserver"
) {
  const tmpfile = `/tmp/${name}.js`;
  writeFileSync(tmpfile, source);
  const remoteFile = `${path}/endpoints/${name}.js`;
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
