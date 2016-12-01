// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// autouser.js
//
// Keystamp-api demo users creator
// =============================================================================
module.exports = function (cb){
var request = require('request')
var mongoose   = require('mongoose');
var User2   = require('./models/user2'); // get our mongoose model
var config = require('../config'); // get our config file

// Check if any user are available in mongodb
User2.find( function(err, users) {
	console.log('Keystamp db is empty and will populate in a few seconds ')
	if (users.length < 1){
		BASE_URL = 'https://reghackto.herokuapp.com'
		request.get(BASE_URL+'/generate_master_seed',function (error, response, body) {
			console.log(body)
			config.OSC_KEY = JSON.parse(body).xprv
			var user = new User2({ 
				name: "OSC" ,
				email:"osc@osc.gov.on.ca",
				role: "osc",
				uid: 00001,
				user_key: JSON.parse(body).xprv,
				user_pub_key: JSON.parse(body).xpub
			});
			// osc got its key
			user.save(function(err) {	
				console.log(" mongodb osc user created")
				// generate the firm key
				request.post({url: BASE_URL+'/generate_firm_key', form: {"osc_key": config.OSC_KEY ,"firm_id": 55677}},function (error, response, body_f) {
					console.log(body)
					// then create a firm
					var user = new User2({ 
						name: "Thomas Kyles" ,
						email:"thomas@fmi.com",
						role: "firm",
						assignedTo: "1",
						uid: 55677,
						user_key: JSON.parse(body_f).xprv,
						user_pub_key:JSON.parse(body_f).xpub
					});
					firm_key = JSON.parse(body_f).xprv
					// save the firm
					user.save(function(err) {	
						console.log(" db has been populated by Thomas Kyles")
					});	
					request.post({url: BASE_URL+'/generate_advisor_key', form: {"firm_key": firm_key, "advisor_id": 66789}},function (error, response, body_a) {
						console.log(JSON.parse(body_a).xprv)		
						// then create an advisor
						var user = new User2({ 
						name: "Jannete Bohn" ,
						email:"jannete@hotmail.com",
						assignedTo: "55677",
						role: "advisor",
						uid: 66789,
						user_key: JSON.parse(body_a).xprv,
						user_pub_key:  JSON.parse(body_a).xpub
						});
						// save the advisor
						user.save(function(err) {	
							console.log(" db has been populated by Jannete Bohn")

				//  finally create a customer
				var user = new User2({ 
					name: "Johnathan" ,
					email:"jonathan@gmail.com",
					assignedTo: "66789",
					role: "customer",
					uid: 22314,
					user_key: "none"
				});
				// save the sample customer
				user.save(function(err) {
					console.log(" db has been populated by Johnathan")
					return cb()
				});
			});
		});
		});
		});
		});
		}else{
			return cb()
		}
	});
}
