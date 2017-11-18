var Client = require('node-rest-client').Client;
var client = new Client();

const config = {
    vision: {
        subscriptionKey: "13fb95a85c184168894c5491dc7718e0",
        uriBase: "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color"
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

    // Create items array
    var items = Object.keys(emotions).map(function (key) {
        return [key, dict[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    return new Promise((resolve, reject) => {
        try {
            var result = {
                numOfPeople: faceData.length,
                caption: analyzeData.description.captions[0].text,
                tags: analyzeData.description.tags,
                mood: items[0][0]
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

//EXAMPLE CALL
analyzeImage("https://udemy-images.udemy.com/course/750x422/92446_9dad_7.jpg").then(
    function (success) {
        console.log(success);
    },
    function (error) {
        console.log(error);
    }
);


