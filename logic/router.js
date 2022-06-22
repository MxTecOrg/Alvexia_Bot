const config = require("../config.js");
const bot = require("../main.js");

require(config.LOGIC + "/commands/start/start.js");
require(config.LOGIC + "/commands/menu/menu.js");
require(config.LOGIC + "/commands/quests/quests.js");
require(config.LOGIC + "/commands/status/status.js");
require(config.LOGIC + "/commands/inventory/inventory.js");
require(config.LOGIC + "/commands/city/city.js");
require(config.LOGIC + "/commands/social/social.js");