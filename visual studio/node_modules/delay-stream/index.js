var through = require('through')

module.exports = function (delay) {

  var queue = []

  function next(data) {
    queue.push(data)
    setTimeout(function () {
      ts.queue(queue.shift())
    }, delay)
  }

  var ts = through(function(data) {
    next(data)
  }, function () {
    next(null)
  })

  return ts
}
