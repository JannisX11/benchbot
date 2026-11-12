const channels = new Map

function clearChannel(channelId) {
  const state = channels.get(channelId)
  if (!state) return
  channels.delete(channelId)
  clearTimeout(state.timer)
  state.warning?.then(warning => warning && deleteMessage(warning), () => {})
}

async function autoTimeout(message) {
  const member = message.member
  if (!member.moderatable || !hasPerm(message.guild.members.me, "ModerateMembers")) return
  const duration = 1200000
  const reason = "[VC-CLEANUP] Spamming in an empty voice channel chat"
  await member.timeout(duration, reason)
  sendMessage(member, {
    author: ["Timed out", client.icons.speakerRed],
    description: `You have been timed out in ${message.guild.name.quote()}`,
    fields: [
      ["Length", durationString(duration)],
      ["Reason", reason]
    ],
    colour: client.colours.error
  }).catch(() => {})
  sendLog({
    icon: client.icons.speakerRed,
    type: "Member timed out",
    bad: true,
    fields: [
      ["Member", `${member} \`${member.id}\``],
      ["Channel", message.channel.toString()],
      ["Length", durationString(duration)],
      ["Reason", reason]
    ]
  })
}

registerFunction(scriptName, {
  voiceChatCleanup: {
    async messageCreate(message) {
      const channel = message.channel
      if (!message.guild || !channel.isVoiceBased?.() || channel.members.size || isMod(message.member)) return
      if (!hasPerm(message.guild.members.me, "ManageMessages", channel)) return
      deleteMessage(message)
      let state = channels.get(channel.id)
      if (!state) {
        state = { users: new Map }
        channels.set(channel.id, state)
      }
      if (!state.warning) {
        state.warning = sendMessage(channel, {
          author: ["Voice channel not in use", client.icons.speakerRed],
          description: "Do not use this channel unless the voice chat is in use",
          colour: client.colours.error
        })
      }
      const now = Date.now()
      const last = state.users.get(message.author.id)
      const count = last && now - last.time < 60000 ? last.count + 1 : 1
      state.users.set(message.author.id, { time: now, count: count >= 3 ? 0 : count })
      clearTimeout(state.timer)
      state.timer = setTimeout(() => clearChannel(channel.id), 60000)
      if (count >= 3) await autoTimeout(message)
      return true
    },
    join(channel) {
      clearChannel(channel.id)
    }
  }
})
