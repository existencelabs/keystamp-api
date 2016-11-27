// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/router.js
//
// Keystamp-api router
// =============================================================================

var config = require('../config'); // get our config file
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User   = require('../app/models/user'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var request = require('request')
var crypt = require('../app/encrypt')
var Message = require('../app/models/message')
BASE_URL = 'https://reghackto.herokuapp.com'
var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];
//require the Twilio module and create a REST client
var client = require('twilio')(config.ACCOUNT_SID, config.AUTH_TOKEN);

var telesign = require('telesign').setup({
  customerId: config.customerId,
  apiKey: config.apiKey
});

module.exports = function (supersecret, router) {

//test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ message: 'Welcome to keystamp API!' });   
});

// Create user and app
router.post('/create_user', function(req, res) {

	  // create a sample user
	  var user = new User({ 
		name: req.body.name ,
		email:req.body.email,
		phone: req.body.phone,
		role: req.body.role || "customer",
		assignedTo: req.body.assignedTo,
		uid: req.body.uid || req.body._id,
		user_key: req.body.user_key
	  });
	  if (req.body.role == 'firm'){
	  	  User.findOne({
	    "name": "OSC"
	  }, function(err, osc_user) {
		  var osc_key =  osc_user.user_key
	  request.post({url: BASE_URL+'/generate_firm_key', form: {"osc_key": osc_key ,"firm_id": req.body.uid}},function (error, response, body) {
		 // if(body.status == 'success'){
			  console.log(body)
			  user.user_key = JSON.parse(body).xprv
			  user.user_pub_key = JSON.parse(body).xpub
	  // save the sample user
	  user.save(function(err) {
	    if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'User '+req.body.uid+' was not saved.' 
			});
		}	    

	    console.log('User: '+ req.body.uid+' saved successfully');
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	    res.json({ success: true, user:user });
	  });	  		  
		  //}
		});
		});
		}else if (req.body.role == 'advisor'){
	  	  User.findOne({
	    "uid": req.body.assignedTo
	  }, function(err, adv_user) {
		  if(adv_user){
	  request.post({url: BASE_URL+'/generate_advisor_key', form: {"firm_key": adv_user.user_key ,"advisor_id": req.body.uid}},function (error, response, body) {
		  //if(body.status == 'success'){
			  console.log(body)		
			  user.user_key = JSON.parse(body).xprv
			  user.user_pub_key = JSON.parse(body).xpub
	  // save the sample user
	  user.save(function(err) {
	    if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'User '+req.body.uid+' was not saved.' 
			});
		}	    if (err) throw err;

	    console.log('User: '+ req.body.uid+' saved successfully');
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	    res.json({ success: true, user:user });
	  });				  		  
			  
		 // }
	  });
  
		}else{
				return res.status(403).send({ 
				success: false, 
				message: 'advisor need to be assigned to a firm '
			});
		}
		});
		}else{
			  user.save(function(err) {
	    if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'User '+req.body.uid+' was not saved.' 
			});
		}	    if (err) throw err;

	    console.log('User: '+ req.body.uid+' saved successfully');
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	    res.json({ success: true, user:user });	
		})
	}

});

// Middleware before authentification
router.post('/create_app', function(req, res) {

	  var app = new App({ 
			app_id: req.body.app_id,
			app_secret: req.body.app_secret
	  });

	  app.save(function(err) {
	    if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'App '+app.app_id+' was not saved.' 
			});
		}
	    console.log('App: '+ app.app_id+' saved successfully');
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	    res.json({ success: true , app:app});
	  });
	});
	
// Auth
// =====================================
router.post('/auth', function(req, res) {
		console.log(req.body.app_id)
	  // find the user
	  App.findOne({
	    "app_id": req.body.app_id
	  }, function(err, app) {
	    if (err || !app) {
			return res.status(403).send({ 
				success: false, 
				message: 'App does not exist.' 
			});
		}else {

	      // check if password matches
	      if (app.app_secret != req.body.app_secret) {
	        res.json({ success: false, message: 'Authentication failed. App not registered.' });
	      } else {
	        // if user is found and password is right
	        // create a token
	        var token = jwt.sign(app,supersecret, {
	          //expiresInMinutes: 1440 // expires in 24 hours
	        });
	        var id
	        User.findOne({"name":"OSC"},function(err, osc) {

			
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'Authentication succesful',
	          token: token,
			  osc:osc
	        });
	        });
	      }   
	    }
	  });
	});

