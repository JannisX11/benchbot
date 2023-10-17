registerFunction(scriptName, (exe, args, data = { stdio: "ignore" }) => {
  const p = child_process.spawn(exe, args, data)
  p.promise = new Promise((fulfil, reject) => {
    p.on("close", fulfil)
    p.on("error", reject)
  })
  return p
})