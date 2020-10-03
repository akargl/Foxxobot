const fs = require("fs");

module.exports = {
	name: "oidacount",
	description: "Oida Leaderboard. Zeigt an welcher user wurde am meisten geoidat wurde",
	cooldown: 10,

	execute(message, args) {
		let oidacount;
		try {
			oidacount = JSON.parse(fs.readFileSync("oidacount.json"));
		} catch (error) {
			console.warn("Couldn't open oidacount.json");
			return message.channel.send("Couldn't open oidacount.json");
		}

		message.guild.members.fetch()
			.then((members) => {
				let oidaLeaderboard = [];

				Object.keys(oidacount).forEach((k) => {
					let name = k;
					if (members.has(k)) {
						name = members.get(k).displayName;
					}
					oidaLeaderboard.push({ name: name, count: oidacount[k].oidaCount });
				});


				oidaLeaderboard = oidaLeaderboard
					.sort((a, b) => b.count - a.count);

				let nameLengths = [];

				const namePrefixes = ["🥇", "🥈", "🥉"]
					.concat(new Array(Math.max(oidaLeaderboard.length - 3, 0)).fill("  "));
				oidaLeaderboard.forEach((x, i) => {
					x.name = namePrefixes[i] + x.name;
					nameLengths.push(x.name.length);
				});

				nameLengths = nameLengths.sort((a, b) => b - a);

				const maxNameLengthForPadding = 80;
				const padTo = nameLengths.find((x) => x <= maxNameLengthForPadding);

				oidaLeaderboard.forEach((x) => {
					x.name = x.name.padEnd(padTo);
				});
				
				let leaderboardString = "**Oida Leaderboard**\n```\n";
				for (const x of oidaLeaderboard) {
					const row = `${x.name}: ${x.count}\n`;
					//max message length in Discord is 2000 chars so we have to constrain to that
					if (leaderboardString.length + row.length > (2000 -3)) {
						break;
					}
					leaderboardString += row;
				}
				leaderboardString += "```";

				return message.channel.send(leaderboardString);
			});
	},
};