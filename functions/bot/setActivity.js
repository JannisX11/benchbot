registerFunction(scriptName, () => {
  client.user.setActivity("Use /help to view commands!", { type: Discord.ActivityType.Custom })
  setTimeout(setActivity, 1800000)
})