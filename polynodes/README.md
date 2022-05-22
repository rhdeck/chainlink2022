
<a name="readmemd"></a>

Template for making easy-to-work-with tempates

# Polynodes Admin
Controls the deployment and administration of polynodes via Digital Ocean API

<a name="_librarymd"></a>

@polynodes/core - v1.0.0

# @polynodes/core - v1.0.0

## Table of contents

### References

- [dotgraph_ChainlinkDOTGraph](#dotgraph_chainlinkdotgraph)

### Classes

- [chainlinkvariable_ChainlinkVariable](#classeschainlinkvariable_chainlinkvariablemd)
- [dotgraph](#classesdotgraphmd)

### Variables

- [chainlink_Bridges](#chainlink_bridges)
- [chainlink_Chains](#chainlink_chains)
- [chainlink_Jobs](#chainlink_jobs)
- [chainlink_Nodes](#chainlink_nodes)
- [dotgraph_Steps](#dotgraph_steps)

### Functions

- [chainlink_command](#chainlink_command)
- [chainlink_copy](#chainlink_copy)
- [chainlink_createBridge](#chainlink_createbridge)
- [chainlink_createEVMChain](#chainlink_createevmchain)
- [chainlink_createEVMNode](#chainlink_createevmnode)
- [chainlink_createJob](#chainlink_createjob)
- [chainlink_createJobToml](#chainlink_createjobtoml)
- [chainlink_deleteBridge](#chainlink_deletebridge)
- [chainlink_deleteJob](#chainlink_deletejob)
- [chainlink_getBridge](#chainlink_getbridge)
- [chainlink_getJob](#chainlink_getjob)
- [chainlink_listBridges](#chainlink_listbridges)
- [chainlink_listJobs](#chainlink_listjobs)
- [chainlink_login](#chainlink_login)
- [do_createDroplet](#do_createdroplet)
- [do_destroyDroplet](#do_destroydroplet)
- [do_getDropletByKey](#do_getdropletbykey)
- [do_getDropletByName](#do_getdropletbyname)
- [do_getDroplets](#do_getdroplets)
- [do_getPrefix](#do_getprefix)
- [do_rebuildDroplet](#do_rebuilddroplet)
- [do_setGetPrivateKey](#do_setgetprivatekey)
- [do_setPrefix](#do_setprefix)
- [do_sshCommand](#do_sshcommand)
- [do_sshTo](#do_sshto)
- [do_sshToId](#do_sshtoid)
- [dotgraph_addToGraph](#dotgraph_addtograph)
- [dotgraph_compileDOTGraph](#dotgraph_compiledotgraph)
- [dotgraph_stringifyDOTDefinition](#dotgraph_stringifydotdefinition)
- [dotgraph_stringifyDOTJSON](#dotgraph_stringifydotjson)
- [externalAdapters_addEnvKey](#externaladapters_addenvkey)
- [externalAdapters_check](#externaladapters_check)
- [externalAdapters_compileTemplate](#externaladapters_compiletemplate)
- [externalAdapters_deploy](#externaladapters_deploy)
- [externalAdapters_getEnvKeys](#externaladapters_getenvkeys)
- [externalAdapters_restart](#externaladapters_restart)
- [externalAdapters_uploadTemplate](#externaladapters_uploadtemplate)
- [externalAdapters_yarnInstall](#externaladapters_yarninstall)
- [utils_escape](#utils_escape)
- [utils_sleep](#utils_sleep)

## References

### dotgraph\_ChainlinkDOTGraph

• **dotgraph\_ChainlinkDOTGraph**: `Object`

#### Defined in

[src/index.ts:89](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/index.ts#L89)

## Variables

### chainlink\_Bridges

• **chainlink\_Bridges**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `create` | (`ssh`: `NodeSSH`, `__namedParameters`: { `confirmations?`: `number` ; `minimumContractPayment?`: `string` ; `name`: `string` ; `url`: `string`  }) => `Promise`<`undefined` \| `ChainlinkBridge`\> |
| `delete` | (`ssh`: `NodeSSH`, `id`: `number`) => `Promise`<`ChainlinkBridge`\> |
| `get` | (`ssh`: `NodeSSH`, `id`: `number`) => `Promise`<`ChainlinkBridge`\> |
| `list` | (`ssh`: `NodeSSH`) => `Promise`<`ChainlinkBridge`[]\> |

#### Defined in

[src/chainlink.ts:152](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L152)

___

### chainlink\_Chains

• **chainlink\_Chains**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `evm` | `Object` |
| `evm.create` | (`ssh`: `NodeSSH`, `chainId`: `string`, `options`: `Record`<`string`, `any`\>) => `Promise`<`any`\> |

#### Defined in

[src/chainlink.ts:50](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L50)

___

### chainlink\_Jobs

• **chainlink\_Jobs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `create` | (`ssh`: `NodeSSH`, `o`: { `contractAddress`: `string` ; `evmChainID`: `number` ; `externalJobID?`: `string` ; `graph`: [`dotgraph`](#classesdotgraphmd) ; `minContractPaymentLinkJuels?`: `number` ; `name`: `string` ; `requesters?`: `string`[] ; `type`: ``"directrequest"``  }) => `Promise`<`any`\> |
| `delete` | (`ssh`: `NodeSSH`, `id`: `string`) => `Promise`<`void`\> |
| `get` | (`ssh`: `NodeSSH`, `id`: `string`) => `Promise`<`any`\> |
| `list` | (`ssh`: `NodeSSH`) => `Promise`<`any`\> |

#### Defined in

[src/chainlink.ts:256](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L256)

___

### chainlink\_Nodes

• **chainlink\_Nodes**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `evm` | `Object` |
| `evm.create` | (`ssh`: `NodeSSH`, `__namedParameters`: { `chainId`: `number` ; `httpUrl?`: `string` ; `name`: `string` ; `type`: ``"primary"`` \| ``"secondary"`` ; `wsUrl`: `string`  }) => `Promise`<`any`\> |

#### Defined in

[src/chainlink.ts:83](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L83)

___

### dotgraph\_Steps

• **dotgraph\_Steps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bridgeBase` | (`name`: `string`, `requestData`: `Record`<`string`, `any`\>) => `ChainlinkDOTGraphDefinitionObject` |
| `decode_cbor` | `ChainlinkDOTGraphDefinitionObject` |
| `decode_log` | `ChainlinkDOTGraphDefinitionObject` |
| `encode_data_uint` | (`previousKey`: `string`) => `ChainlinkDOTGraphDefinitionObject` |
| `encode_tx` | `ChainlinkDOTGraphDefinitionObject` |
| `fetch` | `ChainlinkDOTGraphDefinitionObject` |
| `friendlyBridge` | (`name`: `string`, `requestData`: `Record`<`string`, `any`\>) => `ChainlinkDOTGraphDefinitionObject` |
| `multiply` | (`previous`: `string`) => `ChainlinkDOTGraphDefinitionObject` |
| `parse` | (`previousStep`: `string`) => `ChainlinkDOTGraphDefinitionObject` |
| `submit_tx` | (`oracleAddr`: `string`) => `ChainlinkDOTGraphDefinitionObject` |

#### Defined in

[src/dotgraph.ts:262](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L262)

## Functions

### chainlink\_command

▸ **chainlink_command**(`ssh`, `command`): `Promise`<`SSHExecCommandResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `command` | `string` |

#### Returns

`Promise`<`SSHExecCommandResponse`\>

#### Defined in

[src/chainlink.ts:15](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L15)

___

### chainlink\_copy

▸ **chainlink_copy**(`ssh`, `sourcePath`, `targetName?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `sourcePath` | `string` |
| `targetName?` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/chainlink.ts:21](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L21)

___

### chainlink\_createBridge

▸ **chainlink_createBridge**(`ssh`, `__namedParameters`): `Promise`<`undefined` \| `ChainlinkBridge`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `__namedParameters` | `Object` |
| `__namedParameters.confirmations?` | `number` |
| `__namedParameters.minimumContractPayment?` | `string` |
| `__namedParameters.name` | `string` |
| `__namedParameters.url` | `string` |

#### Returns

`Promise`<`undefined` \| `ChainlinkBridge`\>

#### Defined in

[src/chainlink.ts:99](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L99)

___

### chainlink\_createEVMChain

▸ **chainlink_createEVMChain**(`ssh`, `chainId`, `options?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `chainId` | `string` |
| `options` | `Record`<`string`, `any`\> |

#### Returns

`Promise`<`any`\>

#### Defined in

[src/chainlink.ts:35](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L35)

___

### chainlink\_createEVMNode

▸ **chainlink_createEVMNode**(`ssh`, `__namedParameters`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `__namedParameters` | `Object` |
| `__namedParameters.chainId` | `number` |
| `__namedParameters.httpUrl?` | `string` |
| `__namedParameters.name` | `string` |
| `__namedParameters.type` | ``"primary"`` \| ``"secondary"`` |
| `__namedParameters.wsUrl` | `string` |

#### Returns

`Promise`<`any`\>

#### Defined in

[src/chainlink.ts:55](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L55)

___

### chainlink\_createJob

▸ **chainlink_createJob**(`ssh`, `o`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `o` | `Object` |
| `o.contractAddress` | `string` |
| `o.evmChainID` | `number` |
| `o.externalJobID?` | `string` |
| `o.graph` | [`dotgraph`](#classesdotgraphmd) |
| `o.minContractPaymentLinkJuels?` | `number` |
| `o.name` | `string` |
| `o.requesters?` | `string`[] |
| `o.type` | ``"directrequest"`` |

#### Returns

`Promise`<`any`\>

#### Defined in

[src/chainlink.ts:201](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L201)

___

### chainlink\_createJobToml

▸ **chainlink_createJobToml**(`__namedParameters`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `ChainlinkJobDefinition` |

#### Returns

`string`

#### Defined in

[src/chainlink.ts:172](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L172)

___

### chainlink\_deleteBridge

▸ **chainlink_deleteBridge**(`ssh`, `id`): `Promise`<`ChainlinkBridge`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `id` | `number` |

#### Returns

`Promise`<`ChainlinkBridge`\>

#### Defined in

[src/chainlink.ts:137](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L137)

___

### chainlink\_deleteJob

▸ **chainlink_deleteJob**(`ssh`, `id`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `id` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/chainlink.ts:241](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L241)

___

### chainlink\_getBridge

▸ **chainlink_getBridge**(`ssh`, `id`): `Promise`<`ChainlinkBridge`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `id` | `number` |

#### Returns

`Promise`<`ChainlinkBridge`\>

#### Defined in

[src/chainlink.ts:132](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L132)

___

### chainlink\_getJob

▸ **chainlink_getJob**(`ssh`, `id`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `id` | `string` |

#### Returns

`Promise`<`any`\>

#### Defined in

[src/chainlink.ts:251](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L251)

___

### chainlink\_listBridges

▸ **chainlink_listBridges**(`ssh`): `Promise`<`ChainlinkBridge`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |

#### Returns

`Promise`<`ChainlinkBridge`[]\>

#### Defined in

[src/chainlink.ts:142](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L142)

___

### chainlink\_listJobs

▸ **chainlink_listJobs**(`ssh`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |

#### Returns

`Promise`<`any`\>

#### Defined in

[src/chainlink.ts:246](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L246)

___

### chainlink\_login

▸ **chainlink_login**(`ssh`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/chainlink.ts:9](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlink.ts#L9)

___

### do\_createDroplet

▸ **do_createDroplet**(`key`): `Promise`<`Object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`<`Object`\>

#### Defined in

[src/do.ts:111](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L111)

___

### do\_destroyDroplet

▸ **do_destroyDroplet**(`droplet_id`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `droplet_id` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/do.ts:137](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L137)

___

### do\_getDropletByKey

▸ **do_getDropletByKey**(`key`): `Promise`<`undefined` \| { `backup_ids`: `string`[] ; `created_at`: `string` ; `disk`: `number` ; `features`: `string`[] ; `id`: `number` ; `image`: `string` \| `number` \| `IImage` ; `kernel`: `IKernel` ; `key`: `string` ; `locked`: `boolean` ; `memory`: `number` ; `name`: `string` ; `networks`: `INetwork` ; `next_backup_window`: `object` ; `region`: `string` \| `IRegion` ; `size`: `ISize` ; `size_slug`: `string` ; `snapshot_ids`: `string`[] ; `status`: `string` ; `tags`: `string`[] ; `vcpus`: `number` ; `volume_ids`: `string`[] ; `vpc_uuid`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`<`undefined` \| { `backup_ids`: `string`[] ; `created_at`: `string` ; `disk`: `number` ; `features`: `string`[] ; `id`: `number` ; `image`: `string` \| `number` \| `IImage` ; `kernel`: `IKernel` ; `key`: `string` ; `locked`: `boolean` ; `memory`: `number` ; `name`: `string` ; `networks`: `INetwork` ; `next_backup_window`: `object` ; `region`: `string` \| `IRegion` ; `size`: `ISize` ; `size_slug`: `string` ; `snapshot_ids`: `string`[] ; `status`: `string` ; `tags`: `string`[] ; `vcpus`: `number` ; `volume_ids`: `string`[] ; `vpc_uuid`: `string`  }\>

#### Defined in

[src/do.ts:101](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L101)

___

### do\_getDropletByName

▸ **do_getDropletByName**(`name`): `Promise`<`undefined` \| { `backup_ids`: `string`[] ; `created_at`: `string` ; `disk`: `number` ; `features`: `string`[] ; `id`: `number` ; `image`: `string` \| `number` \| `IImage` ; `kernel`: `IKernel` ; `key`: `string` ; `locked`: `boolean` ; `memory`: `number` ; `name`: `string` ; `networks`: `INetwork` ; `next_backup_window`: `object` ; `region`: `string` \| `IRegion` ; `size`: `ISize` ; `size_slug`: `string` ; `snapshot_ids`: `string`[] ; `status`: `string` ; `tags`: `string`[] ; `vcpus`: `number` ; `volume_ids`: `string`[] ; `vpc_uuid`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`Promise`<`undefined` \| { `backup_ids`: `string`[] ; `created_at`: `string` ; `disk`: `number` ; `features`: `string`[] ; `id`: `number` ; `image`: `string` \| `number` \| `IImage` ; `kernel`: `IKernel` ; `key`: `string` ; `locked`: `boolean` ; `memory`: `number` ; `name`: `string` ; `networks`: `INetwork` ; `next_backup_window`: `object` ; `region`: `string` \| `IRegion` ; `size`: `ISize` ; `size_slug`: `string` ; `snapshot_ids`: `string`[] ; `status`: `string` ; `tags`: `string`[] ; `vcpus`: `number` ; `volume_ids`: `string`[] ; `vpc_uuid`: `string`  }\>

#### Defined in

[src/do.ts:97](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L97)

___

### do\_getDroplets

▸ **do_getDroplets**(): `Promise`<{ `backup_ids`: `string`[] ; `created_at`: `string` ; `disk`: `number` ; `features`: `string`[] ; `id`: `number` ; `image`: `string` \| `number` \| `IImage` ; `kernel`: `IKernel` ; `key`: `string` ; `locked`: `boolean` ; `memory`: `number` ; `name`: `string` ; `networks`: `INetwork` ; `next_backup_window`: `object` ; `region`: `string` \| `IRegion` ; `size`: `ISize` ; `size_slug`: `string` ; `snapshot_ids`: `string`[] ; `status`: `string` ; `tags`: `string`[] ; `vcpus`: `number` ; `volume_ids`: `string`[] ; `vpc_uuid`: `string`  }[]\>

#### Returns

`Promise`<{ `backup_ids`: `string`[] ; `created_at`: `string` ; `disk`: `number` ; `features`: `string`[] ; `id`: `number` ; `image`: `string` \| `number` \| `IImage` ; `kernel`: `IKernel` ; `key`: `string` ; `locked`: `boolean` ; `memory`: `number` ; `name`: `string` ; `networks`: `INetwork` ; `next_backup_window`: `object` ; `region`: `string` \| `IRegion` ; `size`: `ISize` ; `size_slug`: `string` ; `snapshot_ids`: `string`[] ; `status`: `string` ; `tags`: `string`[] ; `vcpus`: `number` ; `volume_ids`: `string`[] ; `vpc_uuid`: `string`  }[]\>

#### Defined in

[src/do.ts:90](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L90)

___

### do\_getPrefix

▸ **do_getPrefix**(): `string`

#### Returns

`string`

#### Defined in

[src/do.ts:18](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L18)

___

### do\_rebuildDroplet

▸ **do_rebuildDroplet**(`droplet_id`, `toImage?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `droplet_id` | `number` | `undefined` |
| `toImage` | `string` \| `number` | `STANDARD_IMAGE` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/do.ts:144](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L144)

___

### do\_setGetPrivateKey

▸ **do_setGetPrivateKey**(`newFunc`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newFunc` | (`key`: `string`) => `Promise`<`string`\> |

#### Returns

`void`

#### Defined in

[src/do.ts:158](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L158)

___

### do\_setPrefix

▸ **do_setPrefix**(`prefix`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |

#### Returns

`void`

#### Defined in

[src/do.ts:15](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L15)

___

### do\_sshCommand

▸ **do_sshCommand**(`ssh`, `command`): `Promise`<`SSHExecCommandResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `command` | `string` |

#### Returns

`Promise`<`SSHExecCommandResponse`\>

#### Defined in

[src/do.ts:194](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L194)

___

### do\_sshTo

▸ **do_sshTo**(`key`): `Promise`<`Object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`<`Object`\>

#### Defined in

[src/do.ts:161](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L161)

___

### do\_sshToId

▸ **do_sshToId**(`droplet_id`, `privateKey`): `Promise`<`Object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `droplet_id` | `number` |
| `privateKey` | `string` |

#### Returns

`Promise`<`Object`\>

#### Defined in

[src/do.ts:170](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/do.ts#L170)

___

### dotgraph\_addToGraph

▸ **dotgraph_addToGraph**(`graph`, `name`, `data`): [`dotgraph`](#classesdotgraphmd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `graph` | [`dotgraph`](#classesdotgraphmd) |
| `name` | `string` |
| `data` | `ChainlinkDOTGraphDefinition` |

#### Returns

[`dotgraph`](#classesdotgraphmd)

#### Defined in

[src/dotgraph.ts:49](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L49)

___

### dotgraph\_compileDOTGraph

▸ **dotgraph_compileDOTGraph**(`graph`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `graph` | [`dotgraph`](#classesdotgraphmd) |

#### Returns

`string`

#### Defined in

[src/dotgraph.ts:116](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L116)

___

### dotgraph\_stringifyDOTDefinition

▸ **dotgraph_stringifyDOTDefinition**(`src`, `padding`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `src` | `ChainlinkDOTGraphDefinition` |
| `padding` | `number` |

#### Returns

`string`

#### Defined in

[src/dotgraph.ts:90](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L90)

___

### dotgraph\_stringifyDOTJSON

▸ **dotgraph_stringifyDOTJSON**(`src`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `src` | `Record`<`string`, `any`\> |

#### Returns

`string`

#### Defined in

[src/dotgraph.ts:58](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L58)

___

### externalAdapters\_addEnvKey

▸ **externalAdapters_addEnvKey**(`ssh`, `path`, `key`, `value`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `path` | `string` |
| `key` | `string` |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/externalAdapters.ts:21](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L21)

___

### externalAdapters\_check

▸ **externalAdapters_check**(`ssh`, `path`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `path` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/externalAdapters.ts:39](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L39)

___

### externalAdapters\_compileTemplate

▸ **externalAdapters_compileTemplate**(`name`, `sourceText`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `sourceText` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/externalAdapters.ts:44](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L44)

___

### externalAdapters\_deploy

▸ **externalAdapters_deploy**(`ssh`, `path`, `targetPath`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `path` | `string` |
| `targetPath` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/externalAdapters.ts:8](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L8)

___

### externalAdapters\_getEnvKeys

▸ **externalAdapters_getEnvKeys**(`ssh`, `path`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `path` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/externalAdapters.ts:17](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L17)

___

### externalAdapters\_restart

▸ **externalAdapters_restart**(`ssh`, `path`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `path` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/externalAdapters.ts:32](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L32)

___

### externalAdapters\_uploadTemplate

▸ **externalAdapters_uploadTemplate**(`ssh`, `name`, `source`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `name` | `string` |
| `source` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/externalAdapters.ts:49](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L49)

___

### externalAdapters\_yarnInstall

▸ **externalAdapters_yarnInstall**(`ssh`, `path`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ssh` | `NodeSSH` |
| `path` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/externalAdapters.ts:12](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/externalAdapters.ts#L12)

___

### utils\_escape

▸ **utils_escape**(`src`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `src` | `string` |

#### Returns

`string`

#### Defined in

[src/utils.ts:10](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/utils.ts#L10)

___

### utils\_sleep

▸ **utils_sleep**(`ms`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ms` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/utils.ts:1](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/utils.ts#L1)


<a name="classeschainlinkvariable_chainlinkvariablemd"></a>

[@polynodes/core - v1.0.0](#readmemd) / chainlinkvariable_ChainlinkVariable

# Class: chainlinkvariable\_ChainlinkVariable

## Table of contents

### Constructors

- [constructor](#constructor)

### Properties

- [name](#name)
- [toString](#tostring)
- [wrapInQuotes](#wrapinquotes)

## Constructors

### constructor

• **new chainlinkvariable_ChainlinkVariable**(`name`, `wrap?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `wrap` | `boolean` | `false` |

#### Defined in

[src/chainlinkvariable.ts:4](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlinkvariable.ts#L4)

## Properties

### name

• **name**: `string`

#### Defined in

[src/chainlinkvariable.ts:2](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlinkvariable.ts#L2)

___

### toString

• **toString**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

[src/chainlinkvariable.ts:8](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlinkvariable.ts#L8)

___

### wrapInQuotes

• **wrapInQuotes**: `boolean`

#### Defined in

[src/chainlinkvariable.ts:3](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/chainlinkvariable.ts#L3)


<a name="classesdotgraphmd"></a>

[@polynodes/core - v1.0.0](#readmemd) / dotgraph

# Class: dotgraph

## Table of contents

### Constructors

- [constructor](#constructor)

### Properties

- [definitions](#definitions)
- [steps](#steps)
- [Steps](#steps)

### Methods

- [add](#add)
- [addWithName](#addwithname)
- [toString](#tostring)

## Constructors

### constructor

• **new dotgraph**(`definitions?`, `steps?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `definitions` | `Record`<`string`, `ChainlinkDOTGraphDefinition`\> |
| `steps` | `string`[][] |

#### Defined in

[src/dotgraph.ts:26](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L26)

## Properties

### definitions

• **definitions**: `Record`<`string`, `ChainlinkDOTGraphDefinition`\> = `{}`

#### Defined in

[src/dotgraph.ts:24](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L24)

___

### steps

• **steps**: `string`[][]

#### Defined in

[src/dotgraph.ts:25](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L25)

___

### Steps

▪ `Static` **Steps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bridgeBase` | (`name`: `string`, `requestData`: `Record`<`string`, `any`\>) => `ChainlinkDOTGraphDefinitionObject` |
| `decode_cbor` | `ChainlinkDOTGraphDefinitionObject` |
| `decode_log` | `ChainlinkDOTGraphDefinitionObject` |
| `encode_data_uint` | (`previousKey`: `string`) => `ChainlinkDOTGraphDefinitionObject` |
| `encode_tx` | `ChainlinkDOTGraphDefinitionObject` |
| `fetch` | `ChainlinkDOTGraphDefinitionObject` |
| `friendlyBridge` | (`name`: `string`, `requestData`: `Record`<`string`, `any`\>) => `ChainlinkDOTGraphDefinitionObject` |
| `multiply` | (`previous`: `string`) => `ChainlinkDOTGraphDefinitionObject` |
| `parse` | (`previousStep`: `string`) => `ChainlinkDOTGraphDefinitionObject` |
| `submit_tx` | (`oracleAddr`: `string`) => `ChainlinkDOTGraphDefinitionObject` |

#### Defined in

[src/dotgraph.ts:47](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L47)

## Methods

### add

▸ **add**(`data`): [`dotgraph`](#classesdotgraphmd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `ChainlinkDOTGraphDefinitionObject` \| (`graph`: [`dotgraph`](#classesdotgraphmd)) => [`dotgraph`](#classesdotgraphmd) |

#### Returns

[`dotgraph`](#classesdotgraphmd)

#### Defined in

[src/dotgraph.ts:36](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L36)

___

### addWithName

▸ **addWithName**(`name`, `data`): [`dotgraph`](#classesdotgraphmd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `data` | `ChainlinkDOTGraphDefinition` |

#### Returns

[`dotgraph`](#classesdotgraphmd)

#### Defined in

[src/dotgraph.ts:33](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L33)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/dotgraph.ts:44](https://github.com/rhdeck/chainlink2022/blob/6db65fd/polynodes/src/dotgraph.ts#L44)
