const data = {}

async function get(url, args) {
  if (data[url]) return data[url]
  data[url] = await fetch(url, args).then(e => e.json())
  setTimeout(() => delete data[url], 600000)
  return data[url]
}

registerLoadIn(scriptName, {
  load: () => globalThis.cache = {
    async plugins() {
      const plugins = await get("https://cdn.jsdelivr.net/gh/JannisX11/blockbench-plugins/plugins.json")
      const stats = await get("https://blckbn.ch/api/stats/plugins?weeks=2")
      for (const plugin in plugins) {
        plugins[plugin].stats = stats[plugin] ?? 0
      }
      return plugins
    },
    cem: () => get("https://wynem.com/assets/json/cem_template_models.json"),
    async minecraftTitleGenerator() {
      const stats = await get("https://api.wynem.com/blockbench/minecrafttitlegenerator/stats", { headers: { source: "blockbench" } })
      const statsAll = await get("https://api.wynem.com/blockbench/minecrafttitlegenerator/statsall", { headers: { source: "blockbench" } })
      const textures = await get("https://raw.githubusercontent.com/ewanhowell5195/MinecraftTitleGenerator/main/fonts/minecraft-ten/textures.json")
      return [stats, statsAll, textures]
    }
  },
  unload: () => delete globalThis.cache
})