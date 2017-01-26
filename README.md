# BasePathNode
This is a sample proxy to search the list of proxies deployed on Edge by basepath

----------------
Pre Requisites:
----------------
* Apigee Edge account
* Access to deploy proxy
* Maven

----------------
Steps:
----------------

* Clone this repo - `git clone https://github.com/ssvaidyanathan/BasePathNode.git`
* Run the following maven command :
	`mvn clean install -P{environment} -Dorg={org} -Dusername={username} -Dpassword={password}`

	For example:
		`mvn clean install -Ptest -Dorg=yourOrg -Dusername=abc@example.com -Dpassword=secretPwd`

* Once the maven command is successful, the proxy bundle must be deployed into Edge
* To run the API:
	* API takes the following parameters:
		* X-Org = The Edge Org where you want to search the basepath
		* X-Host = Mgmt Host (for example - api.enterprise.apigee.com)
		* Authorization = Basic auth (base64 encoded value of your Edge_User:Edge_Password)
		* Content-Type: application/json

	* To get all Basepaths:
		`https://{org}-{env}.apigee.net/v1/apis/basepaths`

	* To search for a basepath:
		`https://{org}-{env}.apigee.net/v1/apis/basepaths?search=abc`

----------------
Sample :
----------------

Request:

```
curl -X GET 
	-H "Content-Type: application/json" 
	-H "X-Host: api.enterprise.apigee.com" 
	-H "X-Org: testorg" -H "Authorization: Basic c3N2YWl***"  
	"https://{org}-{env}.apigee.net/v1/apis/basepaths?search=abc"
```

Response:

```
[
  {
    "basepath": "/abc/v1",
    "proxy": "currency-v1"
  },
  {
    "basepath": "/abcd1/v1/logs",
    "proxy": "currency-v1"
  }
]

```
