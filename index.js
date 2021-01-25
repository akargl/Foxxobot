const config = require("./config");
const { Client, Collection } = require("discord.js");
const fs = require("fs");
const prettyMilliseconds = require("pretty-ms");
const client = new Client();

client.settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));

client.commands = new Collection();
client.commandAliases = new Collection();
fs.readdirSync("./commands")
	.filter(f => f.endsWith(".js"))
	.forEach((f) => {
		const command = require(`./commands/${f}`);
		client.commands.set(command.name, command);
		if (command.aliases) {
			command.aliases.forEach((alias) => client.commandAliases.set(alias, command.name));
		}

		if (command.onLoad) {
			command.onLoad(client);
		}
	});

const cooldowns = new Collection();

client.on("error", console.error);


client.once("ready", () => {
	console.log("Ready to rock!");
});

client.login(config.DISCORD_TOKEN);

client.on("message", message => {
	if (!message.content.startsWith(config.PREFIX) || message.author.bot) {
		return;
	}

	const args = message.content.slice(config.PREFIX.length).split(/ +/);
	let commandName = args.shift().toLowerCase();
	commandName = client.commandAliases.get(commandName) || commandName;

	if (!client.commands.has(commandName)) {
		return;
	}

	const command = client.commands.get(commandName);

	if (command.guildOnly && message.channel.type !== "text") {
		return message.reply("Command not possible in a non-text channel");
	}

	if (command.args && !args.length) {
		let reply = "You didn't provide required arguments.";

		if (command.usage) {
			reply += `Usage: '${config.PREFIX}${command.name} ${command.usage}'`;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (!timestamps.has(message.author.id)) {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	} else {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the '${command.name}' command.`);
		}
	}

	try {
		command.execute(message, args, client);
	} catch (error) {
		console.error(error);
		return message.reply("There was an error executing that command!");
	}
});


const botUptimes = new Collection();

client.on("presenceUpdate", (oldMember, newMember) => {
	if (!oldMember) {
		return;
	}

	const id = oldMember.id;

	if (client.settings.monitoredBots.hasOwnProperty(id)) {
		let botChannel = newMember.guild.defaultChannel;
		if (client.settings.defaultChannels.hasOwnProperty(newMember.guild.id)) {
			botChannel = client.channels.get(client.settings.defaultChannels[newMember.guild.id]);
		}

		if (!botChannel) {
			console.error("couldn't find default channel");
			return;
		}

		const now = Date.now();
		const lastStateChange = botUptimes.get(id);
		let duration;
		if (lastStateChange) {
			duration = prettyMilliseconds(now - lastStateChange, { compact: true });
		}

		if (oldMember.presence.status === "offline" && newMember.presence.status !== "offline") {
			let msg = `Yay, ${newMember.displayName} is back online!`;
			if (duration) {
				msg += ` Downtime was ${duration}.`;
			}
			botChannel.send(msg);

			botUptimes.set(id, now);
		} else if (oldMember.presence.status !== "offline" && newMember.presence.status === "offline") {
			let msg = `OnO, ${newMember.displayName} is gone`;
			if (client.settings.monitoredBots[id].pingOwner) {
				msg += ` <@${client.settings.monitoredBots[id].ownerId}>.`;
			}
			if (duration) {
				msg += ` Uptime was ${duration}.`;
			}
			botChannel.send(msg);

			botUptimes.set(id, now);
		}
	}
});
