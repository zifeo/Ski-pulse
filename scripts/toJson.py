#!bin/bash/python3

rmts = []
file = open("positions_remontées.rmt")

for line in file:
	line = line.split(" ")
	rmt = {
		"name": line[1].replace("\""),
		"start": {
			"x": Number(line[2],
			"y": line[3]
		},
		"stop": {
			"x": line[4],
			"y": line[5]
		}
	}
	rmts.append(rmt)
    
print(rmts)