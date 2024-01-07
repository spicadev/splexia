const splexia = require('splexia')
const abc = {}

abc.lex = splexia.lexer.charLoop({
  onChar: function(char) {
    if(char === '/' && this.peek(1) === '*') {
      this.i += 2
      while(this.get() !== '/' && this.peek(-1) !== '*') {
        this.i++
      }
    } else if(char === '"') {
      this.i++
      const str = []
      while(this.get() !== '"' && this.peek(-1) !== '\\') {
        str.push(this.get())
      }
      this.push(str.join(''))
    } else if(/\s/.test(char)) { /* ignore: auto-skip */ }
  },
  onError: console.error
})

/* or:
abc.lexer = splexia.lexer.rulesBased({
  rules: [
    { regex: /\/\*[\s\S]*(?:\*\/)|$/g, ignore: true },
    { regex: /("|').*\1/g, type: 'STRING' },
    { regex: /\s/, ignore: true }
  ],
  onError: console.error
})
*/

const tokens = abc.lex(`
/* This is a comment */
'String Works!'
`)

abc.parse = splexia.parser()

abc.parse(tokens)
