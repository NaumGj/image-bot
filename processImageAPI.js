//Example POST method invocation 
var Client = require('node-rest-client').Client;

var client = new Client();

function analyzeImage(url) {

    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "13fb95a85c184168894c5491dc7718e0";

    // set content-type header and data as json in args parameter 
    var args = {
        data: '{"url": ' + '"' + url + '"}',
        headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey}
    };

    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color";

    client.post(uriBase, args, function (data, response) {
        // parsed response body as js object 
        //console.log(data);
        findFaces(url, data)
    });
}

function findFaces(url, analyzeData) {
    
    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "d1e75858a30d42fb8cd85424ff0dcb05";

    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age,gender,emotion";
    
    var args = {
        data: '{"url": ' + '"' + url + '"}',
        headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": subscriptionKey}
    };

    client.post(uriBase, args, function (data, response) {
        // parsed response body as js object 
        handleResponse(analyzeData, data)
    });
}

function createDescription(url) {
    analyzeImage("https://www.bigdipper.in/wp-content/uploads/2017/07/friends.jpg");
    findFaces("https://www.bigdipper.in/wp-content/uploads/2017/07/friends.jpg");

}

function handleResponse(analyzeData, faceData) {
    //console.log(analyzeData);
    //console.log(faceData);
    //var data2 = eval('('+ faceData + ')');
    //console.log(JSON.stringify(analyzeData.description))

    var json = JSON.parse('{ "NumOfPeople":'+ faceData.length + ', "caption":'+ JSON.stringify(analyzeData.description.captions.text) +', "city":"New York"}'); 

    console.log(json)


}

createDescription("");

