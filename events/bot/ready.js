registerEvent(scriptName, async () => {
  console.log(`${client.user.username} online`)
  setActivity()
  if (fs.existsSync("./json/restart.json")) {
    const data = JSON.parse(fs.readFileSync("./json/restart.json", "utf8"))
    const channel = await getChannel(data[0])
    if (channel) await sendMessage(channel, {
      author: ["Restarted sucessfully"],
      processing: await getMessage(channel, data[1])
    })
    fs.unlinkSync("./json/restart.json")
  }
})