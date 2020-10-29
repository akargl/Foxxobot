module.exports = {
	name: "choose",
	description: "Choose between options",
	usage: "[choose option1 'option 2' option3]",
	cooldown: 1,
	execute(message, args) {
		if (!args.length) {
			return message.reply("nix zum auswählen");
		}

		const normalizedArgs = this.splitArgs(args.join(" "));
		const randomNum = Math.floor(Math.random() * normalizedArgs.length);
		const choosen = normalizedArgs[randomNum];
		return message.channel.send(choosen);
	},
	splitArgs(args) {
		return args.match(/\\?.|^$/g)
			.reduce((p, c) => {
				if(c === '"') {
					p.quote ^= 1;
				} else if(!p.quote && c === ' ') {
					p.a.push('');
				} else{
					p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
				}
				return p;
			}, { a: [''] }).a;
	},
};