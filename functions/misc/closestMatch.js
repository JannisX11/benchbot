registerFunction(scriptName, (str, array, cutoff = 0.5) => {
  const sorted = str.length > 3 ? array.map(e => [e, stringSimilarity(str, e)]).sort((a, b) => b[1] - a[1]) : array.map(e => [e, stringSimilarity(str, e, 1)]).sort((a, b) => b[1] - a[1])
  if (!sorted.filter(e => e[1]).length && cutoff === 0) return array[0]
  if (sorted[0][1] > cutoff) return sorted[0][0]
})