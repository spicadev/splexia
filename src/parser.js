var argsUtil = require('./utility/argsUtil')

function Parser(options) {
  argsUtil.validateObject(options, [
    { key: 'onToken', accept: 'function' },
    { key: 'my', default: {} },
    { key: 'onError', default: console.error }
  ])
  return function parse(tokens) {
    var output = []
    var state = {
      i: 0,
      tokens: tokens,
      length: tokens.length,
      next: function(offset) {
        if(arguments.length == 0 || typeof offset != 'number') {
          offset = 1
        }
        return this.tokens[this.i = this.i + offset]
      },
      advance: function(offset) {
        if(arguments.length == 0 || typeof offset != 'number') {
          offset = 1
        }
        this.i = this.i + offset
        return this.tokens[this.i - offset]
      },
      get: function() {
        return this.tokens[this.i]
      },
      expect: function(token) {
        var val = this.get()
        if((typeof token == 'string' && typeof val == 'string') && val == token) {
          return this.advance()
        } else if((typeof token == 'string' && typeof val == 'object') && val.value == token) {
          return this.advance()
        } else if(typeof token == 'object' && typeof val == 'object') {
          for(var key in token) {
            if(val[key] != token[key]) {
              throw new Error('Expected ' + key)
            }
          }
          return this.advance()
        } else {
          throw new Error('Invalid token')
        }
      },
      push: function(token) {
        output.push(token)
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
        options.onToken.call(state, state.get())
      } catch(err) {
        options.onError(err)
      }
    }

    return output
  }
}

module.exports = exports = Parser
module.exports.default = Parser