//middleware to use for all requests while authenticated
router.use(function(req, res, next) {

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, supersecret, function(err, decoded) {      
	      if (err) {
	        return res.json({ success: false, message: 'Failed to authenticate token.' });    
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;    
	        next();
	      }
	    });

	  } else {

	    // if there is no token
	    // return an error
	    return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	    
	  }
	});

// Users: 
// ================================
router.route('/users') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json(users);
 });
});

router.route('/users/:users_id')
.put(function(req, res) {

    // use our user model to find the user we want
    User.findById(req.params.users_id, function(err, user) {

        if (err)
            res.send(err);

        user.name = req.body.name;  // update the user name
        user.password = req.body.password;  // update the user password
        user.admin = req.body.admin;  // update the user admin
        user.save(function(err) {
            if (err)
                res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
        res.json({ success:true , message: 'User updated!' , user: user});
        });

    });
});

router.route('/users/:users_id')
.delete(function(req, res) {
    User.remove({
        _id: req.params.user_id
    }, function(err, user) {
        if (err)
            res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
        res.json({ success:true, message: 'User: '+ user+' Successfully deleted' });
    });
});

// Hash api
//========================================

router.route('/upload/:user_id')
.post(function(req, res){
	var date = new Date();
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	var endpoint = '/hashme'
	var base_url ='https://reghackto.herokuapp.com'
	var path = req.body.path
		request.post({url: base_url+endpoint, form:{file_url:path}},function (error, response, body) {
			console.log('response: '+JSON.stringify(body) )
			if ( JSON.parse(body).status == 'success') {
				console.log(body) 
		User.findOne({uid: req.params.user_id},
		function(err, user) {
			if (err || !user)
				res.send(err);
		var filen = path.split("/")
		var name = [filen.length -1]
		var doc = {
			hash:JSON.parse(body).hash,
			updatedAt: day + ' ' + monthNames[monthIndex] + ' ' + year,
			path: path,
			signed: false,
			name: name
		}

		user.docs.push(doc)
		console.log('fetched user: '+user+' and doc: '+doc)
        user.save(function(err) {
            if (err)
                res.send(err);
        var ok = crypt(supersecret, path, 'newfile.dat',req.params.user_id)

		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
        res.json({ success:true , message: 'Docs saved', doc:doc });

        });
		});
		}else{
			return res.status(403).send({ 
	        success: false, 
	        message: 'upload did not work',
	        response:response
	    });
			}
		})
	});
//====================================
// Graph endpoints
// ================================

router.route('/search/osc') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {

		User.find(function(err, users) {
			if (err || !users){
				return res.status(403).send({ 
	        success: false, 
	        message: 'users does not exist'
	    });
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
        res.json({ success:true , message: 'Search successful', users: users });
	});		
 });

router.route('/search/advisor') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		var proj = { "role": "customer"}
		User.find(proj, function(err, users) {
			if (err || !users){
				return res.status(403).send({ 
	        success: false, 
	        message: 'users does not exist'
	    });
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
        res.json({ success:true , message: 'Search successful', users: users });
	});		
 });

router.route('/users/:users_id')
    .get(function(req, res) {
    // use our user model to find the user we want
    User.findOne({uid: req.params.users_id}, function(err, user) {
      if (err || !user){
			return res.status(403).send({ 
	        success: false, 
	        message: 'User des not exist'
			});
	  }

            res.setHeader('status', 200)
            res.setHeader("Content-Type", "application/json;charset=UTF-8")
      res.json({ success:true , message: 'User retrieved!' , user: user});
      });
    });
    
    
// Message api
//================================   

router.route('/get_messages/:users_id')
    .get(function(req, res) {
    Messages.find({"to": req.params.users_id}, function(err, mess) {
      if (err){
			return res.status(403).send({ 
	        success: false, 
	        message: 'No messages yet'
			});
	  }
      res.setHeader('status', 200)
      res.setHeader("Content-Type", "application/json;charset=UTF-8")
      res.json({ success:true , message: 'Messages retreived!' , mess: mess});
      });
    });

// Telesign
//==============================

