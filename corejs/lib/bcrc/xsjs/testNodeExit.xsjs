var method = $.request.parameters.get('method');
var testNodeExit = $.require("../nodejs/testNodeExit");

$.response.setBody(JSON.stringify(testNodeExit.testNodeExit(1,2,3))); 
$.response.status = $.net.http.OK; 