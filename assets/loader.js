/* eslint-disable */
(async() => {
  var stdout = process.stdout.write
  process.stdout.write = () => true
  var args = process.argv.slice(2)
  var m = require(args[args.length-1])
  var r = m.default || m
  if (typeof r === 'function') r = r()
  var result = await Promise.resolve(r)
  process.stdout.write = stdout
  console.log(JSON.stringify(result))
})()
