const config = require("../config.js");
const bot = require("../main.js");

require(config.LOGIC + "/commands/start/start.js");
require(config.LOGIC + "/commands/menu/menu.js");
require(config.LOGIC + "/commands/quests/quests.js");
