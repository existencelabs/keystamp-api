// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// mailer.js
//
// Keystamp-api demo node mailer wrapper
// =============================================================================
var config = require('../config'); // get our config file
var nodemailer = require('nodemailer');
	var smtpConfig = {
	host: config.mailer.host,
	port: config.mailer.port,
	secure: config.mailer.secure,
	auth: {
		user: config.mailer.auth.user,
		pass: config.mailer.auth.pass
	}
}
module.exports ={ 
	"invite": function (sender, to, email, cb){
		// create reusable transporter object using the default SMTP transport 
		var transporter = nodemailer.createTransport(smtpConfig);
		// setup e-mail data with unicode symbols 
		var mailOptions = {
			from: config.email, // sender address 
			to: email, // list of receivers 
			subject: 'Keystamp Invite ✔', // Subject line 
			text: 'Hi '+to+'You have been invited by '+sender+'to Keystamp at http://keystamp.io/register?invite=true&from='+sender, // plaintext body 
			html: [ 
				'<div><b>Hi '+to+'</b>', 
				'<p>You Have been invited to <a href="http://keystamp.io"> Keystamp </a> by '+sender+'</p> ',
				'<p> if you wish to join you can follow the link </p>',
				'<a href="http:keystamp.io/register?invite=true&from='+sender+'"> http:keystamp.io/register?invite=true&from='+sender+' </a>',
				'</div>'
				].join('')
			 
		};
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				return cb(error);
			}
			console.log('Message sent: ' + info.response);
			return cb(null)
});
}
}
