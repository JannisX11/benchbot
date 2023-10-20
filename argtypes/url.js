registerArgType(scriptName, async (item, args) => {
  item = item.replace(/^<|>$/g, "")
  if (urlTest.test(item)) return item
})