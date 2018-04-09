const detectPort = (location) => {
  const port = location.port
  if (port) return parseInt(port)

  switch(location.protocol) {
  case 'http:':
    return 80
  case 'https:':
    return 443
  default:
    throw new Error(`Can't detect protocol: ${location}`)
  }
}

export default detectPort
