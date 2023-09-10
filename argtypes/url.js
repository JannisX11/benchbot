registerArgType(scriptName, async (item, args) => {
  item = item.replace(/^<|>$/g, "")
  if (!urlTest.test(item)) return
  try {
    const r = await fetch(item, {method: "HEAD"})
    if (r.status < 400) return [item, r]
    if (!args?.errorless) return sendError(args.message, {
      title: "Unable to get URL",
      description: `The URL returned an error code: \`${r.status}\``
    })
  } catch {}
})