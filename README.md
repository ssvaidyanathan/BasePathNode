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