router.route('/send_telesign/:users_id')
    .get(function(req, res) {
		User.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err){
			return res.status(403).send({ 
	        success: false, 
	        message: 'No messages yet'
			});
		}
		var phone = user.phone
		var pin = Math.random(5)
		var options = {
		phoneNumber: phone, // required
		ucid: 'BACF', // optional
		originatingIp: '', // optional
		language: '', // optional, defaults to 'en-US'
		verifyCode: pin, // optional, defaults to random value generated by TeleSign
		extensionType: 1, // optional, 1 for automated attendants, 2 for live operators, not included by default
		extensionTemplate: '1,,333', // optional, required if extensionType is specified, not included by default,
		redial: true // optional, defaults to true
	};
	
	user.last_pin = pin
	user.save()
	telesign.verify.call(options, function(err, response) {
		// err: failed request or error in TeleSign response
		// response: JSON response from TeleSign
		console.log(response)
	});
});
});

router.route('/verify_telesign/:users_id')
    .post(function(req, res) {
		var value = req.body.value	
		User.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err){
			return res.status(403).send({ 
	        success: false, 
	        message: 'user does not exist'
			});
		}
		var pin = user.last_pin
		if (value != pin){
			return res.status(403).send({ 
	        success: false, 
	        message: 'pin does not match'
			});
		}else{
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'Pin matched successfully' });	
		}	
	});
});
router.route('/send_sms/:users_id')
    .get(function(req, res) {
//require the Twilio module and create a REST client
		User.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err){
			return res.status(403).send({ 
	        success: false, 
	        message: 'No messages yet'
			});
		}
		var phone = user.phone
		var pin = Math.floor(Math.random()*90000) + 10000;
		user.last_pin = pin
		user.save()
//Send an SMS text message
client.sendMessage({

    to: '514-607-9665', // Any number Twilio can deliver to
    from: config.twilio_phone, // A number you bought from Twilio and can use for outbound communication
    body: pin // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."

    }
});
	});
});
router.route('/verify_sms/:users_id')
    .post(function(req, res) {
		var value = req.body.value	
		User.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err){
			return res.status(403).send({ 
	        success: false, 
	        message: 'user does not exist'
			});
		}
		var pin = user.last_pin
		if (value != pin){
			return res.status(403).send({ 
	        success: false, 
	        message: 'pin does not match'
			});
		}else{
			if(req.body.accepted){
				user.status = "pin_confirmed"
			}
			user.lastUpdated = Date.now()
			user.save()
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'Pin matched successfully' });	
		}	
	});
});
// Keys api 
// ===============================================
router.route('/notarize/:users_id')
    .post(function(req, res) {
		var value = req.body.value	
		User.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err || !user){
			return res.status(403).send({ 
	        success: false, 
	        message: 'user does not exist'
			});
		}
		var docs = []
		var check = 0
		var l = user.docs.length
		if(user.docs.length){
		for (i = 0; i < user.docs.length; i++) { 
		var d= user.docs[i]

			console.log(JSON.stringify(d.hash))
				console.log('i= '+i+' l= '+l)		
		request.post({url: BASE_URL+'/notarizeme', form: {'text':d.hash }},function (error, response, body) {
			// if(body.status == 'success'){
			docs.push(d.hash)
			console.log(JSON.stringify(d.hash))
			
		});
			check = check+1
		}
		console.log('check= '+check+' l= '+l)
		if(check == (l)){
			user.status = "doc_notarized"
			user.lastUpdated = Date.now()
			user.save()
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: docs + ' Notarized successfully' });	
		}
	}
	});

});

// lists api
//====================================


//getfirm
// Users: 
// ================================
router.route('/get_firms') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find({"role":"firm" }, function(err, firms) {

		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, firms: firms});
 });
});

//getadvisors
router.route('/get_advisors/:firm') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find({"role":"advisor", "assignedTo": req.params.firm }, function(err, advisors) {

		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, advisors: advisors});
 });
});

//getusers
router.route('/get_customers/:advisor') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find({"role":"customer", "assignedTo": req.params.advisor }, function(err, customers) {
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, customers: customers});
 });
});

//getdocument
router.route('/get_all_document') 

	.get(function(req, res) {
		User.find(function(err, users) {
			var docs =[]
		for (i = 0; i < users.length; i++) { 
			if(users[i].docs != []){
			docs.push(users[i].docs)
		}
		}	
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, docs: docs});
 });
});


//getdocument
router.route('/issuer/get_all_advisors') 

	.get(function(req, res) {
		User.find({"role":"advisor"},function(err, advisors) {
	
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, advisors: advisors});
		});
});

}//end of api
