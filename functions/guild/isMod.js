registerFunction(scriptName, member => {
  try {
    return client.modPermissions.some(e => hasPerm(member, e))
  } catch {}
})