require("dotenv").config({ silent: true });

module.exports = {
	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	PREFIX: process.env.PREFIX || "!",
};
