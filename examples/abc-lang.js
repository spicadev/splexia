const splexia = require('splexia')
const abc = {}

const KEYWORDS = [
  'fn', 'return', 'if', 'else'
]

abc.lex = splexia.lexer.charLoop({
  onChar: function(char) {
    if(/\s/.test(char)) { /* ignore: auto-skip */ }
    else if(char === '/' && this.peek(1) === '*') {
      this.i += 2
      while(this.get() !== '/' && this.peek(-1) !== '*') {
        this.i++
      }
    } else if(char === '"' || char === '\'') {
      this.i++
      const str = []
      while(this.get() !== char && this.peek(-1) !== '\\') {
        str.push(this.get())
        this.i++
      }
      this.push({ type: 'STRING', value: str.join('') })
    } else if(/\d/.test(char)) {
      const num = [char]
      while(/[_\d]/.test(char)) {
        num.push(this.get())
        this.i++
      }
      if(this.get() === '.') {
        num.push('.')
        this.i++
        if(/\d/.test(this.get())) {
          num.push(this.get())
          while(/[_\d]/.test(char)) {
            num.push(this.get())
            this.i++
          }
        } else throw new Error('Unexpected token `.`')
      }
      this.push({ type: 'NUMBER', value: num.join('') })
    } else if(/[\w_$]/.test(char)) {
      const ident = [char]
      while(/[\w\d_$]/.test(this.peek(1)) {
        this.i++
        ident.push(this.get())
      }
      if(KEYWORDS.includes(ident)) {
        this.push({ type: 'KEYWORD', value: ident })
      } else {
        this.push({ type: 'IDENTIFIER', value: ident })
      }
    } else if(['|', '&', '=', '?', '>', '<'].includes(char) && this.peek(1) === char) {
      this.i++
      this.push({ type: 'LOGICAL', value: char+char })
    } else if(['+', '-', '*', '/', '='].includes(char)) {
      this.push({ type: 'OPERATOR', value: char })
    } else if(['(', ')', '{', '}', '[', ']', ';', ','].includes(char)) {
      this.push({ type: 'PUNCTUATION', value: char })
    }
  },
  onError: console.error
})

/* or:
abc.lexer = splexia.lexer.rulesBased({
  rules: [
    { regex: /\s/g, ignore: true },
    { regex: /\/\*[\s\S]*(?:\*\/)|$/g, ignore: true },
    { regex: /("|').*\1/g, type: 'STRING' },
    { regex: /\d[_\d]*(?:\.\d[_\d*])/g, type: 'NUMBER' },
    { regex: new RegExp(`(${KEYWORDS.map(item => `(?:${item.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`).join('|')})`, 'g'), type: 'KEYWORD' },
    { regex: /[\w_$][\w\d_$]+?/g, type: 'IDENTIFIER' },
    { regex: /([\|\&\=\?\>\<])\1/g, type: 'LOGICAL' },
    { regex: /\\+|\\-|\\*|\\/|\\=/g, type: 'OPERATOR' },
    { regex: /\(|\)|\{|\}|\[|\]|\;|\,/g, type: 'PUNCTUATION' }
  ],
  onError: console.error
})
*/

const tokens = abc.lex(`
/* This is a comment */
fn fibonacci(num) {
  if(num == 1 || num == 2) {
    return num - 1
  }
  return fibonacci(num - 1) + fibonacci(num - 2)
}

print("Fibonacci of 5: {fibonacci(5)}"
`)

abc.parse = splexia.parser({ // Different of advance() and next(): advance() return value before advancing, next() return value after advancing
  onToken: function(token) {
    this.my.parse.call(this, token)
  },
  my: {
    parse: function(token) {
      if(token.type === 'KEYWORD') {
        if(token.value === 'fn') {
          this.i++
          const name = this.expect({ type: 'IDENTIFIER' }).value // Expect an identifier
          const args = []
          this.expect({ value: '(' })
          while(this.ok && this.get().value != ')') {
            // ok = can continue (e.g. i < length, no error), important in parser
            args.push(this.expect({ type: 'IDENTIFIER' }).value)
            if(this.get().value === ',') {
              this.i++
            }
          }
          this.expect({ value: ')' })
          const body = this.my.parseBody.call(this)
          this.push({ type: 'FUNCTION_DECLARATION', name: name, args: args, body: body })
        } else if(token.value === 'if') {
          this.expect({ value: 'if' })
          const condition = this.my.parseExpression.call(this)
          const body = this.my.parseBody.call(this) // no else, else-if support since this is just example
          this.push({ type: 'IF', condition: condition, body: body })
        } else if(token.value === 'return') {
          this.expect({ value: 'return' })
          const expression = this.my.parseExpression.call(this)
          this.push({ type: 'RETURN', expression: expression })
        }
      } else if(token.type === 'IDENTIFIER') {
        this.push(this.my.parseIdentifier.call(this))
      }
    },
    parseExpression: function() {
      const isClosed = this.get().value === '('
      if(isClosed) this.i++
      const expression = { left: this.my.parseExpressionValue.call(this), op: null, right: null }
      while(this.ok && (this.get().type === 'OPERATOR' || this.get().type === 'LOGICAL')) {
        expression.op = this.advance().value
        expression.right = this.my.parseExpressionValue.call(this)
      }
      return expression
    },
    parseExpressionValue: function() {
      if(this.get().type === 'PUNCTUATION') {
        return this.my.parseExpression.call(this)
      } else if(this.get().type === 'IDENTIFIER') {
        return this.my.parseIdentifier.call(this)
      } else {
        return this.advance().value
      }
    },
    parseBody: function() {
      this.expect({ value: '{' })
      const body = this.my.parse(this.get())
      this.expect({ value: '}' })
      return body
    },
    parseIdentifier: function() {
      const token = this.get()
      if(this.peek(1).value === '(') {
        this.i++
        this.expect({ value: '(' })
        const args = []
        while(this.ok && this.get().value !== ')') {
          if(this.get().value === '(') {
            args.push(this.my.parseExpression.call(this))
          } else {
            args.push(this.get().value)
            this.i++
          }
          if(this.get().value === ',') {
            this.i++
          }
        }
        return { type: 'FUNCTION_CALL', name: token.value, args: args }
      } else if(this.peek(1).value === '=') {
        this.i++
        this.expect({ value: '=' })
        return { type: 'ASSIGNMENT', name: token.value, value: this.my.parseExpression.call(this) }
      } else return { type: 'IDENTIFIER', value: token.value }
    }
  },
  onError: console.error
})

const parsedTokens = abc.parse(tokens)

abc.interpret = splexia.interpreter()

abc.interpret(parsedTokens)
