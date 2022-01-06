
const messageAwaiters = [];

function handleMessageAwaiters(msg) {
	
    for (var awaiter of messageAwaiters) {
        if ((msg.channel.type == awaiter.channeltype || !awaiter.channeltype)
        && (msg.channel.name == awaiter.channelname || !awaiter.channelname)
        && (msg.author.id == awaiter.authorid || !awaiter.authorid)
        ) {
            awaiter.trigger(msg);
            messageAwaiters.splice(messageAwaiters.indexOf(awaiter), 1);
        }
    }
}

module.exports = {
	messageAwaiters,
    handleMessageAwaiters
}