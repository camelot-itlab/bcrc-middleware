var request = require('request');
var uuidv1 = require('uuid/v1');

var apiKey = 'zMV7bgkx6RMa2CJhJfe8GkhZ1TkP42T4PGQzMtR37X6z8pztBHV0qtgvAc6J2vYFTUAKipEXcQrAbyEK2VONlGikMd5c06KSPDQpdn64Rg9VerG8aOC6FPYBqLxXRWN8xD8WgOfnIlO9huPxCmmLG9WFFt3oxH5PcWqE8NMJ1pc5ywRwnG4tX62ixgEVrojjNKVYZ0XDrguAUJZB3Us9YYdMKANAckbaJoIWjT4g6ad18OOjW5vVfvx8NftDpHqsyZdBpyvC8bp6m6W07e8VaRRwLGtDje8WrrF9J5GtiOSnaMrDEsaHaQIcWNSxwHIvC4DcKQ4HaAm23rOm4tPgWBY5ehmuhviDUYYTq9crcf6mNNDuhBAXyagDQsOLInLfvDCSoBHqoHdwCLnyzaERRj0p6lihI4uejHl6mmd4oNOGvcwRWjtHjKoJhEOycU8hFKqTw2RS798dCyhg9AuXno38HXEXtrRfVHUMXJRJFhHtwFDedqOkxRKZNkvdOKsf';
var chaincodeURL = "https://hyperledger-api.cfapps.eu10.hana.ondemand.com/invoke";
var chaincodeID = "78354e91d95ea046e1449251d4b45ab0";

exports.createRequest = function (oParams) {
    console.info("createRequest: " + "function enter");

    var requestUUId = uuidv1();
    var requestObject = {
        "chaincodeId": chaincodeID,
        "fcn": "createrequest",
        "args": [
            requestUUId,
            oParams.SendingBusinessPartnerID, // sending business partner ID
            oParams.BusinessPartnerID, // receiving business partner ID
            oParams.MaterialID, // sending business partner material ID
            oParams.ReceivingBusinessPartnerMaterialID, // receiving business partner material ID
            oParams.RegulationID,
            oParams.ApplicationAreaID,
            oParams.SubstanceID,
            oParams.DueDate,
        ]
    };    

    request.post({
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'apikey': apiKey, 'Connection': 'keep-alive', 'accept-encoding': 'gzip, deflate' },
        url: chaincodeURL,
        body: requestObject,
        json: true
    }, function (error, response, body) {
        if (error) {
            // Roll back request creation in HANA DB
            
            console.error("createRequest: " + "request callback error : exit");
            console.error(JSON.stringify(error));
            return {
                "status" : "error",
                "error" : error
            };
        } else {
            console.info("createRequest: " + "request callback success: exit");
            console.info(JSON.stringify(response.body));
            return {
                "status" : "success",
                "requestUUId" : requestUUId,
                "response" : response.body
            };
        }
    });
    
    console.info("createRequest: " + "function exit");
};