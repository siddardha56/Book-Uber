import * as React from "react";
import { Form, FormGroup, Col, ControlLabel, Checkbox, FormControl, Button } from 'react-bootstrap'
import TimePicker from 'rc-time-picker';
import fetch from 'isomorphic-fetch';
import 'rc-time-picker/assets/index.css';

const googleKey = "AIzaSyB6ky0s6kmaxH15hsxsNHKuZeI6n_OG2eA";

class App extends React.Component {
	
	constructor() {
		super();

		this.state = {
			showMessage: false,
			start_latitude: '',
			start_longitude: '',
			end_latitude: '',
			end_longitude: '',
			email: '',
			time: ''
		}

		this.getSource = this.getSource.bind(this);
		this.getDestination = this.getDestination.bind(this);
		this.setEmail = this.setEmail.bind(this);
		this.setTime = this.setTime.bind(this);
		this.remindMe = this.remindMe.bind(this);
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

	remindMe() {
		
		this.setState({
			showMessage: false
		});

		if(this.state.start_latitude){
			fetch("http://localhost:8008/rest/sendMail", {
				method:"POST",
				headers: {
	                'Accept': 'application/json',
	                'Content-Type': 'application/json'
	        	},
				body: JSON.stringify({
					start_latitude: this.state.start_latitude,
					start_longitude: this.state.start_longitude,
					end_latitude: this.state.end_latitude,
					end_longitude: this.state.end_longitude,
					destTime: this.state.time,
					email: this.state.email
				}),
	        	dataType: 'json'
			})
			.then(response => { 
				console.log(response)
				return response.json();
			}).then(json => {
				if(json.message == 'Success')
					this.setState({
						showMessage: true
					});
				console.log(json);
			});
		}
	}

	render() {
		return <div>
			<h1>Uber Remainder</h1>
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
			{this.state.showMessage ? <h2 style={{'color': '#D83D05'}}>
				Remainder will be sent to your Email.
				</h2> : ''}
		</div>
	}
}

export default App;