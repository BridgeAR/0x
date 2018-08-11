'use strict'
const fg = require('d3-fg')
const render = require('nanohtml')
const morphdom = require('morphdom')
const debounce = require('debounce')
const createActions = require('./actions')
const createState = require('./state')
const graph = require('./cmp/graph')(render)
const ui = require('./cmp/ui')(render)

module.exports = function (trees, opts) {
  opts = opts || {}
  const { kernelTracing } = opts
  const exclude = ['cpp', 'regexp', 'v8', 'native', 'init']

  const chart = graph()
  const tree = trees.unmerged // default view
  const categorizer = !kernelTracing && graph.v8cats
  const flamegraph = fg({
    categorizer,
    tree,
    exclude,
    element: chart
  })
  const { colors } = flamegraph

  window.addEventListener('resize', debounce(() => {
    const width = document.body.clientWidth * 0.89
    flamegraph.width(width).update()
    chart.querySelector('svg').setAttribute('width', width)
  }, 150))

  const state = createState({colors, trees, exclude: new Set(exclude), kernelTracing, title: opts.title})

  const actions = createActions({flamegraph, state}, (state) => {
    morphdom(iface, ui({state, actions}))
  })
  const iface = ui({state, actions})

  document.body.appendChild(chart)
  document.body.appendChild(iface)
}
