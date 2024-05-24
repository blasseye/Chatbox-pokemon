let totalMessages = 0, messagesLimit = 0, nickColor = "user", removeSelector, addition, customNickColor, channelName,
    provider;
let animationIn = 'bounceIn';
let animationOut = 'bounceOut';
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];
let previousSender = "";
let mergeMessages = false;

const tchat = document.querySelector('#tchat')

window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.event.listener === 'widget-button') {

        if (obj.detail.event.field === 'testMessage') {
            let emulated = new CustomEvent("onEventReceived", {
                detail: {
                    listener: "message", event: {
                        service: "twitch",
                        data: {
                            time: Date.now(),
                            tags: {
                                "badge-info": "",
                                badges: "moderator/1,partner/1",
                                color: "#5B99FF",
                                "display-name": "StreamElements",
                                emotes: "25:46-50",
                                flags: "",
                                id: "43285909-412c-4eee-b80d-89f72ba53142",
                                mod: "1",
                                "room-id": "85827806",
                                subscriber: "0",
                                "tmi-sent-ts": "1579444549265",
                                turbo: "0",
                                "user-id": "100135110",
                                "user-type": "mod"
                            },
                            nick: 'Tracoeur_',
                            userId: "100135110",
                            displayName: 'Tracoeur_',
                            displayColor: "#5B99FF",
                            badges: [{
                                type: "moderator",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                                description: "Moderator"
                            }, {
                                type: "partner",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                                description: "Verified"
                            }],
                            channel: 'Tracoeur_',
                            text: "Howdy! My name is Bill and I am here to serve Kappa",
                            isAction: !1,
                            emotes: [{
                                type: "twitch",
                                name: "Kappa",
                                id: "25",
                                gif: !1,
                                urls: {
                                    1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                                },
                                start: 46,
                                end: 50
                            }],
                            msgId: "43285909-412c-4eee-b80d-89f72ba53142"
                        },
                        renderedText: 'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
                    }
                }
            });
            window.dispatchEvent(emulated);
        }
        return;
    }
    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        document.querySelectorAll(`#message-${msgId}`).forEach(el => el.remove())
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const sender = obj.detail.event.userId;
        document.querySelectorAll(`.message[data-sender=${sender}]`).forEach(el => el.remove())
        return;
    }

    if (obj.detail.listener !== "message") return;
    addMessage(obj.detail.event.data, obj.detail.event.renderedText);
});

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    animationIn = fieldData.animationIn;
    animationOut = fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
    messagesLimit = fieldData.messagesLimit;
    nickColor = fieldData.nickColor;
    customNickColor = fieldData.customNickColor;
    hideCommands = fieldData.hideCommands;
    channelName = obj.detail.channel.username;
    mergeMessages = fieldData.mergeMessages === "yes";
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
    if (fieldData.alignMessages === "block") {
        addition = "prepend";
        removeSelector = ".message-row:nth-child(n+" + (messagesLimit + 1) + ")"
    } else {
        addition = "append";
        removeSelector = ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")"
    }

    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});


function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text
        .replace(
            /([^\s]*)/gi,
            function (m, key) {
                let result = data.filter(emote => {
                    return html_encode(emote.name) === key
                });
                if (typeof result[0] !== "undefined") {
                    let url = result[0]['urls'][1];
                    if (provider === "twitch") {
                        return `<img class="emote" " src="${url}"/>`;
                    } else {
                        if (typeof result[0].coords === "undefined") {
                            result[0].coords = {x: 0, y: 0};
                        }
                        let x = parseInt(result[0].coords.x);
                        let y = parseInt(result[0].coords.y);

                        let width = "{emoteSize}px";
                        let height = "auto";

                        if (provider === "mixer") {
                            console.log(result[0]);
                            if (result[0].coords.width) {
                                width = `${result[0].coords.width}px`;
                            }
                            if (result[0].coords.height) {
                                height = `${result[0].coords.height}px`;
                            }
                        }
                        return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
                    }
                } else return key;

            }
        );
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function addMessage(data, message) {
    const pokemon_url = gifPokemonUrl(data.displayName)
    tchat.insertAdjacentHTML('beforeend', /*html*/`
    <div id="message-${data.msgId}" data-sender="${data.userId}" class="message" style="--color: ${data.displayColor}">
        <div class="pkmn-text">
            <p>
                <span class="display-name"></span>:
                <span class="display-text"></span>
            </p>        
        </div>
        <div class="pkmn">
            <img src=${pokemon_url}>
        </div>
    </div>`);
    const displayNameElement = document.querySelector(`#message-${data.msgId} .display-name`);
    const displayTextElement = document.querySelector(`#message-${data.msgId} .display-text`);
    // Lancez l'animation de machine à écrire
    writeNameBadges(data.displayName, data.badges, displayNameElement);
    typeWriter(message, displayTextElement);
}

function removeRow() {
    if (!$(removeSelector).length) {
        return;
    }
    if (animationOut !== "none" || !$(removeSelector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(removeSelector).dequeue();
        } else {
            $(removeSelector).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove().dequeue()
            });

        }
        return;
    }

    $(removeSelector).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(removeSelector).remove();
    });
}

function pokeballUrl(badges) {
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].type === "broadcaster") {
            return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png';
        }
    }
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].type === "moderator") {
            return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png';
        }
    }
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].type === "VIP") {
            return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png';
        }
    }
    for (var i = 0; i < badges.length; i++) {
        if (badges[i].type === "subscriber") {
            return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png';
        }
    }
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'

}

function gifPokemonUrl(display_name) {
    var date = new Date();
    var nb_pokemon = 905;
    var hash = ("" + date.getDate() + date.getMonth() + date.getFullYear() + display_name).hashCode();
    var number = Math.abs(hash) % nb_pokemon + 1;
    var url = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/' + number + '.gif';
    return url
}

// Hash for string
String.prototype.hashCode = function() {
    var hash = 0,
    i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function writeNameBadges(name, badges, element) {
    const imgElement = document.createElement("img");
    const imgUrl = pokeballUrl(badges)
    imgElement.src = imgUrl;
    element.innerHTML = name
    element.appendChild(imgElement)
}

function typeWriter(text, element, speed = 50) {
    let i = 0;
    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '<' && text.charAt(i + 1) === 'i' && text.charAt(i + 2) === 'm' && text.charAt(i + 3) === 'g') {
                // Trouver la fin de la balise
                const endIndex = text.indexOf('>', i);
                // Extraire l'attribut src
                const srcStartIndex = text.indexOf('src="', i) + 5;
                const srcEndIndex = text.indexOf('"', srcStartIndex);
                const src = text.substring(srcStartIndex, srcEndIndex);
                // Créer l'élément image
                const imgElement = document.createElement('img');
                imgElement.src = src;
                // Ajouter l'image à l'élément
                element.appendChild(imgElement);
                // Augmenter l'index pour passer à la fin de la balise
                i = endIndex + 1;
            } else {
                // Si ce n'est pas une balise img, ajouter le caractère normalement
                element.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        }
    }
    type();
}