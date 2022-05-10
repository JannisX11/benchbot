Math.clamp = (n, a, b) => n < a ? a : n > b ? b : n;

Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)]
}

String.prototype.toTitleCase = function() {
	return this.split(/[-_: ]+/g).map(word => word.substr(0, 1).toUpperCase() + word.substr(1)).join(' ');
}

let Bot = null;
function setBot(b) {
	Bot = b;
}
/**
 * 
 * @returns {Discord.Client}
 */
function getBot() {
	return Bot;
}
function getChannel(name) {
	let channel = Bot.channels.cache.find(ch => ch.name === name);
	return channel;
}
function hasRole(member, role_name) {
    return member && member.roles && !!member.roles.cache.find(role => role.name == role_name);
}
function addRole(member, role_name) {
    let role = member && member.guild.roles.cache.find(role => role.name === role_name);
    if (role) member.roles.add(role);
}


module.exports = {setBot, getChannel, getBot, hasRole, addRole};