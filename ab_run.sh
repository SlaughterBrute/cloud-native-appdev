AWS_LB_URL=http://tms-te-Publi-rEUth8XCfeEq-1255431067.eu-north-1.elb.amazonaws.com
ab -n 5 -T application/json -p test-data/request.json ${AWS_LB_URL}/content-request