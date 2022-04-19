const { readFileSync } = require('fs');
const { Pool } = require('pg');
const Cursor = require('pg-cursor');

class FIOCtrl {
    constructor() {
      this.pool = new Pool({
        user: process.env.SUPERUSER,
        host: process.env.HOSTURL,
        database: process.env.DATABASENAME,
        password: process.env.DBPASSWORD,
        port: 5432,
        max: 999999999,
      });
    }
    
    async getBlockNumber(req,res) {
      let net = req.params.net;
      const client = await this.pool.connect();
      const query = `SELECT tbl_blocknumber.block_number FROM tbl_blocknumber INNER JOIN tbl_network ON tbl_blocknumber."id" = tbl_network."id" WHERE tbl_network.network_name = '${net}'`;

      const data = await client.query(query);
      await client.end();
      try {
          if(data.rowCount !== 0) {
            res.status(200).send({"blockNumber":data.rows[0].block_number});
            console.log("get success: ", data.rows[0].block_number)
          }
        } catch (error) { 
          res.status(404).send({})
          console.log("get failed")

        }
    }
    async setBlockNumber(req,res) {
      let net = req.params.net;
      let blockNum = req.body.blockNumber;
      const client = await this.pool.connect();
      const query = `UPDATE tbl_blocknumber SET block_number='${blockNum}' FROM tbl_network WHERE tbl_blocknumber."id" = tbl_network."id"  AND tbl_network.network_name = '${net}' `
      const data = await client.query(query);
      await client.end();

      try {
          res.status(200).send({"success":true});
          console.log("set success: ", blockNum)
        } catch (error) {
          res.status(404).send({"success":false});
          console.log("set failed")
        }
    }
    async health(req,res) {
      res.status(200).send('OK!');
    }
}

export default new FIOCtrl();