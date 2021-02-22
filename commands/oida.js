const fs = require("fs");

module.exports = {
	name: "oida",
	description: "Oida a user.",
	cooldown: 200,

	execute(message, args, client) {
		if (!args.length) {
			return message.reply("Heast, wen soll i oidan?");
		}

		let targetusername;
		let targetid;

		if (message.mentions.users.size) {
			const mentionedUser = message.mentions.users.first();
			targetusername = mentionedUser.username;
			targetid = mentionedUser.id;
		} else {
			targetusername = args.join(" ");
			targetid = targetusername.toLowerCase();
		}
		const sourceid = message.author.id;

		let oidacooldown = 1800 * 1000;
		if (client.settings.oidaCooldown) {
			oidacooldown = client.settings.oidaCooldown;
		}

		if (this.oidaCount.hasOwnProperty(sourceid)) {
			if (this.oidaCount[sourceid].lasttarget === targetid) {
				return message.reply("Bist oag??!! Die selbe Person 2x oidan is verboten!");
			}
		} else {
			this.oidaCount[sourceid] = { oidaCount: 0, lasttarget: "", lastsource: "", lasttime: 0 };
		}

		if (this.oidaCount.hasOwnProperty(targetid)) {
			if ((this.oidaCount[targetid].lasttarget === sourceid) 
				&& (this.oidaCount[sourceid].lasttime > (Date.now() - oidacooldown))) {
				return message.reply("Zruckoidan spüts ned, sry");
			}
			if (this.oidaCount[targetid].lasttime > (Date.now() - oidacooldown)) {
				return message.reply("NA!!! Den hauma grod erst geoidat, suach da wen andern zum sekkiern!");
			}
		} else {
			this.oidaCount[targetid] = { oidaCount: 0, lasttarget: "", lastsource: "", lasttime: 0 };
		}

		this.oidaCount[targetid].oidaCount++;
		this.oidaCount[targetid].lastsource = sourceid;
		this.oidaCount[targetid].lasttime = Date.now();
		this.oidaCount[sourceid].lasttarget = targetid;

		fs.writeFileSync("oidacount.json", JSON.stringify(this.oidaCount, undefined, 4));

		return message.channel.send(`Oida ${targetusername}!\nDu wurdest ${this.oidaCount[targetid].oidaCount} mal geoidat.`);
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
