#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2019 Niklas Semmler <niklas.semmler@mailbox.org>
#
# Distributed under terms of the MIT license.

import csv
import re
import json
import pprint
import sys

pp = pprint.PrettyPrinter(indent=2)
pprint = pp.pprint

def replace_names(names):
    new_names = []
    regex = re.compile(r'[^0-9]*([0-9]+)[^0-9]*')
    for name in names:
        if name == 'Zeitstempel':
            new_names.append('time')
        elif 'Kategorie' in name:
            new_names.append('category')
        elif name.startswith('Frage'):
            new_names.append('question')
        elif name.startswith('Bild') or name.startswith('img'):
            new_names.append('img')
        elif name.startswith('Antwort'):
            numbers = regex.findall(name)
            if numbers:
                new_names.append('answer' + numbers[0])
            else:
                new_names.append(name)
        elif name.startswith('Richtige'):
            new_names.append('correct')
        else:
            new_names.append(name)
    return new_names

def parse_line(line):
    result = {}
    answers = ["", "", "", ""]
    regex = re.compile(r'[^0-9]*([0-9]+)[^0-9]*')
    if 'category' in line:
        if 'Popkultur' in line['category']:
            result['round'] = 0
        elif 'Familienduell' in line['category']:
            result['round'] = 1
        elif 'Montagsmaler' in line['category']:
            result['round'] = 2
        else:
            raise Exception("Could not parse category: " + line['category'])
    else:
        print(line)
        raise Exception("No 'category' in line")
    if 'question' in line:
        img = ""
        if 'img' in line:
            img = line['img']
        result['question'] = {'txt': line['question'], 'img':img}
    else:
        print(line)
        raise Exception("No 'question' in line")
    if 'correct' in line:
        numbers = regex.findall(line['correct'])
        if numbers:
            result['solution'] = {'correct': int(numbers[0])-1}
        else:
            raise Exception("Could not parse " + line['correct'])
    else:
        print(line)
        raise Exception("No 'correct' in line")
    
    answer_keys = [k for k in line.keys() if k.startswith('answer')]
    for answer in answer_keys:
        numbers = regex.findall(answer)
        if numbers:
            answers[int(numbers[0])-1] = line[answer]
        else:
            raise Exception("Could not parse: " + answer)
    result['answers'] = answers
    return result

def parse_csv(reader):
    first = True
    header = []
    for line in reader:
        if first:
            header = replace_names(line)
            first = False
        else:
            yield zip(header, line)

result = [
        {'type':"normal", "price": 50, "questions":[],
         'intro': {
             "txt": "Runde 1",
             "type": "img",
             "url": "runde1.jpg"
         }
        },
        { 'type':"reverse", "price": 100, "questions":[],
         'intro': {
             "txt": "Runde 2",
             "type": "img",
             "url": "runde2.jpg"
         }
        },
        { 'type':"normal", "price": 100, "questions":[],
         'intro': {
             "txt": "Runde 3",
             "type": "img",
             "url": "runde3.jpg"
         }
        },
    ]
if len(sys.argv) < 2:
    print("{} <csv-file>".format(sys.argv[0]))
    sys.exit(1)

lines = []
with open("Quizzfragen - Formularantworten.csv", 'r') as f:
    r = csv.reader(f, delimiter=",", quotechar="\"")
    for line in parse_csv(r):
        lines.append(parse_line(dict(line)))

for line in lines:
    rid = line['round']
    del line['round']
    result[rid]['questions'].append(line)

print("Note: images might have to be added manually")
with open('inputQuestions.json', 'w') as f:
    f.write(json.dumps(result, indent=2))
