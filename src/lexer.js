var argsUtil = require('./utility/argsUtil')
var lexer = module.exports = exports = {}

lexer.regexBased = function regexBasedLexer(options) {
  argsUtil.validateObject(options, [
    'rules', { key: 'onError', default: console.error }
  ])

  throw new Error('Unimplemented')
}

lexer.charLoop = function charLoopLexer(options) {
  argsUtil.validateObject(options, [
    { key: 'onChar', accept: 'function' }, { key: 'onError', default: console.error }
  ])

  return function Lexer(input) {
    var output = []
    var state = {
      i: 0,
      length: input.length,
      peek: function(offset) {
        return input[this.i + ((typeof offset == 'number' && offset) || 0)]
      },
      get: function() {
        return input[this.i]
      },
      push: function(data) {
        output.push(data)
      }
    }
    Object.defineProperty(state, 'ok', {
      get: function() {
        return state.i < state.length
      },
      set: function(v) {
        return state.ok
      }
    })

    for(; state.ok; state.i++) {
      try {
        options.onChar.call(state, input[state.i])
      } catch(err) {
        options.onError(err)
      }
    }
    return output
  }
}
