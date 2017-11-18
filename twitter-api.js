var Twitter = require('twitter');
var http = require('http');
var Stream = require('stream').Transform;

var client = new Twitter({
    consumer_key: '6UWYgounnREoKRXrSTGro9n2f',
    consumer_secret: 'I2DeU2xiwUvkV3WK22XWmwNr4Je6jXDgBTW6mcZBuSLVhCJnak',
    access_token_key: '188018131-PAevoCoZ8ESkitiZLbBgAVBHsZdOop2QWOHK5qrZ',
    access_token_secret: 'A03h5PZHihNwWUqx7VC5iHiC5rmEVFkpDxQkZ7eBZoCwz'
});

const pathToMovie = 'http://media-cdn.tripadvisor.com/media/photo-s/0e/85/48/e6/seven-mile-beach-grand.jpg';
const mediaType = 'image/jpg'; // `'video/mp4'` is also supported
var mediaData = {};
var mediaSize = {};

function initUpload() {
    var payload = {
        command: 'INIT',
        total_bytes: mediaSize,
        media_type: mediaType,
    };

    return makePost('media/upload', payload).then(data => data.media_id_string);
}

function appendUpload(mediaId) {
    var payload = {
        command: 'APPEND',
        media_id: mediaId,
        media: mediaData,
        segment_index: 0
    };

    return makePost('media/upload', payload).then(data => mediaId);
}

function finalizeUpload(mediaId) {
    return makePost('media/upload', {
        command: 'FINALIZE',
        media_id: mediaId
    }).then(data => mediaId);
}

function makePost(endpoint, params) {
    return new Promise((resolve, reject) => {
        client.post(endpoint, params, (error, data, response) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function updateStatus(status, mediaId) {
    return makePost('statuses/update', {status: status, media_ids: mediaId});
}

function uploadTweet(imageUrl, status) {
    return new Promise((resolve, reject) => {
        http.request(imageUrl, function (response) {
            var data = new Stream();

            response.on('data', function (chunk) {
                data.push(chunk);
            });

            response.on('end', function () {

                mediaSize = data._readableState.length;
                mediaData = data.read();

                initUpload().then(appendUpload).then(finalizeUpload).then(mediaId => {
                    updateStatus(status, mediaId).then(
                        function (success) {
                            resolve(success);
                        }),
                        function (error) {
                            console.log(error);
                            reject(error);
                        }
                });
            });
        }).end();
    });
}

//EXAMPLE USAGE

// uploadTweet(pathToMovie, 'proba').then(
//     function (success) {
//         console.log(success);
//     },
//     function (error) {
//         console.log(error);
//     }
// );

function searchTweets(query) {
    return new Promise((resolve, reject) => {
        client.get('search/tweets', {q: query}, (error, data, response) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

//EXAMPLE USAGE

// searchTweets('proba').then(
//     function (success) {
//         console.log(success);
//     },
//     function (error) {
//         console.log(error);
//     }
// );

module.exports = {
    uploadTweet: uploadTweet
};
