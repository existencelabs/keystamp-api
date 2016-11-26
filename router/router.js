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
var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];
module.exports = function (supersecret, router) {


//test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {s
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ message: 'Welcome to keystamp API!' });   
});

// Create user and app
router.post('/create_user', function(req, res) {

	  // create a sample user
	  var user = new User({ 
		name: req.body.name ,
		role: req.body.role || "default",
		uid: req.body.uid,
		user_key: req.body.user_key
	  });

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
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'Authentication succesful',
	          token: token
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
    .get(function(req, res) {
    // use our user model to find the user we want
    User.findOne({uid: req.params.users_id}, function(err, user) {
      if (err)
        res.send(err);

            res.setHeader('status', 200)
            res.setHeader("Content-Type", "application/json;charset=UTF-8")
      res.json({ success:true , message: 'User retrieved!' , user: user});
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
			if (err)
				res.send(err);
				
		var doc = {
			hash:JSON.parse(body).hash,
			updatedAt: day + ' ' + monthNames[monthIndex] + ' ' + year
		}

		user.docs.push(doc)
		console.log('fetched user: '+user+' and doc: '+doc)
        user.save(function(err) {
            if (err)
                res.send(err);
        var ok = crypt(supersecret, path, 'newfile.dat')
        if(ok){
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
        res.json({ success:true , message: 'Docs saved', doc:doc });
		}else{
			return res.status(403).send({ 
	        success: false, 
	        message: 'encrypt has failed for '+path
	    });
		}
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

}//end of api
