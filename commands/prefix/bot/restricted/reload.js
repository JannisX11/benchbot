registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Reloads the bot without restarting it."
  },
  permissions: ["BotOwner"],
  async execute(message, args) {
    const processing = await sendProcessing(message)
    await reloadAll()
    sendMessage(message, {
      description: "Reloaded all **commands**, **functions**, **argtypes**, **autocompletes**, **events**, and **loadins**",
      processing
    })
  }
})