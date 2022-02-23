import fioCtrl from "../api/fio";
import { checkAPIKey } from "./middle";

const route = require("express").Router();

route.get("/blocknumber/:net", checkAPIKey , (req, res) => fioCtrl.getBlockNumber(req,res));
route.get("/health", checkAPIKey , (req, res) => fioCtrl.health(req,res));

route.post("/setblocknumber/:net", checkAPIKey , (req, res) => fioCtrl.setBlockNumber(req,res));
export default route;