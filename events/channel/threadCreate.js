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
    setTimeout(async () => {
      try {
        await sendMessage(thread, { embeds })
      } catch {
        // Retry sending if it fails to send to the thread the first time
        // Silently fail if it sends to fail the second time
        setTimeout(() => sendMessage(thread, { embeds }).catch(), 3000)
      }
    }, 3000)
  }
  if (thread.parent.name.startsWith("bb-feedback")) {
    const embeds = [{
      title: `Welcome to the Blockbench feedback forum!`,
      description: [
        `Thank you for submitting feedback about Blockbench! We appreciate it because it helps us make the app better!`,
        `If you have a GitHub account, you can also submit bug reports and suggestions on the [Blockbench GitHub repository](https://github.com/JannisX11/blockbench/issues), as that makes it easier for us to organize.`
        `Please keep in mind that, while we take all feedback into account, unfortunately we can't reply to every post.`
        `For certain bugs, it's helpful for investigating it to see the console log. To open the console, press Ctrl + Shift + I or click Help > Developer > Open Dev Tools and switch to the Console tab.`
      ].join('\n\n'),
      colour: client.colours.success
    }]
    setTimeout(async () => {
      try {
        await sendMessage(thread, { embeds })
      } catch {
        // Retry sending if it fails to send to the thread the first time
        // Silently fail if it sends to fail the second time
        setTimeout(() => sendMessage(thread, { embeds }).catch(), 3000)
      }
    }, 3000)
  }
})

function checkTags(arr, tags) {
  if (arr.length <= 1) return true
  for (const tagList of tags) {
    if (arr.every(e => tagList.includes(e))) return true
  }
}