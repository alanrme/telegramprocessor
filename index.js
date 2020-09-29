const fs = require('fs');
const messages = JSON.parse(fs.readFileSync('result.json', 'utf8')).messages;

let result = {
    messages: { },
    media: { },
    bot: { },
    links: { },
    calls: { }
}

for (i in messages) {
    let message = messages[i]
    let from = message.from
    if (!from && message.action.includes("call")) {
        result.calls[message.actor] = result.calls[message.actor] !== undefined ? result.calls[message.actor] + 1 : 1
        // phone calls use "actor" for some reason
        continue // skip, go to next loop
    }
    result.messages[from] = result.messages[from] !== undefined ? result.messages[from] + 1 : 1

    if (message.media_type || (message.mime_type && message.mime_type.includes("image")) || message.photo) {
        result.media[from] = result.media[from] !== undefined ? result.media[from] + 1 : 1
        if (message.media_type) {
            let type = message.media_type
            if (type == "animation") type = "video_file"
            if (!result.media[type]) result.media[type] = {} // if key doesn't exist make it
            result.media[type][from] = result.media[type][from] !== undefined ? result.media[type][from] + 1 : 1
        } else if ((message.mime_type && message.mime_type.includes("image")) || message.photo) {
            if (!result.media.image) result.media.image = {} // if key doesn't exist make it
            result.media.image[from] = result.media.image[from] !== undefined ? result.media.image[from] + 1 : 1
        }
    }

    if (message.via_bot) {
        if (!result.bot[message.via_bot]) result.bot[message.via_bot] = {}
        result.bot[message.via_bot][from] = result.bot[message.via_bot][from] !== undefined ? result.bot[message.via_bot][from] + 1 : 1
    }

    let text = message.text
    for (i in text) {
        if (text[i].type && text[i].type == "link") {
            result.links[from] = result.links[from] !== undefined ? result.links[from] + 1 : 1
            if (text[i].text.includes("youtu.be") || text[i].text.includes("youtube.com")) {
                if (!result.links.youtube) result.links.youtube = {} // if key doesn't exist make it
                result.links.youtube[from] = result.links.youtube[from] !== undefined ? result.links.youtube[from] + 1 : 1
            }
        }
    }
}
console.log(result)