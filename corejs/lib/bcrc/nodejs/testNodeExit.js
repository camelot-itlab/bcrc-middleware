var request = require('request');
exports.testBlockchainCall = function (param) {

    console.error("testBlockchainCall: " + "function entered");

    var requestObject = {
        "chaincodeId": "3c795e2e0151c91dc134087674f314a9",
        "fcn": "addregulatedcompound",
        "args": [
            "eu",
            "child",
            "0000119-61-9",
            "2",
            "%",
            "le"
        ]
    };

    var apiKey = 'E7eI4bYaVuiwfAkyk9bFIZGzJju9rRTmuRKtJg2303hKWZyLpfn6IWhoRS4c26LXOMlNCjZ4uK3evGBxNgidp5swPn9yFJTTe9wY9gxoTamaSP1RmHkFljmwA567ZZhaiSKs26MLMPEbjgVPrIuejrbHmkBBWVQnudOYM77JkUj9ozYm9PJ4dDhCbDLX7dzHMzjccvu2qKv9ULOaP8BYDhOc6vrxmaHhWFhWNoJmrkgGgmZRBw4RPpRcqUortS8zuwklwxqKLRpGH89m4LVkC75x2xq6zLUPibfE2CtyAv0WMcTQSvfx03a6nKdlmuPHspoWfYPjyDVJp1479P1hLBhdVN2e1QBXVpMc4iGwG8fiL4inYNwypOhY8X8sCv97BWJDdKTdweuIgsnJkmmfQibXcuJ4DoiMY92vnJ7iK3Pv93Rk9MG7O4WyVX8hmGMzjOTJGNHNNTBFiZpboQZIRgZozePSQH0Ffqkiuv9BgR4VaFOR6sj0FReCTTUfZlMy';

    request.post({
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'apikey': apiKey, 'Connection': 'keep-alive', 'accept-encoding': 'gzip, deflate' },
        url: "https://hyperledger-api.cfapps.sap.hana.ondemand.com/invoke",
        body: requestObject,
        json: true
    }, function (error, response, body) {
        console.log(body);
        if (error) {
            console.error("testBlockchainCall: " + "function error : exit");
            console.error(JSON.stringify(error));
            return error;
        } else {
            console.log("testBlockchainCall: " + "function success: exit");
            console.log(JSON.stringify(response.body));
            return response.body;
        }
    });

};

exports.testBlockchainCalltrial2 = function (param) {

    console.error("testBlockchainCall trial2: " + "function entered");

    var https = require('https');
    var querystring = require('querystring');
    var secret = "YOUR_KEY";
    var response = RESPONSE_CODE;
    var postData = "secret=" + secret + "&" + "response=" + response;
    // Build the post string from an object
    var post_data = querystring.stringify({
        'compilation_level': 'ADVANCED_OPTIMIZATIONS',
        'output_format': 'json',
        'output_info': 'compiled_code',
        'warning_level': 'QUIET',
        'js_code': postData
    });
    var options = {
        hostname: 'www.google.com',
        port: 443,
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            //'content-encoding': 'gzip',
            //'Connection': 'close'
        },
        agentOptions: {
            ciphers: 'DES-CBC3-SHA'
        }
    };
    var req = https.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log('Body: ' + body);
        });
    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    req.write(postData);
    req.end();

};

exports.testAPICall = function (param) {

    console.error("testAPICall: " + "function entered");

    request.get({
        url: "http://services.odata.org/V4/(S(a5jdp0ohcnruumsn4nmtlafo))/TripPinServiceRW/"
    }, function (error, response, body) {
        if (error) {
            console.error("testAPICall: " + "function error : exit");
            console.error(JSON.stringify(error));
            return error;
        } else {
            console.log("testAPICall: " + "function success: exit");
            console.log(JSON.stringify(response));
            return response;
        }
    });

};

exports.testNodeExit = function (param) {

    console.log("testNodeExit: " + "function entered");
    console.log("testNodeExit: param" + JSON.stringify(param));

    console.log("testNodeExit: arg" + JSON.stringify(arguments));

    var returnObject = {
        "param": param
    };

    return returnObject;
};