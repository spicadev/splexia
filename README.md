# Splexia
Splexia is cross-compatible and cross-platform Javascript library
simpifly programming language creation usinf javascript.

## Table of Contents
- [Example](#example)
- [API](#api)
  - [Splexia](#splexia)
  - [Lexer](#lexer)
  - [Parser](#parser)
 
## Example
For more detailed example, open [examples/abc-lang.js](https;//github.com/spicadev/splexia/blob/main/examples/abc-lang.js)
```js
/** Basic Programming Language that lex/tokenize
*   simple arithmetic with no support of assignment, variable,
*   and even whitespace
**/
const splexia = require('splexia')
const calc = {} // The name of the programming language: calc
calc.OPERATOR = ['+', '-', '*', '/']
calc.lex = splexia.lexer.charLoop({
  onChar: function(char) {
    if(!isNaN(char)) {
      const num = []
      while(this.ok && /[\d_]/.test(this.get())) {
        if(this.get() !== '_') num.push(this.get())
        this.i++
      }
      if(this.get() === '.') {
        this.i++
        num.push('.')
        while(this.ok && /[\d_]/.test(this.get())) {
          if(this.get() !== '_') num.push(this.get())
          this.i++
        }
        this.i--
      }
      this.push({ type: 'NUM', value: num.join('') })
    } else if(calc.OPERATOR.includes(char)) {
      this.push({ type: 'OP', value: char })
    }
  }
})

const tokens = calc.lex(`20+45_000.20_5`)
console.log(tokens)
/** Expected output:
* [
*   { type: 'NUM', value: '20' },
*   { type: 'OP', value: '+' },
*   { type: 'NUM', value: '45000.205' }
**/
```

# API
## Splexia
```js
const splexia = require('splexia')
// or
import * as splexia from 'splexia'
// or
import splexia from 'splexia'
```

## Lexer
```js
// with char loop (example: examples/abc-lang.js)
const charLoop = splexia.lexer.charLoop
// with rules (example: in comment below char-loop-based lexer example)
const rulesBased = splexia.lexer.rulesBased
```

## Parser
```js
const parser = splexia.parser
```
