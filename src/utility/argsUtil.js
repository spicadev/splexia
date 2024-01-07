var argsUtil = module.exports = exports = {}

argsUtil.validateObject = function(arg, rules, context) {
  for(var i = 0; i < rules.length; i++) {
    var rule = rules[i]
    if(typeof rule == 'string') {
      rule = { key: rule }
    }
    var value = arg[rule.key]
    if(!(rule.key in arg)) {
      if('default' in rule) {
        arg[rule.key] = rule.default
      } else {
        throw new Error('Missing object property `' + rule.key + '` in ' + context)
      }
    } else if('accept' in rule && 
              (typeof rule.accept == 'string' && rule.accept != typeof value) ||
              (typeof rule.accept == 'function' && !(value instanceof rule.accept))) {
      throw new Error('Property ' + rule.key + ' only accept value as ' + rule.accept + '.')
    }
  return arg
}
