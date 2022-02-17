const { readFileSync } = require('fs')
class FIOCtrl {
    constructor() {}
    
    async getBlockNumber(req,res) {
      try {
          res.send({"dd":"dd"});
        } catch (error) {
          res.send({})
        }
    }

}

export default new FIOCtrl();