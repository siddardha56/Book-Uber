# Book-Uber

## Setup Requirements

###Nginx Setup:

- Download NGINX for Windows [here](http://nginx.org/en/download.html)
- Configuration: Navigate to NGINX folder location in conf folder open nginx.conf file. Paste the following code:

```
server {
    listen 8008;
	
	location / {
        proxy_pass http://localhost:8056/;
    }
	
	location /rest/ {
		proxy_pass http://localhost:3000/rest/;
	}

    location /estimates/ {
        proxy_pass https://api.uber.com/v1/estimates/;
    } 
}

```
- Navigate to nginx folder location(in terminal) and run:
  * > nginx

### Code changes to send email.
- Goto services folder and Open uberservice.js file
  * Update your Sender's Email Authentication in line number 9, 10.
  * Specify Sender's email in line number 100 which is same as line number 9
  
- Download node (node version : 5.0 (older versions are not supported))
- Navigate to client folder location(in terminal) and run:
  * > npm install
  * > npm start // Client server(webpack-dev-server)
- Open another terminal and navigate to client folder location and run:
  * > node express.server.js //Node Server(Express server)

You can Listen at

> http://localhost:8008/
