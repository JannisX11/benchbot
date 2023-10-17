registerFunction(scriptName, message => {
  if (message.command.application) {
    return `/${message.command.tree.join(" ")}`
  }
  return `${config.prefix}${message.command.name}`
})