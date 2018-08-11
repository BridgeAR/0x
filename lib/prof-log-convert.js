'use strict'

const { spawnSync } = require('child_process')

module.exports = profLogConvert

function profLogConvert ({isolateLogPath, pid, folder, stream}, args) {
  const { stdout, stderr, status } = spawnSync('node', ['--prof-process', '--preprocess', '-j', isolateLogPath])

  if (status !== 0) {
    args.status('prof isolateLogPath convert Failed: ', stderr + '', stdout + '')
    return
  }
  const data = JSON.parse(stdout);

  const proc = 'node'
  const profName = 'cpu-clock'
  const space = '              '

  data.ticks.forEach((tick) => {
    const addr = tick.s.filter((n, i) => i % 2 === 0)
    const stack = addr.reduce((arr, n) => {
      const code = data.code[n]
      if (code && code.type === 'JS') {
        arr.push(code)
      }
      return arr
    }, [])
    if (stack.length !== 0) {
      let str = ''
      stack.forEach(({name, kind}) => {
        if (!name) {
          str += 'UKNOWN\n'
          return
        }
        if (name[0] === ' ') name = `(anonymous)${name}`
        if (kind === 'Opt') {
          name = '*' + name
        } else if (kind === 'Unopt') {
          name = '~' + name
        }
        str += `${space}${name}\n`
      })
      stream.write(`${proc} ${pid} ${tick.tm}: ${profName}:\n${str}\n`)
    }
  })
  stream.end('\n')
}
