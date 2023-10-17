registerFunction(scriptName, async args => {
  args.author = [args.type, args.icon]
  args.colour = args.bad ? client.colours.error : client.colours.success
  sendMessage(await getChannel(config.channels.log), args)
})