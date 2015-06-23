// ==UserScript==
// @name        HearthheadCollectionManager
// @namespace   https://github.com/SuperGouge
// @homepageURL https://github.com/SuperGouge/HearthheadCollectionManager
// @match       http://*.hearthhead.com/collection
// @version     1.0.3
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js
// @grant       none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

const COLLECTABLE_SETS = [3, 13];

$("<link/>", { href: "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/vader/jquery-ui.min.css", rel: "stylesheet", type: "text/css" }).appendTo("head");
var $textarea = $("<textarea/>", { css: { width: "100%", height: "100%", boxSizing: "border-box", resize: "none" } });
var $dialog = $("<form/>", { css: { height: "100%" } }).append($textarea).dialog({
    autoOpen: false,
    modal: true,
    minWidth: 480,
    minHeight: 360
}).on("dialogopen", function() {
    $dialog.height($dialog.height());
});

$("#viewtoggle").before(
    $("<a/>", { text: "Export", href: "#", "class": "btn btn-site btn-small" }).click(function(event) {
        event.preventDefault();
        var idString = "";
        $.each(HearthstoneCollectionUpdates.userCards, function(id, card) {
            idString += g_hearthstone_cards[id].image + ":" + card.normal + ":" + card.golden + ";";
        });
        $textarea.val(idString);
        $textarea.prop("readonly", true);
        $dialog.dialog("option", "title", "Copy this text to clipboard:");
        $dialog.dialog("option", "buttons", {
            OK: function() {
                $(this).dialog("close");
            }
        });
        $dialog.dialog("option", "open", function() {
            $textarea.select();
        });
        $dialog.dialog("open");
    })
).before(
    $("<a/>", { text: "Import", href: "#", "class": "btn btn-site btn-small", css: { marginLeft: "5px" } }).click(function(event) {
        event.preventDefault();
        $textarea.val("");
        $textarea.prop("readonly", false);
        $dialog.dialog("option", "title", "Paste ID string to import:");
        $dialog.dialog("option", "buttons", {
            OK: function() {
                var idString = $textarea.val().trim();
                if (!/(\d+:[0-2]:[0-2];)+/.test(idString)) {
                    $textarea.css("border-color", "red");
                } else {
                    setTimeout(function() {
                        importCollection(idString);
                    }, 0);
                    $(this).dialog("close");
                }
            }
        });
        $dialog.dialog("option", "close", function() {
            $textarea.css("border-color", "");
        });
        $dialog.dialog("open");
    })
);

function importCollection(idString) {
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
}

var cards = {};
$.each(g_hearthstone_cards, function(id, card) {
    cards[card.image] = {};
    $.each(card, function(key, value) {
        cards[card.image][key] = value;
    });
});
