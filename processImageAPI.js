var Client = require('node-rest-client').Client;
var client = new Client();

const config = {
    vision: {
        subscriptionKey: "13fb95a85c184168894c5491dc7718e0",
        uriBase: "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color&details=Celebrities,Landmarks"
    },
    face: {
        subscriptionKey: "705fe0f57f974b79846c4620c4333c97",
        uriBase: "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age,gender,emotion"
    }
};

function analyzeImage(url) {
    return new Promise((resolve, reject) => {
        client.post(config.vision.uriBase, buildArgs(url, config.vision.subscriptionKey), function (data, response) {
            resolve(findFaces(url, data));
        }).on('error', function (error) {
            reject(error);
        });
    });
}

function findFaces(url, analyzeData) {
    return new Promise((resolve, reject) => {
        client.post(config.face.uriBase, buildArgs(url, config.face.subscriptionKey), function (data, response) {
            resolve(handleResponse(analyzeData, data));
        }).on('error', function (error) {
            reject(error);
        });
    });
}

function handleResponse(analyzeData, faceData) {
    //Handle Emotions
    var emotions = {
        "anger": 0,
        "contempt": 0,
        "disgust": 0,
        "fear": 0,
        "happiness": 0,
        "neutral": 0,
        "sadness": 0,
        "surprise": 0
    };

	if(analyzeData == undefined || analyzeData == null) {
		console.log("Error, no object")
	}
	if(analyzeData.categories == undefined) {
		console.log("Error, second level")
	}
	if(analyzeData.categories[0].detail == undefined) {
		console.log("Error, third level")
		analyzeData.categories[0].detail = []
	}
    var celebrities = analyzeData.categories[0].detail.celebrities
	var landmarks = analyzeData.categories[0].detail.landmarks
	var celebritiesList = [];
	var landmarksList = [];

    if(celebrities) {
        celebrities.forEach(function(e) {
			celebritiesList.push(e.name)
        });
    }
	
	if(landmarks) {
		landmarks.forEach(function(l) {
			landmarksList.push(l.name)
        });
	}

    for (var i = 0; i < faceData.length; i++) {
        var dict = faceData[i].faceAttributes.emotion;

        // Create items array
        var items = Object.keys(dict).map(function (key) {
            return [key, dict[key]];
        });

        // Sort the array based on the second element
        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        emotions[items[0]]++
    }

	if(faceData.length>0) {
		 // Create items array
		var items = Object.keys(emotions).map(function (key) {
			return [key, dict[key]];
		});
		
		// Sort the array based on the second element
		items.sort(function (first, second) {
			return second[1] - first[1];
		});
	}else {
		var items = [[""]]
	}

    return new Promise((resolve, reject) => {
        try {
            var result = {
                numOfPeople: faceData.length,
                caption: analyzeData.description.captions[0].text,
                tags: analyzeData.description.tags,
                mood: items[0][0],
				celebrities: celebritiesList,
				landmarks: landmarksList
            };
            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
}

function buildArgs(url, key) {
    return {
        data: '{"url": ' + '"' + url + '"}',
        headers: {"Content-Type": "application/json", "Ocp-Apim-Subscription-Key": key}
    };
}

function generateDescription(numOfPeople, mood, landmarks, celebrities) {
    var text = ""

    if(celebrities.length>0) {
        text += "OMG!! Look who I met! "
        for(var i = 0; i<celebrities.length; i++) {
            text += celebrities[i] + " "
        }
        if(landmarks.length>0) {
            text += "at the " + landmarks[0]
        }
        text += "I can't freaking breath!!"
    } else if(numOfPeople==0 && landmarks.length>0) {
        text += "Taking in the beauty of the " + landmarks[0]
    } else {
        if(numOfPeople>1) {
            switch(mood) {
                case "happiness":
                    text += "Hanging out with my "+ (numOfPeople-1) +" best friends"
                    break;
                case "neutral":
                    text += "Relaxing with my "+ (numOfPeople-1) +" friends"
                    break;
                default:
                    text += "Just a picture of me and "+ (numOfPeople-1) +" other people"
                    break;
            }
            if(landmarks.length>0) {
                text += " by the " + landmarks[0]
            }
        } else if (numOfPeople == 1) {
            switch(mood) {
    			case "happiness":
                    text += "Feeling happy"
                    break;
                case "neutral":
                    text += "Relaxing"
                    break;
                default:
                    text +="Just a picture of me"
                    break;
            }
            if(landmarks.length>0) {
                text += " by the " + landmarks[0]
            }
        }
    }
    return text; 
}

//EXAMPLE CALL
analyzeImage("https://media1.britannica.com/eb-media/36/162636-004-B9E5EF88.jpg").then(
    function (success) {
        console.log(success);
        console.log(generateDescription(success.numOfPeople, success.mood, success.landmarks, success.celebrities))
    },
    function (error) {
        console.log(error);
    }
);

module.exports = {
    analyzeImage: analyzeImage
};


