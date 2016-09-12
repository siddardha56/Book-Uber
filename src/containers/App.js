import * as React from "react";
import { Form, FormGroup, Col, ControlLabel, Checkbox, FormControl, Button } from 'react-bootstrap'
import TimePicker from 'rc-time-picker';
import fetch from 'isomorphic-fetch';
import 'rc-time-picker/assets/index.css';

const googleKey = "AIzaSyB6ky0s6kmaxH15hsxsNHKuZeI6n_OG2eA";
const uberKey = "ECWcv5urK26d-pz-OHio9c9ovHpahx4UBbQIzMTi";

class App extends React.Component {
	
	constructor() {
		super();

		this.state = {
			start_latitude: '',
			start_longitude: '',
			end_latitude: '',
			end_longitude: '',
			email: '',
			time: '',
			waitEstimate: '',
			travelTime: ''
		}

		this.getSource = this.getSource.bind(this);
		this.getDestination = this.getDestination.bind(this);
		this.setEmail = this.setEmail.bind(this);
		this.setTime = this.setTime.bind(this);
		this.remindMe = this.remindMe.bind(this);
		this.getTimeEstimate = this.getTimeEstimate.bind(this);
		this.getPriceEstimate = this.getPriceEstimate.bind(this);
		this.getPriceTime = this.getPriceTime.bind(this);
		this.calculateTimeDiff = this.calculateTimeDiff.bind(this);

	}

	getSource(e) {
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + e.target.value + "&key=" + googleKey;
		if(e.target.value)
			this.getLatLong(url, true);
	}

	getDestination(e) {
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + e.target.value + "&key=" + googleKey;
		if(e.target.value)
			this.getLatLong(url, false);	   		
	}

	getLatLong(url, isSource )  {
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
	    	if(isSource)
			    this.setState({
			   		start_latitude : json.results[0]["geometry"]["location"]["lat"],
			   		start_longitude: json.results[0]["geometry"]["location"]["lng"]
			   	});
			else
			    this.setState({
			   		end_latitude : json.results[0]["geometry"]["location"]["lat"],
			   		end_longitude: json.results[0]["geometry"]["location"]["lng"]
			   	});
	   	});
	}

	setTime(value) {
		this.setState({
			time: (parseInt(value.format('HH')) * 60) + parseInt(value.format('mm'))
		});
	}

	setEmail(e) {
		this.setState({
			email: e.target.value
		})
	}

	calculateTimeDiff() {
		
		var currentTime = new Date();
		var currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
		var timeDiff = this.state.time - currentTimeInMinutes - this.state.waitEstimate/60 - this.state.travelTime/60;
		var self = this, interval;
		if(timeDiff > 1){
			if((this.state.time - currentTimeInMinutes) > 60)
				interval = (this.state.time - currentTimeInMinutes - 60) * 60;
			if(timeDiff <= 60)
				interval = 15 * 60;
			if(timeDiff <= 15)
				interval = 5 * 60;
			if(timeDiff <= 5)
				interval = 60;
			console.log(timeDiff, interval, this.state.time, currentTimeInMinutes);
			setTimeout(function() {
				self.remindMe();
			}, interval * 1000);
		}
		else if(timeDiff < 0) {
			alert("Sorry, too Late to book!");
		}
		else alert("Time to go");
		
	}

	getPriceTime(url, isTime) {
		
		fetch(url, {
			method: 'GET',
	        credentials: 'same-origin',
	        headers: {
	            'Accept': 'application/json'
	        },
	        dataType: 'json'
		})
		.then((response) => {
	        return response.json();
	    })
	    .then(json => {
	    	if(isTime)
		    	json.times.map(product => {
		    		if(product.display_name == "uberGO")
		    			this.setState({
		    				waitEstimate: product.estimate
		    			});
		    	});
		    else
		  		json.prices.map(product => {
		  			if(product.display_name == "uberGO"){
		  				this.setState({
		  					travelTime: product.duration
		  				});
		  				this.calculateTimeDiff();
		  			}
		  		}); 	
	    });
	}

	getPriceEstimate() {
		var url = "http://localhost:8008/estimates/price?start_latitude="+ this.state.start_latitude + "&start_longitude=" + this.state.start_longitude + "&end_latitude=" + this.state.end_latitude + "&end_longitude=" + this.state.end_longitude + "&server_token=" + uberKey;
		if(this.state.end_latitude)
			this.getPriceTime(url, false);
	}

	getTimeEstimate() {
		var url = "http://localhost:8008/estimates/time?start_latitude="+ this.state.start_latitude + "&start_longitude=" + this.state.start_longitude + "&server_token=" + uberKey;
		this.getPriceTime(url, true);
	}

	remindMe() {
		if(this.state.start_latitude){
			this.getTimeEstimate();
			this.getPriceEstimate();
		}
	}

	render() {
		return <div>
			<Form horizontal>
			    <FormGroup controlId="formHorizontalSource">
			      <Col componentClass={ControlLabel} sm={2}>
			        Source
			      </Col>
			      <Col sm={2}>
			        <FormControl type="text" placeholder="Source" onBlur={this.getSource} />
			      </Col>
			    </FormGroup>

			    <FormGroup controlId="formHorizontalDestinaion">
			      <Col componentClass={ControlLabel} sm={2}>
			        Destination
			      </Col>
			      <Col sm={2}>
			        <FormControl type="text" placeholder="Destination" onBlur={this.getDestination}/>
			      </Col>
			    </FormGroup>

				<FormGroup controlId="formHorizontalDestinaion">
			      <Col componentClass={ControlLabel} sm={2}>
			        Time
			      </Col>
			      <Col sm={3}>
			        <TimePicker
			        	showSecond={false}
			        	onChange={this.setTime}
			        />
			      </Col>
			    </FormGroup>
			    
			    <FormGroup controlId="formHorizontalEmail">
			      <Col componentClass={ControlLabel} sm={2}>
			        Email
			      </Col>
			      <Col sm={2}>
			        <FormControl type="email" placeholder="Email" onChange={this.setEmail}/>
			      </Col>
			    </FormGroup>

			    <FormGroup>
			      <Col smOffset={2} sm={10}>
			        <Button
			        	type="button"
			        	onClick={this.remindMe}
			        >
			          Remind Me
			        </Button>
			      </Col>
			    </FormGroup>
			</Form>
		</div>
	}
}

export default App;