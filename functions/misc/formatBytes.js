const sizes = ["B", "KB", "MB", "GB", "TB"]

registerFunction(scriptName, bytes => {
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + " " + sizes[i]
})