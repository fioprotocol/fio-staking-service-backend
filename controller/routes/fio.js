import fioCtrl from "../api/fio";
import { checkAPIKey } from "./middle";

const route = require("express").Router();

route.get("/blocknumber/eth", checkAPIKey , (req, res) => fioCtrl.getBlockNumber(req,res));
export default route;