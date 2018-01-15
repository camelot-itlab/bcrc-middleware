var method = $.request.parameters.get('method');
var testNodeExit = $.require("../nodejs/testNodeExit");

function postRequest() {
	try {
	    var requestObject = {
          "chaincodeId": "55a68a96ec848734c48c3e64f8acae15",
          "fcn": "createrequest",
          "args": [
            "sendningbupa456",
        	"recevingbupa456",
        	"suppmat789",
        	"oemmat7789",
        	"[\"crud\",\"test\"]"
          ]
        };
        
        var apiKey = "zMV7bgkx6RMa2CJhJfe8GkhZ1TkP42T4PGQzMtR37X6z8pztBHV0qtgvAc6J2vYFTUAKipEXcQrAbyEK2VONlGikMd5c06KSPDQpdn64Rg9VerG8aOC6FPYBqLxXRWN8xD8WgOfnIlO9huPxCmmLG9WFFt3oxH5PcWqE8NMJ1pc5ywRwnG4tX62ixgEVrojjNKVYZ0XDrguAUJZB3Us9YYdMKANAckbaJoIWjT4g6ad18OOjW5vVfvx8NftDpHqsyZdBpyvC8bp6m6W07e8VaRRwLGtDje8WrrF9J5GtiOSnaMrDEsaHaQIcWNSxwHIvC4DcKQ4HaAm23rOm4tPgWBY5ehmuhviDUYYTq9crcf6mNNDuhBAXyagDQsOLInLfvDCSoBHqoHdwCLnyzaERRj0p6lihI4uejHl6mmd4oNOGvcwRWjtHjKoJhEOycU8hFKqTw2RS798dCyhg9AuXno38HXEXtrRfVHUMXJRJFhHtwFDedqOkxRKZNkvdOKsf";
        
		var destination_package_1 = "bcrc.services.connectivity";
		var destination_package_2 = "bcrc.services";
		var destination_package_3 = "/connectivity";
		var destination_package_4 = "./connectivity";
		var destination_package_5 = "bcrc.ipdci.coredb.data.connectivity";
		var destination_name = "blockchain";
		var destination;

		if(method === "1") {
		    destination = $.net.http.readDestination(destination_package_1, destination_name);		}
		else if(method === "2") {
		    destination = $.net.http.readDestination(destination_package_2, destination_name);
		} else if(method === "3") {
		    destination = $.net.http.readDestination(destination_package_3, destination_name);
		} else if(method === "4") {
		    destination = $.net.http.readDestination(destination_package_4, destination_name);
		} else if(method === "5") {
		    destination = $.net.http.readDestination(destination_package_5, destination_name);
		}

		var client = new $.net.http.Client();
		// var destination = $.net.http.readDestination(destination_package, destination_name);
		var request = new $.web.WebRequest($.net.http.POST, "");
		request.headers.set("Content-Type", "application/json");
		request.headers.set("Accept", "application/json");
		request.headers.set("apikey", apiKey);
		request.setBody(JSON.stringify(requestObject));
		client.request(request, destination);
		return client.getResponse();

	} catch (e) {
		return "Error:" + e.message;
	}
}

$.response.setBody(JSON.stringify(testNodeExit.testBlockchainCall(1,2,3))); 
$.response.status = $.net.http.OK; 