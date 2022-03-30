import json

with open('en-es.json', encoding='utf-8') as json_file:
	data = json.load(json_file)
	#print(data.keys)
	leters = data["dic"]["l"]
	words = []
	for letter in leters:
		words.append(letter["w"])
	
	with open('json_data.json', 'w', encoding='utf-8') as outfile:
	    json.dump(words, outfile, ensure_ascii=False)
