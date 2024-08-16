#!/bin/bash

# ref: https://www.youtube.com/watch?v=tSoFTD9Y8UU

exec 3<>/dev/tcp/github.com/80

lines=(
	'GET / HTTP/1.1'
	'Host: github.com'
	'Connection: Close'
	''
)

printf '%s\r\n' "${lines[@]}" >&3

while read -r data <&3; do
	echo "server data: $data"
done

exec 3>&-
