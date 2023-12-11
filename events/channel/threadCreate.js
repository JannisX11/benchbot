registerEvent(scriptName, async thread => {
  if (thread.parent.name.startsWith("help-")) {
    const close = client.slashCommands.get("close")
    const pin = config.channels.help.pinned[thread.parent.name.slice(5)]
    const embeds = [{
      title: `Welcome to the help forum!`,
      description: `${pin ? `Please make sure to read <#${pin}> as it may answer your question!\n\n` : ""}Once your question has been resolved, please mark the post as closed by using the </${close.tree.join(" ")}:${await getCommand(close, { guild: testMode ? thread.guild : undefined, id: true })}> command.`,
      colour: client.colours.success
    }]
    if (config.tags[thread.parentId] && !checkTags(thread.appliedTags.filter(e => e.name !== "Moderator").map(e => thread.parent.availableTags.find(t => t.id === e).name), config.tags[thread.parentId])) {
      embeds.unshift({
        author: ["Conflicting tags detected", client.icons.warningRed],
        description: `It looks like you have applied tags to this post that conflict. Please only apply the tags that are relevant to your post. We can only help you if we know the context of your question, and applying incorrect tags makes this confusing.${pin ? `\n\nYou can refer to <#${pin}> for a description of what each tag is for!` : ""}`,
        colour: client.colours.error
      })
    }
    setTimeout(() => sendMessage(thread, { embeds }), 3000)
  }
})

function checkTags(arr, tags) {
  if (arr.length <= 1) return true
  for (const tagList of tags) {
    if (arr.every(e => tagList.includes(e))) return true
  }
}