registerFunction(scriptName, {
  deleteMessage(message) {
    if ((message.author?.id ?? message.user?.id) === client.user.id || (message.guild && hasPerm(message.guild.members.me, "ManageMessages"))) message.delete?.().catch(() => {})
  },
  async deleteAfter(message, time = 5000) {
    await new Promise(fulfil => setTimeout(fulfil, time))
    await deleteMessage(message)
  }
})