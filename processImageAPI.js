//Example POST method invocation 
var Client = require('node-rest-client').Client;

var client = new Client();

function processImage(url) {

    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "1c5abc7f2dd84c37aea599f0839d9048";

    var paramss = {
            "visualFeatures": "Categories,Description,Color",
            "details": "",
            "language": "en",
    };

    // set content-type header and data as json in args parameter 
    var args = {
        data: '{"url": ' + '"' + url + '"}',
        headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey}
    };

    // Replace or verify the region.
    //
    // You must use the same region in your REST API call as you used to obtain your subscription keys.
    // For example, if you obtained your subscription keys from the westus region, replace
    // "westcentralus" in the URI below with "westus".
    //
    // NOTE: Free trial subscription keys are generated in the westcentralus region, so if you are using
    // a free trial subscription key, you should not need to change this region.
    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color";

    client.post(uriBase, args, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
        //console.log(response);
    });
}

function findFaces(url) {
    
    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "ab5e7421bd1646a39fe1bd37be99cc42";

    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise";
    
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
    };

    var args = {
        data: '{"url": ' + '"' + url + '"}',
        headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey}
    };

    client.post(uriBase, args, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
        //console.log(response);
    });


}

processImage("https://www.bigdipper.in/wp-content/uploads/2017/07/friends.jpg");
findFaces("https://www.bigdipper.in/wp-content/uploads/2017/07/friends.jpg");
