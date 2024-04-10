AWS_LB_URL=http://tms-te-Publi-rEUth8XCfeEq-1255431067.eu-north-1.elb.amazonaws.com
output=$(curl -sX POST ${AWS_LB_URL}/content-request -H "Content-Type: application/json" -d @test-data/request.json)

id_half="${output%%\}}"
id="${id_half##*:}"

echo "$id"