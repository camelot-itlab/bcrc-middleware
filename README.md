<<<<<<< HEAD

# sap-plm-regulcomp-nodejs

# Setting up the development environment Install JAVA SDK 8: Add the bin path to the SYSTEM environment variable PATH

Install JDK and set the environment variable JAVA_PATH

# Node JS

Install NodeJS: https://nodejs.org/en/ -> v6 only: https://nodejs.org/download/release/latest-v6.x/

Set npm registry for sap modules:
Run following command -
npm config set @sap:registry https://npm.sap.com

Also set the proxy for npm installations and cf commands:
npm config set proxy http://proxy.wdf.sap.corp:8080
npm config set https-proxy http://proxy.wdf.sap.corp:8080
Set the environment variable 'https_proxy' to http://proxy.wdf.sap.corp:8080

# MTA Builder

Installing MTA: (Optional) Download latest MTA jar from this Git repo and copy it to the folder to build

Download and Install MTA plugin: https://tools.hana.ondemand.com/#cloud
cf install-plugin |path-to-mta-plugin-download| -f

MTA Build: Navigate to the root folder:
java -jar <path-to-mta.jar> –build-target=CF –mtar=bcrc-cf.mtar build
java -jar C:/Users/C5227884/Desktop/RegulatedCompounds/Development/mta.jar –build-target=CF –mtar=bcrc-cf.mtar build

# Optional Packages

Install Grunt: (Optional) npm install -g grunt

Installing Maven: (Optional) Download (https://maven.apache.org/download.cgi), unzip and add bin to environment variable Path

# Cloud Foundry CLI Commands:

Download and Install CF CLI: https://github.com/cloudfoundry/cli#downloads 

Set the target API endpoint:
cf api https://api.cf.sap.hana.ondemand.com - For Canary
cf api https://api.cf.eu10.hana.ondemand.com - For Trial accounts

Logon to the API endpoint:
cf login (Use C-user to logon)

Set the Organization and Space:

Create UAA service instance:
cf create-service xsuaa application bcrc-uaa -c xs-security.json
cf delete-service sap-portal-services-bcrc-host -f

Before deploying only keep one of the different data load schemes:
* core-db\src\data\loads\RegulatedCompounds.hdbtabledata
* core-db\src\data\loads\RegulatedCompounds-supp.hdbtabledata

Navigate to the project root path:
cf push
cf deploy hypertrust-cf.mtar
cf apps

Download logs of the deploy process
cf dmol -i 11659179
cf deploy -i 11732735 -a abort
 11707525, 11732735 (bcrc)


To undeploy and delete all its services run the command: 
cf undeploy |ID from .yaml|
=======
# bcrc-middleware
SAP FDA Regulated Compunds
>>>>>>> refs/remotes/origin/master
