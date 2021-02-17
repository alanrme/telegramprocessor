const fs = require('fs');
let messages;
try {
    messages = JSON.parse(fs.readFileSync('result.json', 'utf8')).messages;
} catch (err) {
    return console.log("Messages JSON file not found. Is it named result.json, in the root folder of the program and exported as JSON via Telegram Desktop?")
}

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
        addVal("calls", message.actor, 1)
        // phone calls use "actor" for some reason
        continue // skip, go to next loop
    }
    addVal("messages", from, 1)

    if (message.media_type || (message.mime_type && message.mime_type.includes("image")) || message.photo) {
        addVal("media", from, 1)
        if (message.media_type) {
            let type = message.media_type
            if (type == "animation") type = "video_file"
            if (!result.media[type]) result.media[type] = {} // if key doesn't exist make it
            addVal(`media.${type}`, from, 1)
        } else if ((message.mime_type && message.mime_type.includes("image")) || message.photo) {
            if (!result.media.image) result.media.image = {} // if key doesn't exist make it
            addVal("media.image", from, 1)
        }
    }

    if (message.via_bot) {
        if (!result.bot[message.via_bot]) result.bot[message.via_bot] = {}
        addVal(`bot.${message.via_bot}`, from, 1)
    }

    let text = message.text
    for (i in text) {
        if (text[i].type && text[i].type == "link") {
            addVal("links", from, 1)
            if (text[i].text.includes("youtu.be") || text[i].text.includes("youtube.com")) {
                if (!result.links.youtube) result.links.youtube = {} // if key doesn't exist make it
                addVal("links.youtube", from, 1)
            }
        }
    }
}

function addVal(key, from, value) {
    key = key.split(".")
    if (key.length > 1)
        result[key[0]][key[1]][from] = result[key[0]][key[1]][from] !== undefined ? result[key[0]][key[1]][from] + value : value
    else
        result[key[0]][from] = result[key[0]][from] !== undefined ? result[key[0]][from] + value : value
}

console.log(result)
try {
    fs.writeFileSync("./data.json", JSON.stringify(result))
    console.log("SAVED TO ./data.json!")
} catch (err) {
    console.error(err)
}