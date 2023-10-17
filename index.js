import tokens from "./private/tokens.json" assert { type: "json" }
import config from "./config.json" assert { type: "json" }
import { stringSimilarity } from "string-similarity-js"
import escapeStringRegexp from "escape-string-regexp"
import { createRequire } from "node:module"
import child_process from "child_process"
import Database from "better-sqlite3"
import Discord from "discord.js"
import path from "node:path"
import vm from "node:vm"
import fs from "node:fs"

//////////////////////////////////////////////////////////////////////////////////////

const scope = {
  escapeStringRegexp,
  stringSimilarity,
  child_process,
  Discord,
  tokens,
  fs
}

//////////////////////////////////////////////////////////////////////////////////////

config.save = () => {
  fs.writeFileSync("config.json", JSON.stringify(config, null, 2))
  return "Saved!"
}

globalThis.config = config
globalThis.testMode = process.argv.includes("-dev")
globalThis.database = new Database("database.db")
globalThis.db = (await import("./database/db.js")).default

//////////////////////////////////////////////////////////////////////////////////////

globalThis.getFiles = async function*(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

String.prototype.toTitleCase = function(c, n) {
  let t
  if (c) t = this.replace(/\s/g, "").replace(n ? /([A-Z])/g : /([A-Z0-9])/g, " $1").replace(/[_-]/g, " ")
  else t = this
  return t.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).trim()
}

String.prototype.limit = function(l = 128) {
  if (this.length <= l) return this
  return this.slice(0, l - 1) + "…"
}

//////////////////////////////////////////////////////////////////////////////////////

globalThis.client = new Discord.Client({
  shards: "auto",
  intents: [
    "Guilds",
    "GuildMembers",
    // "GuildBans",
    "GuildEmojisAndStickers",
    // "GuildIntegrations",
    // "GuildWebhooks",
    // "GuildInvites",
    // "GuildVoiceStates",
    // "GuildPresences",
    "GuildMessages",
    "GuildMessageReactions",
    // "GuildMessageTyping",
    "DirectMessages",
    // "DirectMessageReactions",
    // "DirectMessageTyping",
    "MessageContent",
    // "GuildScheduledEvents",
  ].map(e => Discord.GatewayIntentBits[e]),
  partials: [
    "User",
    "Channel",
    "GuildMember",
    "Message",
    "Reaction",
    // "GuildScheduledEvent",
    "ThreadMember"
  ].map(e => Discord.Partials[e])
})

//////////////////////////////////////////////////////////////////////////////////////

client.colours = {
  embed: config.colour,
  error: "#DD2E44",
  success: "#43B481"
}
client.stats = {}
client.modPermissions = [
  "ManageMessages",
  "ModerateMembers",
  "KickMembers",
  "BanMembers"
]
client.cooldowns = {}

Object.defineProperty(client, "totalUptime", {
  get: () => durationString(process.uptime() * 1000)
})

//////////////////////////////////////////////////////////////////////////////////////

const vmContextObject = Object.assign({
  console,
  process,
  Buffer,
  reloadAll,
  Uint8ClampedArray,
  Uint8Array,
  Int8Array,
  Uint16Array,
  Int16Array,
  Uint32Array,
  Int32Array,
  Float32Array,
  Float64Array,
  BigUint64Array,
  BigInt64Array,
  require: createRequire(import.meta.url),
  argTypes: {},
  toTitleCase: String.prototype.toTitleCase,
  limit: String.prototype.limit,
  loadedFunctions: new Set,
  loadedEvents: new Map,
  loadedLoadIns: new Map,
  registerFunction(name, func) {
    if (typeof func === "function") {
      vmContextObject[name] = func
      globalThis[name] = func
      vmContextObject.loadedFunctions.add(name)
    } else {
      for (const [k, v] of Object.entries(func)) {
        vmContextObject[k] = v
        globalThis[k] = v
        vmContextObject.loadedFunctions.add(k)
      }
    }
  }
}, globalThis, scope)
const vmContext = vm.createContext(vmContextObject)

