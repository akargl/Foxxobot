const fs = require("fs");

module.exports = {
	name: "oida",
	description: "Oida a user.",
	cooldown: 10,

	execute(message, args) {
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
			username = lookupKey = args.join(" ").toLowerCase();
		}

		if (!this.oidaCount.hasOwnProperty(lookupKey)) {
			this.oidaCount[lookupKey]= { oidaCount: 0 };
		}
		this.oidaCount[lookupKey].oidaCount++;

		fs.writeFileSync("oidacount.json", JSON.stringify(this.oidaCount));

		return message.channel.send(`Oida ${username}!\nDu wurdest ${this.oidaCount[lookupKey].oidaCount} mal geoidat.`);
	},
	oidaCount: {},
	onLoad() {
		this.oidaCount = JSON.parse(fs.readFileSync("oidacount.json", "utf8"));
	}
}