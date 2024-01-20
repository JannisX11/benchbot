registerFunction(scriptName, (exe, args, data = { stdio: "ignore" }) => {
  const p = child_process.spawn(exe, args, data)
  p.promise = new Promise((fulfil, reject) => {
    p.on("close", () => {
      fulfil() 
      clearTimeout(timeout)
    })
    p.on("error", () => {
      reject()
      clearTimeout(timeout)
    })
    const timeout = setTimeout(() => p.kill(), 10000)
  })
  return p
})