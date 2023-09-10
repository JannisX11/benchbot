registerFunction(scriptName, async (message, processing) => {
  if (processing) return processing
  if (message.command.application) return await message.deferReply()
  const msg = await sendMessage(message, {
    author: ["Processing...", client.icons.pinging],
    processing,
    components: []
  })
  return msg ?? true
})