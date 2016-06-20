# Overview: Simple Search Service (CMS)

[Simple Search Service](https://github.com/ibm-cds-labs/simple-search-service) (or, SSS) is an IBM Bluemix app that lets you quickly create a faceted search engine, exposing an API you can use to bring search into your own apps. The service also creates a website that lets you preview the API and test it against your own data.

The Simple Search Service CMS allows you to further manage the data that you upload via the SSS.

## How it works

The application uses these Bluemix services:

* a Node.js runtime
* a Cloudant database

Once the CMS app is running, a UI is available to help you search, add, edit and delete date from your collection. All data adds or edits are subject to passing validation of the schema that was created on intial upload.

The add, edit and delete functionality is also available via API:

### Insert data

Insert new data using the `POST /row` endpoint as shown below:

```bash
curl -X POST /row -d'field_1=value_1&field_n=value_n'
```

The data that you pass through should match the fields in the schema that was created at the time of the initial data import. These fields will be type checked against this schema. No fields are required, but only valid fields are allowed.

Example responses:

```json
# success!
{
	"success": true,
	"data": {
		"ok":true,
		"id":"ce8ce7be2c665c132b15f1a37f92c1ce",
		"rev":"1-7343e92f08706e1408a1aeed6396b7d0"
	}
}
```

```json
# invalid field provided
{
	"success": false,
	"error": ["foo is not a valid parameter"]
}
```

```json
# invalid value type provided
{
	"success": false,
	"error": ["product_id must be a number, incorrect value set: ABC123"]
}
```

### Edit data

Edit existing data using the `PUTT /row/<row_id>` endpoint, as shown below:

```bash
curl -X PUT /row/ce8ce7be2c665c132b15f1a37f92c1ce -d'_id=ce8ce7be2c665c132b15f1a37f92c1ce&field_1=value_1&field_n=value_n'
```

This endpoint works very similarly to `POST /row`, with the extra requirement that the ID of the document should also be provided as part of the data string, in the `_id` parameter.

As with inserting data, make sure the fields and values provided match what is in the schema that was created at the time of the initial data import.

Example responses can be seen above.

> *Note:* This CMS app will attempt to take care of Cloudant document conflicts internally by automatically assuming the latest revision ID of the document when editing or deleting rows.

### Delete data

Remove data using the `DELETE /row/<row_id>` endpoint, as shown below:

```bash
CURL -X DELETE /row/ce8ce7be2c665c132b15f1a37f92c1ce
```

### Architecture Diagram

TO COME

## Running the app on Bluemix

The fastest way to deploy this application to Bluemix is to click the **Deploy to Bluemix** button below.

TO COME

## Running the app locally

Clone this repository then run `npm install` to add the Node.js libraries required to run the app.

Then create an environment variable that mimics Cloud Foundry e.g.

```sh
export VCAP_SERVICES='{"cloudantNoSQLDB":[{"name":"simple-search-service-cms-cloudant-service","label":"cloudantNoSQLDB","plan":"Shared","credentials":{"username":"USERNAME","password":"PASSWORD","host":"HOSTNAME","port":443,"url":"https://USERNAME:PASSWORD@HOSTNAME"}}]}'
```

replacing the `USERNAME`, `PASSWORD` and `HOSTNAME` placeholders for your own Cloudant account's details.

Then run:

```sh
node app.js
```

## Lockdown mode

If you want to restrict access to the CMS, simply set an environment variable called `LOCKDOWN` to `true` before running the Simple Search Service:

```sh
export LOCKDOWN=true
node app.js
```

or set a custom environment variable in Bluemix.

When lockdown mode is detected, all web requests will be get a `403` response except the `/` endpoint which will continue to work. This will allow the data to be searched, but not modified.

### Privacy Notice

The Simple Search ServiceCMS web application includes code to track deployments to Bluemix and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker](https://github.com/IBM-Bluemix/cf-deployment-tracker-service) service on each deployment:

* Application Name (`application_name`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)

This data is collected from the `VCAP_APPLICATION` environment variable in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

### Disabling Deployment Tracking

For manual deploys, deployment tracking can be disabled by removing `require("cf-deployment-tracker-client").track();` from the end of the `app.js` main server file.

#### License 

Copyright 2016 IBM Cloud Data Services

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