//////////////////////////////////////////////////////////////////////////////////////

async function loadScript(filePath) {
  const key = path.resolve(filePath).replace(/\\/g, "/")
  await vm.runInContext(`(() => {
    const __filename = "${key}"
    const scriptName = "${path.basename(key, ".js")}"
    const prefixPath = "${path.relative("./commands/prefix", path.dirname(key)).replace(/\\/g, "\\\\")}".split(/\\\\|\\\//)
    const slashPath = "${path.relative("./commands/slash", path.dirname(key)).replace(/\\/g, "\\\\")}".split(/\\\\|\\\//).filter(e => e)
    return (async () => {
      ${await fs.promises.readFile(key, "utf-8")}
    })()
  })()`, vmContext, {
    filename: key,
    lineOffset: -6
  })
}

//////////////////////////////////////////////////////////////////////////////////////

async function reloadAll() {
  vmContextObject.argTypes = {}
  for (const script of vmContextObject.loadedFunctions) {
    delete vmContextObject[script]
    delete globalThis[script]
  }
  for (const [k, v] of vmContextObject.loadedEvents) client.off(k, v)
  for (const [k, v] of vmContextObject.loadedLoadIns) await v?.()
  client.restrictedCommands = []
  client.commandTree = {}
  client.categories = {}
  client.fullCommandList = []
  client.stats.prefixCommandCount = 0
  client.stats.slashCommandCount = 0
  client.prefixCategories = new Set
  client.prefixCommands = new Discord.Collection()
  client.slashCommands = new Discord.Collection()
  client.contextCommands = new Discord.Collection()
  client.autocompletes = new Discord.Collection()
  vmContextObject.loadedFunctions = new Set
  vmContextObject.loadedEvents = new Map
  vmContextObject.loadedLoadIns = new Map
  for await (const f of getFiles("./functions")) await loadScript(f)
  for await (const f of getFiles("./loadins")) await loadScript(f)
  for await (const f of getFiles("./argtypes")) await loadScript(f)
  for await (const f of getFiles("./commands/prefix")) if (f.endsWith(".js")) await loadScript(f)
  for (const file of fs.readdirSync("./commands/slash/")) if (!file.endsWith(".js")) {
    const commandGroup = new Discord.Collection()
    for (const subFile of fs.readdirSync(`./commands/slash/${file}`)) if (!subFile.endsWith(".js") && !subFile.endsWith(".json")) commandGroup.set(subFile, new Discord.Collection())
    client.slashCommands.set(file, commandGroup)
  }
  for await (const f of getFiles("./commands/slash")) if (f.endsWith(".js")) await loadScript(f)
  for await (const f of getFiles("./commands/context")) await loadScript(f)
  for await (const f of getFiles("./autocompletes")) await loadScript(f)
  for await (const f of getFiles("./events")) await loadScript(f)
}

//////////////////////////////////////////////////////////////////////////////////////

if (!testMode) {
  process.on("unhandledRejection", async error => {
    try {
      if (error instanceof Discord.DiscordAPIError) {
        if (error.message === "Unknown interaction") return
        await sendMessage(await getChannel(config.channels.errors), {
          title: "An API error occured",
          description: `\`${error.message}\`\n\n**Status**\n\`${error.httpStatus}\`\n\n**Request**\n\`${error.method.toUpperCase()} ${error.path}\`\n\n**Data**\n\`\`\`${error.requestData?.json ? `${JSON.stringify(error.requestData.json)}\`\`\`\n` : ""}**Stack**\n\`\`\`${error.stack}`.limit(4093) + "```"
        })
      }
      else await sendMessage(await getChannel(config.channels.errors), {
        title: "An error occured",
        description: `\`${error.message}\`\n\n**Stack**\n\`\`\`${error.stack}`.limit(4093) + "```"
      })
    } catch(ex) {
      console.error(ex)
    }
  })
}

//////////////////////////////////////////////////////////////////////////////////////

await reloadAll()

//////////////////////////////////////////////////////////////////////////////////////

client.login(tokens.discord)