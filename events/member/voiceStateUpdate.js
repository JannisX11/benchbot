registerEvent(scriptName, (oldState, newState) => {
  if (newState.channel && newState.channelId !== oldState.channelId) voiceChatCleanup.join(newState.channel)
})
