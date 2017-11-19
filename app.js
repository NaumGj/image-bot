/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var ai = require('./processImageAPI');
var twizzy = require('./twitter-api');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);

const YES = "Yes";
const NO = "No";

bot.dialog('/', [
    function (session) {
        initialPrompt(session);
    },
    function (session, results) {
        photoUploadQuestion(session, results);
    },
    function (session) {
        imageAnalyzer(session);
    },
    function (session, results) {
        removeHashtagsQuestion(session, results);
    },
    function (session) {
        addHashtagsQuestion(session);
    },
    function (session, results) {
        beginAddHashTagsDialog(session, results);
    },
    function (session) {
        postPhotoQuestion(session);
    },
    function (session, results) {
        postPhotoAction(session, results);
    },
    function (session) {
        showTweetLink(session);
    },

]);


bot.dialog('uploadPhoto', [
    function (session) {
        photoUploadPrompt(session);
    },
    function (session) {
        handlePhotoAttachment(session);
    }
]);

bot.dialog('removeHashtags', [
    function (session) {
        removeHashtagsPrompt(session);
    },
    function (session, results) {
        removeHashtagsAction(session, results);
    }
]);

bot.dialog('addHashtags', [
    function (session) {
        addHashtagsPrompt(session);
    },
    function (session, results) {
        addHashtagsAction(session, results);
    }
]);


function returnArray(array, session) {
	session.send("TEST RETURN ARRAY");
    var hashtagsString = "";

	//session.send(array[0]);
    array.forEach(function (hashtag) {
		//session.send(hashtag);
        if (hashtagsString != "") {
            hashtagsString += ", ";
        }
		if (hashtag.trim().charAt(0) == "#") {
			hashtagsString += hashtag.trim();
		} else {
			hashtagsString += "#" + hashtag.trim();
			session.send(hashtagsString);
			session.send(hashtag.trim());
			session.send(hashtag.trim().length);
		}
    });

	session.send(hashtagsString);
	
    return hashtagsString;
}

function initialPrompt(session) {
    builder.Prompts.choice(session, "Hi :)\nMy name is Twizzy, do you want me to help you with posting your new photo on Twitter?", [YES, NO]);
}

function photoUploadQuestion(session, results) {
    var doPhotoUpload = results.response.entity;
    if (YES == doPhotoUpload) {
        session.beginDialog('uploadPhoto');
    } else {
        session.endConversation("OK. You can find me here whenever you want. ;)");
    }
}

function imageAnalyzer(session) {
	console.log(session.conversationData.photoUrl);
    ai.analyzeImage(session.conversationData.photoUrl).then(
        function (success) {
            session.send("I have generated a couple of hashtags for you according to your photo. Here they are: :)");
            console.log(success);
			session.conversationData.hashtags = success.tags;
            session.conversationData.tweetStatus = success.caption;
			console.log(session.conversationData.hashtags);
			session.send("ALOOOO");
            session.send(returnArray(session.conversationData.hashtags, session));
            builder.Prompts.choice(session, "Do you want to remove some of the recommended hashtags?", [YES, NO]);
        },
        function (error) {
			session.send("ERROR");
            console.log(error);
            session.endConversation(error);
        }
    );
}

function removeHashtagsQuestion(session, results) {
    var doRemoveHashtags = results.response.entity;
    if (YES == doRemoveHashtags) {
        session.beginDialog('removeHashtags');
    }
	session.send("TU SAM");
}

function addHashtagsQuestion(session) {
	session.send("TU SAM 2");
    session.send(currentNumberOfHashtagsMessage(session.conversationData.hashtags));
	session.send("TU SAM 3");
    builder.Prompts.choice(session, "Do you want to add some more hashtags?", [YES, NO]);
}

function beginAddHashTagsDialog(session, results) {
    var doAddHashtags = results.response.entity;
    if (YES == doAddHashtags) {
        session.beginDialog('addHashtags');
    }
}

function postPhotoQuestion(session) {
    session.send(currentNumberOfHashtagsMessage(session.conversationData.hashtags));
    builder.Prompts.choice(session, "Do you want to post the Twizzy tweet?", [YES, NO]);
}

function postPhotoAction(session, results) {
    var doPostTweet = results.response.entity;
    if (YES == doPostTweet) {
        twizzy.uploadTweet(session.conversationData.photoUrl, session.conversationData.tweetStatus).then(function (success) {
                session.conversationData.twizzyLink = success.text;
                showTweetLink(session);
            },
            function (error) {
                console.log(error);
                session.send(error);
                session.send(error.message);
                session.endConversation("Your photo cannot be uploaded. :(");
            });
    } else {
        session.endConversation("Your photo won't be uploaded.");
    }
}

function showTweetLink(session) {
    session.send('showTweetLink METHOD');
    if (session.conversationData.twizzyLink) {
        session.send('I OVDE SAM USAO');
        session.send(session.conversationData.twizzyLink);
    } else {
        session.send("There is no tweet to show. :(");
    }
}

function photoUploadPrompt(session) {
    builder.Prompts.attachment(session, "Please upload a photo from your gallery.");
}

function handlePhotoAttachment(session) {
    var msg = session.message;
    if (msg.attachments && msg.attachments.length > 0) {
        var attachment = msg.attachments[0];
        session.conversationData.photoUrl = attachment.contentUrl;
		session.send("You sent: " + JSON.stringify(attachment));
		session.send("URL: " + attachment.contentUrl);
        session.endDialog();
    } else {
        session.replaceDialog("uploadPhoto", {reprompt: true});
    }
}

function removeHashtagsPrompt(session) {
    builder.Prompts.text(session, "Please type the hashtags you would like to remove.");
}

function removeHashtagsAction(session, results) {
    var hashtagsToRemoveLine = results.response;
    var hashtagsToRemoveArray = hashtagsToRemoveLine.split(",").map(function (hashtagToRemove) {
		session.send(hashtagToRemove);
        return hashtagToRemove.trim().toLowerCase();
    });

    session.conversationData.hashtags = session.conversationData.hashtags.filter(function (hashtag) {
        return hashtagsToRemoveArray.indexOf(hashtag) < 0;
    });
    session.endDialog();
}

function addHashtagsPrompt(session) {
    builder.Prompts.text(session, "Please type the hashtags you would like to add.");
}

function addHashtagsAction(session, results) {
    var hashtagsToAddLine = results.response;
    var hashtagsToAddArray = hashtagsToAddLine.split(",").map(function (hashtagToAdd) {
        if (hashtagToAdd.charAt(0) == "#") {
			return hashtagToAdd.trim().toLowerCase();
		} else {
			return "#" + hashtagToAdd.trim().toLowerCase();
		}
    });

    session.conversationData.hashtags = hashtagsToAddArray.concat(session.conversationData.hashtags);
    session.endDialog();
}

function currentNumberOfHashtagsMessage(tags) {
    return "The current hashtags for your photo are: " + returnArray(tags);
}

