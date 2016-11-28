# keystamp-api

###### Author : [Jean-Philippe beaudet](http://jeanphilippebeaudet.com) @ [Existence Labs](http://existencelabs.com)
First place at the [#RegHackTO](http://www.osc.gov.on.ca/en/reghackto.htm) 2016-11-25 to 27

Restful api to handle backend operation, database managment and wrap [kepstamp-cryto](https://github.com/existencelabs/keystamp-crypto) api.  
#### Installation: 
----
You must have [Node.js](https://nodejs.org/en/download/package-manager/), [npm](https://docs.npmjs.com/cli/install) and [mongoDb](https://docs.mongodb.com/v3.2/installation/l)  installed

Then clone the repo and in your project root type:

You can modify configs ports mondb connection and twilio api keys :

~~~~
module.exports = {
    'secret': 'Your_secret',
    'central_database': 'mongodb://localhost:27017/keystamp-api',
    'host': 'localhost',
    'port': 4000,
    'twilio_phone': '(your twilio phone number)',
    'ACCOUNT_SID': '<twilio ACCOUNT_SID> ',
    'AUTH_TOKEN': '<twilio AUTH_TOKEN>',
    "OSC_KEY": ""
};
~~~~

 #### Usage: 
 ----
`
npm install
`
 Then:
`
node server`

#### Dependencies:
----

~~~~
{
    "body-parser": "~1.0.1",
    "express": "~4.0.0",
    "file-encryptor": "0.1.1",
    "jsonwebtoken": "7.1.9",
    "mongoose": "~3.6.13",
    "morgan": "~1.0.0",
    "request": "2.79.0",
    "telesign": "https://github.com/ArthurGerbelot/node-telesign/tarball/master",
    "twilio": "2.1.0"
  }
~~~~

#### Keystamp api Endpoints:
----
 Base url      
~~~~
keystamp.io:4000/api/
~~~~
#### Failure response:
~~~~
Status: 403
Content-Type : "application/json;charset=UTF-8"
{ 
	success: false, 
	message: <error message>
}
~~~~
###### test the api 
---
enpoint: 
~~~~
GET
/
keystamp.io:4000/api/
~~~~~
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    message: 'Welcome to keystamp API!'
}
~~~~
#### Users:
###### create_user 
---
Using keystamp-crypto api 
@ https://reghackto.herokuapp.com/generate_firm_key
@ https://reghackto.herokuapp.com/generate_advisor_key

enpoint: 
~~~~
POST
/create_user
keystamp.io:4000/api/create_user
~~~~~
user body:
~~~~
xxx-url-encoded

var user = new User({ 
	name: req.body.name ,
	email:req.body.email,
	phone: req.body.phone,
	role: req.body.role || "customer",
	assignedTo: req.body.assignedTo,
	uid: req.body.uid || req.body._id,
	user_key: req.body.user_key
});
~~~~
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    success: true, 
    user: <user object> 
}
~~~~
###### get one user
---
enpoint: 
~~~~
GET
/users/:users_id?token=<token>
keystamp.io:4000/api/users/:users_id?token=<token>
~~~~~

params: req.params.uid
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    success: true,
    message: 'User retrieved!' ,
    user: <user>
}
~~~~
###### get all users
---
enpoint: 
~~~~
GET
/search/osc?token=<token>
keystamp.io:4000/api/search/osc?token=<token>
~~~~~

Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success: true,
    message: 'Search successful', 
    users: <users>
}
~~~~
###### get all advisors
---
enpoint: 
~~~~
GET
/search/advisor?token=<token>
keystamp.io:4000/api/search/advisor?token=<token>
~~~~~

Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    success:true ,
    message: 'Search successful', 
    users: <advisors>
}
~~~~
###### get all firms
---
enpoint: 
~~~~
GET
/search/get_firms?token=<token>
keystamp.io:4000/api/search/get_firms?token=<token>
~~~~~

Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success: true, 
    firms: <firms>
}
~~~~

###### get all advisors by firms
---
enpoint: 
~~~~
GET
/get_advisors/:firm?token=<token>
keystamp.io:4000/api/get_advisors/:firm?token=<token>
~~~~~

Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success: true, 
    advisors: advisors
}
~~~~
###### get all customers by advisor
---
enpoint: 
~~~~
GET
/get_customers/:advisor?token=<token>
keystamp.io:4000/api/get_customers/:advisor?token=<token>
~~~~~

Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success: true, 
    customers: <customers>
}
~~~~
###### get all document for a user
---
enpoint: 
~~~~
GET
/get_all_document?token=<token>
keystamp.io:4000/api/get_all_document?token=<token>
~~~~~

Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success: true, 
    docs: <docs>
}
~~~~
###### create_app
---
enpoint: 
~~~~
POST
/create_app
keystamp.io:4000/api/create_app
~~~~~
app object:
~~~~
xxx-url-encoded
var app = new App({ 
	app_id: req.body.app_id,
	app_secret: req.body.app_secret
});
~~~~
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    success: true, 
    app: <app object> 
}
~~~~
#### Authentication:
###### Authenticate
---
enpoint: 
~~~~
POST
/auth
keystamp.io:4000/api/auth
~~~~~
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success: true,
    message: 'Authentication succesful',
    token: <token>,
    osc: <osc object>
}
~~~~
###### 2-way auth send pin (sms using twilio test account)
---
enpoint: 
~~~~
GET
/send_sms/:users_id?token=<token>
keystamp.io:4000/api/send_sms/:users_id?token=<token>
~~~~~
params: req.params.user_id
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
    success:true , 
    message: 'sms sent successfully' 
}
~~~~
###### verify pin  (sms using twilio test account)
---
enpoint: 
~~~~
POST
/verify_sms/:users_id?token=<token>
keystamp.io:4000/api/verify_sms/:users_id?token=<token>
~~~~~
params: req.params.user_id
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    success:true ,
    message: 'Pin matched successfully'
}
~~~~

#### Keys api
###### notarize a document
---
Using keystam-crypto api @ https://reghackto.herokuapp.com/notarizeme
enpoint: 
~~~~
POST
/notarize/:users_id?token=<token>
keystamp.io:4000/api/notarize/:users_id?token=<token>
~~~~~
params: req.params.user_id
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{
 success:true,
 message: <Docs array> ' Notarized successfully' 
}
~~~~
#### Hash api 
###### Uplaod, hash and encrypt document for one user
@ https://reghackto.herokuapp.com/hashme
enpoint: 
~~~~
POST
/upload/:user_id?token=<token>
keystamp.io:4000/api/notarize/:users_id?token=<token>
~~~~~
params: req.params.user_id
Success response: 
~~~~
Status : 200
Content-Type : "application/json;charset=UTF-8"
{ 
    success: true ,
    message: 'Docs saved',
    doc: <saved document name>
}
~~~~

