registerArgType(scriptName, async (item, data) => {
  item = item.toLowerCase()
  let cmd = client.prefixCommands.get(item)
  if (cmd) return cmd
  cmd = await wrongCommand(item, data.message, data).catch(() => false)
  if (cmd) return cmd[0]
})