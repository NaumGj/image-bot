/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

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

bot.dialog('/', [
	function (session) {
        builder.Prompts.choice(session, "Hi :) Do you want me to help you upload a photo on Twitter?", ["Yes", "No"]);
	},
	function (session, results) {
		var doPhotoUpload = results.response.entity;
        if ("Yes" == doPhotoUpload) {
			session.beginDialog('uploadPhoto');
		} else {
			session.endConversation("OK :)");
		}
    },
	function (session) {
		session.send("I generated a few hashtags for you according to your photo. Here they are :)");
		console.log("TESTTTTT");
		session.conversationData.hashtags = getHashtagsForPhoto(session.conversationData.photoUrl);
		session.send(printArray(session.conversationData.hashtags));
		builder.Prompts.choice(session, "Do you want to remove some of the hashtags?", ["Yes", "No"]);
	},
	function (session, results) {
		var doRemoveHashtags = results.response.entity;
        if ("Yes" == doRemoveHashtags) {
			session.beginDialog('removeHashtags');
		}
    },
	function (session) {
		session.send("The current hashtags for your photo are: " + printArray(session.conversationData.hashtags));
		builder.Prompts.choice(session, "Do you want to add some hashtags?", ["Yes", "No"]);
	},
	function (session, results) {
		var doAddHashtags = results.response.entity;
        if ("Yes" == doAddHashtags) {
			session.beginDialog('addHashtags');
		}
    },
	function (session) {
		session.send("The current hashtags for your photo are: " + printArray(session.conversationData.hashtags));
		builder.Prompts.choice(session, "Do you want to post the photo?", ["Yes", "No"]);
	},
	function (session, results) {
		var doAddHashtags = results.response.entity;
        if ("Yes" == doAddHashtags) {
			session.conversationData.imageUploaded = uploadPhoto();
		} else {
			session.endConversation("Your photo won't be uploaded.");
		}
    },
	function (session) {
		if (session.conversationData.imageUploaded) {
			session.send("You have successfully uploaded the post!");
		} else {
			session.send("The post was not uploaded successfully.");
		}
	},
	
]);


bot.dialog('uploadPhoto', [
	function (session) {
		builder.Prompts.attachment(session, "Please upload a photo.");
    },
    function (session) {
		var msg = session.message;
		if (msg.attachments && msg.attachments.length > 0) {
			// Echo back attachment
			var attachment = msg.attachments[0];
			session.conversationData.photoUrl = attachment.contentUrl;
			/* session.send("You sent: " + JSON.stringify(attachment));
			session.send({
				text: "You sent:",
				attachments: [
					{
						contentType: attachment.contentType,
						contentUrl: attachment.contentUrl,
						name: attachment.name
					}
				]
			});*/
			session.endDialog();
		} else {
			session.replaceDialog("uploadPhoto", { reprompt: true });
			//builder.Prompts.attachment(session, "A photo was not uploaded. Please upload a photo.");
		}
	}
]);

bot.dialog('removeHashtags', [
	function (session) {
		builder.Prompts.text(session, "Please type the hashtags you want to remove.");
    },
	function (session, results) {
		var hashtagsToRemoveLine = results.response;
		var hashtagsToRemoveArray = hashtagsToRemoveLine.split(",").map(function(hashtagToRemove) {
			return hashtagToRemove.trim();
		});
		
		session.conversationData.hashtags = session.conversationData.hashtags.filter( function(hashtag) {
			return hashtagsToRemoveArray.indexOf(hashtag) < 0;
		});
		session.endDialog();
    }
]);

bot.dialog('addHashtags', [
	function (session) {
		builder.Prompts.text(session, "Please type the hashtags you want to add.");
    },
	function (session, results) {
		var hashtagsToAddLine = results.response;
		var hashtagsToAddArray = hashtagsToAddLine.split(",").map(function(hashtagToAdd) {
			return hashtagToAdd.trim();
		});
		
		session.conversationData.hashtags = hashtagsToAddArray.concat(session.conversationData.hashtags);
		session.endDialog();
    }
]);


function printArray(array) {
	var hashtagsString = "";
	array.forEach(function(hashtag) {
		if (hashtagsString != "") {
			hashtagsString += ", ";
		}
		hashtagsString += hashtag;
	});
	
	return hashtagsString;
}


function getHashtagsForPhoto(theObject) {
	return ["beach", "summer", "beautiful"];
}

function uploadPhoto() {
	return true;
}

