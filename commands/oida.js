const fs = require("fs");

module.exports = {
	name: "oida",
	description: "Oida a user.",
	//cooldown: 15 * 60,

	execute(message, args, client) {
		if (!args.length) {
			return message.reply("Heast, wen soll i oidaen?");
		}

		let lookupKey;
		let username;
		if (message.mentions.users.size) {
			const mentionedUser = message.mentions.users.first();
			lookupKey = mentionedUser.id;
			username = mentionedUser.username;
		} else {
			username = args.join(" ");
			lookupKey = username.toLowerCase();
		}

		if (client.settings.userIdsWithSelfOida.includes(message.author.id) &&
			Math.random() <= client.settings.selfOidaChance) {
			lookupKey = message.author.id;
			username = message.author.username;
		}

		if (!this.oidaCount.hasOwnProperty(lookupKey)) {
			this.oidaCount[lookupKey] = { oidaCount: 0 };
		}
		this.oidaCount[lookupKey].oidaCount++;

		fs.writeFileSync("oidacount.json", JSON.stringify(this.oidaCount, undefined, 4));

		return message.channel.send(`Oida ${username}!\nDu wurdest ${this.oidaCount[lookupKey].oidaCount} mal geoidat.`);
	},
	oidaCount: {},
	onLoad() {
		try {
			this.oidaCount = JSON.parse(fs.readFileSync("oidacount.json", "utf8")) || {};
		} catch (error) {
			console.warn("Couldn't open oidacount.json");
		}
	},
};
