const fs = require("fs");
const fixTime = require('fix-time');
const { setInterval } = require("timers");

module.exports = {
	name: "remindme",
	description: "Sets a reminder for specified time.",
	aliases: ["setreminder"],
	usage: "[remindme <time>]",

	execute(message, args) {
		if (!args.length) {
			return message.reply("Heast, wann soll i di erinnern?");
		}

		const remindDateStr = args.join(" ");
		const reminderDate = fixTime(remindDateStr);

		if (!reminderDate) {
			return message.reply("Ungültiges Datumsformat😕");
		}

		message.channel.send(`Für was ist die Erinnerung am ${reminderDate}?`);

		message.channel.awaitMessages((response) => response.author.id === message.author.id, { max: 1, time: 60 * 1000, errors: ["time"] })
			.then(collected => {
				const reason = collected.first().content;
				this.pendingReminders.push({
					reminderDate: reminderDate,
					reason: reason,
					userId: message.author.id,
					channelId: message.channel.id,
				});

				fs.writeFileSync("pendingReminders.json", JSON.stringify(this.pendingReminders, undefined, 4));

				return message.channel.send(`Ok`);
			})
			.catch(_x => {
				return message.channel.send(`Timeout: Erinnerung abgebrochen`);
			});
	},
	pendingReminders: [],
	onLoad(client) {
		try {
			this.pendingReminders = JSON.parse(fs.readFileSync("pendingReminders.json", "utf8")) || [];
		} catch (error) {
			console.warn("Couldn't open pendingReminders.json");
		}

		setInterval(() => {
			const now = new Date();
			const numReminders = this.pendingReminders.length;
			// iterate backwards so we can safely remove items
			for (let i = numReminders - 1; i >= 0; i--) {
				const reminder = this.pendingReminders[i];
				if (reminder.reminderDate < now) {
					const channel = client.channels.cache.get(reminder.channelId);
					// TODO: handle channel not existing anymore
					channel.send(`<@${reminder.userId}> Deine Erinnerung: ${reminder.reason}`);
					this.pendingReminders.splice(i, 1);
				}
			}

			if (this.pendingReminders.length != numReminders) {
				fs.writeFileSync("pendingReminders.json", JSON.stringify(this.pendingReminders, undefined, 4));
			}
		}, 1000);
	},
};