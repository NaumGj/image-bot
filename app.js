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
        builder.Prompts.text(session, "Alou... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
		session.send("Hi " + results.response);
		builder.Prompts.attachment(session, "Upload a picture for me.");
		//builder.Prompts.number(session, "Hi " + results.response + ", please upload a picture?!");
        // builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
    },
    /*function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name + 
                    " you've been programming for " + session.userData.coding + 
                    " years and use " + session.userData.language + ".");
    },*/
	function (session, results) {
		console.log(results);
		console.log(session.message);
		var msg = session.message;
		if (msg.attachments && msg.attachments.length > 0) {
			// Echo back attachment
			var attachment = msg.attachments[0];
			session.send("You sent: " + JSON.stringify(attachment));
			session.send(attachment.name);
			session.send(attachment.size);
			session.send({
				text: "You sent:",
				attachments: [
					{
						contentType: attachment.contentType,
						contentUrl: attachment.contentUrl,
						name: attachment.name
					}
				]
			});
		} else {
			// Echo back users text
			session.send("You said: %s", session.message.text);
		}
	}
]);
