var fetch = require('isomorphic-fetch');
const uberKey = 'ECWcv5urK26d-pz-OHio9c9ovHpahx4UBbQIzMTi';
var formData, waitEstimate, travelTime;

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: 'gmail', 
  auth: {
    user: 'YOUR.EMAIL@gmail.com', //enter your Emailid
    pass: 'EMAIL.PASSWORD' //password of your Email
  }
});

module.exports = function() {
	this.remindMe = function(details) {
		formData = details;
		if(details.start_latitude){
			this.getTimeEstimate(details.start_latitude,  details.start_longitude);
			this.getPriceEstimate(details);		
		}
	}

	this.getTimeEstimate = function(latitude, longitude) {
		var url = "http://localhost:8008/estimates/time?start_latitude="+ latitude + "&start_longitude=" + longitude + "&server_token=" + uberKey;
		this.getPriceTimeEstimate(url, true);
	}

	this.getPriceEstimate = function(coordinates) {
		var url = "http://localhost:8008/estimates/price?start_latitude="+ coordinates.start_latitude + "&start_longitude=" + coordinates.start_longitude + "&end_latitude=" + coordinates.end_latitude + "&end_longitude=" + coordinates.end_longitude + "&server_token=" + uberKey;
		this.getPriceTimeEstimate(url, false);
	}

	this.getPriceTimeEstimate = function(url, isTime) {
		fetch(url, {
			method: 'GET',
	        credentials: 'same-origin',
	        headers: {
	            'Accept': 'application/json'
	        },
	        dataType: 'json'
		})
		.then(response => {
			return response.json();
		})
		.then(json => {
	    	if(isTime)
		    	json.times.map(product => {
		    		if(product.display_name == "uberGO")
		    			waitEstimate = product.estimate;
		    	});
		    else
		  		json.prices.map(product => {
		  			if(product.display_name == "uberGO"){
	  					travelTime = product.duration;
		  				this.calculateTimeDiff();
		  			}
		  		});
		});
	}

	this.calculateTimeDiff = function() {
		var self = this, interval;
		
		var currentTime = new Date();
		var currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
		var totalTravelTime = waitEstimate/60 + travelTime/60;
		
		if(totalTravelTime > 60)  // According to assumption 3.
			totalTravelTime = 60;
		
		var timeDiff = formData.destTime - currentTimeInMinutes - totalTravelTime
		
		if(timeDiff > 1){
			if((formData.destTime - currentTimeInMinutes) > 60)
				interval = (formData.destTime - currentTimeInMinutes - 60) * 60;
			if(timeDiff <= 60)
				interval = 15 * 60;
			if(timeDiff <= 15)
				interval = 5 * 60;	
			if(timeDiff <= 5)
				interval = 60;
			
			setTimeout(function() {
				self.remindMe(formData);
			}, interval * 1000);
		}
		else if(timeDiff < -1) {
			console.log("Sorry, too Late to book!");
		}
		else {
			console.log("Time to go!");
			this.sendMail();
		}
	}

	this.sendMail = function() {
		console.log("Sending Email...");
		
		var mailOptions = {  //email options
		   from: "YOUR.EMAIL@gmail.com", // sender address.  Must be the same as authenticated user if using Gmail.
		   to: formData.email, // receiver
		   subject: "Time to book an uber!", // subject
		};

		smtpTransport.sendMail(mailOptions, function(error, resp){  //callback
		   if(error){
		       console.log(error);
		   }else{
		       console.log("Email sent to " + formData.email);
		   }
		   
		   smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.

		});
	}
}