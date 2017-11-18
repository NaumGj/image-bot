//Example POST method invocation 
var Client = require('node-rest-client').Client;

var client = new Client();
var url = "https://www.scienceabc.com/wp-content/uploads/2017/02/Thailand-beach-sand.jpg"

// set content-type header and data as json in args parameter 
var args = {
    data: '{"url": ' + '"' + url + '"}',
    headers: { "Content-Type": "application/json", "Ocp-Apim-Subscription-Key": "1c5abc7f2dd84c37aea599f0839d9048"}
};

function processImage() {
    // **********************************************
    // *** Update or verify the following values. ***
    // **********************************************

    // Replace the subscriptionKey string value with your valid subscription key.
    var subscriptionKey = "1c5abc7f2dd84c37aea599f0839d9048";

    var paramss = {
            "visualFeatures": "Categories,Description,Color",
            "details": "",
            "language": "en",
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
    console.log(uriBase);

    client.post(uriBase, args, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
        //console.log(response);
    });
}

processImage();

    /*// registering remote methods 
    client.registerMethod("postMethod", "http://remote.site/rest/json/method", "POST");

    client.methods.postMethod(args, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
        console.log(response);
    });*/

        /*// Perform the REST API call.
        $.ajax({
            url: uriBase + "?" + $.param(params),

            // Request headers.
            beforeSend: function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },

            type: "POST",

            // Request body.
            data: '{"url": ' + '"' + sourceImageUrl + '"}',
        })

        .done(function(data) {
            // Show formatted JSON on webpage.
            $("#responseTextArea").val(JSON.stringify(data, null, 2));
        })

        .fail(function(jqXHR, textStatus, errorThrown) {
            // Display error message.
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
            alert(errorString);
        });
    };
*/