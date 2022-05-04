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
    async setUnwrapAction(req,res) {
      const client = await this.pool.connect();
      const query = `SELECT * FROM tbl_unwrap_action WHERE tbl_unwrap_action.obt_id = '${req.body.obt_id}'`
      const data = await client.query(query);
      if(data.rows.length === 0) {
        const query = `INSERT INTO tbl_unwrap_action (chain_id, obt_id, fio_address,token_amount, nftname, block_number, fio_timestamp, iscomplete)
        VALUES ('${req.body.chain_id}', '${req.body.obt_id}', '${req.body.fio_address}','${req.body.token_amount}', '${req.body.nftname}', '${req.body.block_number}', '${req.body.fio_timestamp}', '${req.body.iscomplete}')`
        const data = await client.query(query);
        if(req.body.voters.length >0) {
          for (var i =0; i<req.body.voters.length;i++) {
            const query1 = `INSERT INTO tbl_fio_voters (chain_id, obt_id, voter) VALUES ('${req.body.chain_id}', '${req.body.obt_id}', '${req.body.voters[i]}')`;
            const data = await client.query(query1);
          }
        }
      } else {
        const query = `UPDATE tbl_unwrap_action SET chain_id='${req.body.chain_id}',  obt_id='${req.body.obt_id}', fio_address='${req.body.fio_address}', token_amount='${req.body.token_amount}',nftname='${req.body.nftname}',block_number='${req.body.block_number}', fio_timestamp='${req.body.fio_timestamp}', iscomplete='${req.body.iscomplete}'`
        const data = await client.query(query);
        if(req.body.voters.length >0) {
          for (var i =0; i<req.body.voters.length;i++) {
            const query1 = `UPDATE tbl_fio_voters SET chain_id='${req.body.chain_id}',obt_id='${req.body.obt_id}', fio_address='${req.body.voters[i]}'`;
            const data = await client.query(query1);
          }
        }
      }
      await client.end();
      try {
        res.status(200).send({"success":true});
        console.log("set success")
      } catch (error) {
        res.status(404).send({"success":false});
        console.log("set failed")
      }
    }
    async getUnwrapActionByTransaction(req,res) {
      const client = await this.pool.connect();
      const query = `SELECT * FROM tbl_unwrap_action WHERE tbl_unwrap_action.obt_id = '${req.body.obt_id}'`
      const data = await client.query(query);
      const query1 = `SELECT voter FROM tbl_fio_voters WHERE tbl_fio_voters.obt_id = '${req.body.obt_id}'`
      const data1 = await client.query(query1);
      let voterArray = [];
      if(data1.rows.length > 0) {
        for (var i = 0; i < data1.rows.length; i++) {
          voterArray.push(data1.rows[i].voter);
        }
      }
      await client.end();
      try {
        const pushData = {...data.rows[0], voters: voterArray};
        res.status(200).send({...pushData});
        console.log("set success")
      } catch (error) {
        console.log(error);
        res.status(404).send({});
        console.log("set failed")
      }
    }
    async getUnwrapActionByComplete(req,res) {
      const client = await this.pool.connect();
      const query = `SELECT * FROM tbl_unwrap_action WHERE tbl_unwrap_action.iscomplete = '${req.body.iscomplete}'`
      const data = await client.query(query);
      let filteredAction = [];
      if(data.rows.length>0) {
        for (var i = 0; i < data.rows.length; i++) {
          const query1 = `SELECT voter FROM tbl_fio_voters WHERE tbl_fio_voters.obt_id = '${data.rows[i].obt_id}'`
          const data1 = await client.query(query1);
          let voterArray = [];
          if(data1.rows.length > 0) {
            for (var j = 0; j < data1.rows.length; j++) {
              voterArray.push(data1.rows[j].voter);
            }
          }
          const pushData = {...data.rows[i], voters: voterArray};
          filteredAction.push(pushData);
        }
      }
      await client.end();
      try {
        res.status(200).send(filteredAction);
        console.log("set success")
      } catch (error) {
        console.log(error);
        res.status(404).send([]);
        console.log("set failed")
      }
    }
    async health(req,res) {
      res.status(200).send('OK!');
    }
}

export default new FIOCtrl();
