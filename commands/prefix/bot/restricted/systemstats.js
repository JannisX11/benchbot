const os = require("node:os")

function getCPUUsage() {
  const start = getCPUInfo()
  return new Promise(fulfil => setTimeout(() => {
    const end = getCPUInfo()
    fulfil(1 - (end.idle - start.idle) / (end.total - start.total))
  }, 1000))
}

function getCPUInfo() {
  let total = 0
  let idle = 0
  const cpus = os.cpus()
  for (const cpu of cpus) {
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq
    idle += cpu.times.idle
  }
  return { idle, total: total + idle }
}

const getStorage = path => new Promise(fulfil => fs.statfs(path = os.platform === "win32" ? "C:/" : "/", (err, res) => fulfil(({
  used: formatBytes(res.blocks * res.bsize - res.bfree * res.bsize),
  free: formatBytes(res.bfree * res.bsize),
  total: formatBytes(res.blocks * res.bsize)
}))))

registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "View the stats about the system the bot is running on."
  },
  aliases: ["systemspecs", "specs"],
  permissions: ["BotOwner"],
  async execute(message, args) {
    const storage = await getStorage()
    const stats = await sendMessage(message, {
      author: ["Measuring...", client.icons.pinging]
    })
    editMessage(stats, {
      author: ["System stats", client.icons.stats],
      fields: [
        ["Platform", `\`${os.platform()} ${os.release()}\``],
        ["Uptime", `\`${durationString(os.uptime()*1000)}\``],
        ["CPU", `\`${os.cpus()[0].model}\``, true],
        ["CPU Usage", `\`${((await getCPUUsage()) * 100).toFixed(2)}%\``, true],
        ["​", "​", true],
        ["Total Memory", `\`${(os.totalmem() / 1073741824).toFixed(2)} GB\``, true],
        ["Memory Usage", `\`${((os.totalmem() - os.freemem()) / 1073741824).toFixed(2)} GB\``, true],
        ["​", "​", true],
        ["Total Storage", `\`${storage.total}\``, true],
        ["Used Storage", `\`${storage.used}\``, true],
        ["Free Storage", `\`${storage.free}\``, true]
      ]
    }).catch(() => {})
  }
})