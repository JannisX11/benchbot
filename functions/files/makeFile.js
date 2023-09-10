registerFunction(scriptName, async data => {
  let buffer
  try {
    if (data.buffer) buffer = data.buffer
    if (data.path)   buffer = fs.readFileSync(data.path)
    if (data.url)    buffer = await fetch(data.url).then(async e => Buffer.from(await e.arrayBuffer()))
    if (data.text)   buffer = Buffer.from(data.text, "utf8")
  } catch { return }
  return new Discord.AttachmentBuilder(buffer, { name: data.name })
})