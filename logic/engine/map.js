const config = require("../../config.js");
const bot = require(config.DIRNAME + "/main.js");
const { Hero } = require(config.LOGIC + "/helpers/DB.js");
const fs = require("fs");

var MAP = [];

const loadMap = () => {
    const maps = fs.readdirSync(config.DB + "/maps/");
    
    for(let x = 0; x < 10 ; x++){
        MAP[x] = [];
        for(let y = 0; y < 10 ; y++){
            MAP[x][y] = "na";
        }
    }
    
    for(let map of maps){
        const id = map.replace(".json" , "");
        const {x , y} = {x : id.split("_")[0] , y : id.split("_")[1]};
        const _map = JSON.parse(fs.readFileSync(config.DB + "/maps/" + map));
        MAP[x][y] = _map;
    }
    console.log("Maps loaded...");
};

const getCity = (id) => {
    const {x , y} = {x : id.split("_")[0] , y : id.split("_")[1]};
    return MAP[x][y];
};



module.exports = {
    loadMap,
    getCity
};