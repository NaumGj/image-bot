//Example POST method invocation 
var Client = require('node-rest-client').Client;
var client = new Client();

// Replace the subscriptionKey string value with your valid subscription key.
var subscriptionKeyVison = "13fb95a85c184168894c5491dc7718e0";
var uriBaseVison = "https://westeurope.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color";

// Replace the subscriptionKey string value with your valid subscription key.
var subscriptionKeyFace = "705fe0f57f974b79846c4620c4333c97";
var uriBaseFace = "https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age,gender,emotion";

function analyzeImage(url) {
    return  new Promise(resolve, reject) => {
        // set content-type header and data as json in args parameter 
         var args = {
            data: '{"url": ' + '"' + url + '"}',
            headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKeyVison}
        };

        client.post(uriBaseVison, args, function (data, response) {
            resolve(findFaces(url, data));
        });
    }
}

function findFaces(url, analyzeData) {

    var args = {
        data: '{"url": ' + '"' + url + '"}',
        headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKeyFace}
    };

    client.post(uriBaseFace, args, function (data, response) {
        handleResponse(analyzeData, data)
    });
}

function handleResponse(analyzeData, faceData) {
    console.log(analyzeData);
    console.log(faceData);

    //Handle Emotions
    var emotions = {"anger":0, "contempt":0, "disgust":0,"fear":0,"happiness":0,"neutral":0,"sadness":0,"surprise":0};

    for(var i = 0; i<faceData.length;i++) {
        var dict = faceData[i].faceAttributes.emotion;

        // Create items array
        var items = Object.keys(dict).map(function(key) {
            return [key, dict[key]];
        });

        // Sort the array based on the second element
        items.sort(function(first, second) {
            return second[1] - first[1];
        });

        emotions[items[0]]++ 
    }

    // Create items array
    var items = Object.keys(emotions).map(function(key) {
        return [key, dict[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    var json = JSON.parse('{ "NumOfPeople":'+ faceData.length + ', "caption":'+ JSON.stringify(analyzeData.description.captions[0].text) +', "tags":'+ JSON.stringify(analyzeData.description.tags) +', "mood":"' +items[0][0]+ '"}'); 
    console.log(json)

}

//EXAMPLE CALL
analyzeImage("https://udemy-images.udemy.com/course/750x422/92446_9dad_7.jpg").then(
function() {

}    );

}

