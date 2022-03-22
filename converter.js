const { readFileSync, writeFileSync } = require('fs')

let template = readFileSync('./datasets/ttl/template.ttl', 'utf8')

let fontaines_txt = readFileSync('./datasets/csv/fontaines.csv', 'utf8')
let fontaines_lines = fontaines_txt.split('\n')
fontaines_lines.shift(1)
let wifi_txt = readFileSync('./datasets/csv/wifi.csv', 'utf8')
let wifi_lines = wifi_txt.split('\n')
wifi_lines.shift(1)

function to_geopoint_rdf(index, lat, long) {
  return `individual:geopoint${index}\n  rdf:type class:GeoPoint ;\n  property:latitude "${lat}" ;\n  property:longitude "${long}" .\n\n`
}
function to_fontaine_rdf(index, commune, voie, disponible, geopoint_index) {
  return `individual:fontaine${index}\n  rdf:type class:Fontaine ;\n  property:commune "${commune}" ;\n  property:voie "${voie}" ;\n  property:disponible "${disponible}" ;\n  property:geopoint individual:geopoint${geopoint_index} .\n\n`
}
function to_wifi_rdf(index, commune, geopoint_index) {
  return `individual:wifi${index}\n  rdf:type class:Wifi ;\n  property:commune "${commune}" ;\n  property:geopoint individual:geopoint${geopoint_index} .\n\n`
}

let fontaine_index = 1
let geopoint_index = 1
let wifi_index = 1

for (let line of fontaines_lines) {
  let values = line.split(';')
  let geopoint_coord = values[12].split(',')

  let geopoint = to_geopoint_rdf(geopoint_index, geopoint_coord[0], geopoint_coord[1])
  let fontaine = to_fontaine_rdf(fontaine_index, values[6], values[5], values[7], geopoint_index)

  template += geopoint + fontaine
  geopoint_index += 1
  fontaine_index += 1
}

for (let line of wifi_lines) {
  let values = line.split(';')
  let arr = parseInt(values[2].slice(3, 5))

  let commune = 'PARIS ' + arr.toString() + (arr==1?'ER':'EME') + ' ARRONDISSEMENT'
  let geopoint_coord = values[7].split(',')

  let geopoint = to_geopoint_rdf(geopoint_index, geopoint_coord[0], geopoint_coord[1])
  let wifi = to_wifi_rdf(wifi_index, commune, geopoint_index)

  template += geopoint + wifi
  geopoint_index += 1
  wifi_index += 1
}

writeFileSync('./datasets/ttl/data.ttl', template, 'utf8')
