registerFunction(scriptName, (member, size = 1024, args) => {
  if (!member) return `https://cdn.discordapp.com/embed/avatars/${randInt(5)}.png`
  return member.displayAvatarURL({
    extension: getType.image("PNG"),
    forceStatic: args?.static
  }) + `?size=${size}`
})