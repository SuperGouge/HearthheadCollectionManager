// ==UserScript==
// @name        HearthheadCollectionManager
// @namespace   https://github.com/SuperGouge
// @homepageURL https://github.com/SuperGouge/HearthheadCollectionManager
// @match       http://*.hearthhead.com/collection
// @version     1.0.1
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant       none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

const COLLECTABLE_SETS = [3, 13];

$("#viewtoggle").before(
    $("<a/>", { text: "Export", href: "#", "class": "btn btn-site btn-small" }).click(function(event) {
        event.preventDefault();
        var idString = "";
        $.each(HearthstoneCollectionUpdates.userCards, function(id, card) {
            idString += g_hearthstone_cards[id].image + ":" + card.normal + ":" + card.golden + ";";
        });
        prompt("Copy this text to clipboard:", idString);
    })
).before(
    $("<a/>", { text: "Import", href: "#", "class": "btn btn-site btn-small", css: { marginLeft: "5px" } }).click(function(event) {
        event.preventDefault();
        var idString = prompt("Paste ID string to import:");
        if (!idString) {
            return;
        }
        if (!/(\d+:[0-2]:[0-2];)+/.test(idString = idString.trim())) {
            return alert("Malformed ID string");
        }

        var importedCards = {};
        $.each(idString.split(";"), function(index, card) {
            if (card) {
                var split = card.split(":");
                var id = cards[split[0]].id;
                importedCards[id] = {
                    id: id,
                    normal: split[1],
                    golden: split[2]
                };
            }
        });

        $.each(HearthstoneCollectionUpdates.userCards, function(id, card) {
            if (importedCards[id]) {
                if (card.normal != importedCards[id].normal || card.golden != importedCards[id].golden) {
                    HearthstoneCollectionUpdates.savedCardChanges[id] = importedCards[id];
                }
                delete importedCards[id];
            } else {
                if ((card.normal != 0 || card.golden != 0) && $.inArray(g_hearthstone_cards[id].set, COLLECTABLE_SETS) != -1) {
                    HearthstoneCollectionUpdates.savedCardChanges[id] = {
                        id: id,
                        normal: 0,
                        golden: 0
                    };
                }
            }
        });
        $.each(importedCards, function(id, card) {
            HearthstoneCollectionUpdates.savedCardChanges[id] = card;
        });

        $.each(HearthstoneCollectionUpdates.savedCardChanges, function(id, card) {
            var $card = $(".cardline:has(div[rel='" + id + "'])");
            $card.find(".buttons:not(.gold)>div").each(function() {
                var $this = $(this);
                $this.attr("class", $this.attr("cardcount") == card.normal ? "in" : "");
            });
            $card.find(".buttons.gold>div").each(function() {
                var $this = $(this);
                $this.attr("class", $this.attr("cardcount") == card.golden ? "in" : "");
            });
        });
        HearthstoneCollectionUpdates.sendChanges(false);
    })
);

var cards = {};
$.each(g_hearthstone_cards, function(id, card) {
    cards[card.image] = {};
    $.each(card, function(key, value) {
        cards[card.image][key] = value;
    });
});
