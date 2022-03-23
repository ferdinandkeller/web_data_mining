const { exec } = require('child_process')
const { readFile, writeFile, readFileSync } = require('fs')
const express = require('express')

// RDF CONVERTER
let header = readFileSync('./datasets/ttl/template.ttl', 'utf-8')

function to_geopoint_rdf(index, lat, long) {
  return `individual:geopoint${index}\n  rdf:type class:GeoPoint ;\n  property:latitude "${lat}" ;\n  property:longitude "${long}" .\n\n`
}
function to_fontaine_rdf(index, commune, voie, disponible, geopoint_index) {
  return `individual:fontaine${index}\n  rdf:type class:Fontaine ;\n  property:commune "${commune}" ;\n  property:voie "${voie}" ;\n  property:disponible "${disponible}" ;\n  property:geopoint individual:geopoint${geopoint_index} .\n\n`
}
function to_wifi_rdf(index, commune, geopoint_index) {
  return `individual:wifi${index}\n  rdf:type class:Wifi ;\n  property:commune "${commune}" ;\n  property:geopoint individual:geopoint${geopoint_index} .\n\n`
}

// SPARQL CODE
async function rdf_query0 () {
  let fontaines = await query0()
  let rdf = header
  let geo_index = 0
  let fontaine_index = 0
  for (let fontaine of fontaines) {
    rdf += to_geopoint_rdf(geo_index, fontaine.latitude, fontaine.longitude)
    rdf += to_fontaine_rdf(fontaine_index, fontaine.commune, fontaine.voie, fontaine.disponible, geo_index)
    geo_index += 1
    fontaine_index += 1
  }
  return rdf
}
function query0 () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query0.rq', (_, stdout) => {
      let lines = stdout.split('\n').slice(3, -2)
      let data = lines.map(line => {
        let split = line.split('|').slice(1, -1).map(x => x.trim())
        let fontaine = split[0]
        let commune = split[1].split('"')[1]
        let voie = split[2].split('"')[1]
        let disponible = split[3].split('"')[1]
        let latitude = parseFloat(split[4].split('"')[1])
        let longitude = parseFloat(split[5].split('"')[1])
        return { fontaine, commune, voie, disponible, latitude, longitude }
      })
      resolve(data)
    })
  })
}

function query0wifi () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query0-wifi.rq', (_, stdout) => {
      let lines = stdout.split('\n').slice(3, -2)
      let data = lines.map(line => {
        let split = line.split('|').slice(1, -1).map(x => x.trim())
        let wifi = split[0]
        let commune = split[1].split('"')[1]
        let latitude = parseFloat(split[2].split('"')[1])
        let longitude = parseFloat(split[3].split('"')[1])
        return { wifi, commune, latitude, longitude }
      })
      resolve(data)
    })
  })
}

function query0travel () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query0-travel-op.rq', (_, stdout) => {
      let lines = stdout.split('\n').slice(3, -2)
      let data = lines.map(line => {
        let split = line.split('|').slice(1, -1).map(x => x.trim())
        let travel = split[0]
        let traveler = split[1].split('"')[1]
        let name = split[2].split('"')[1]
        let date = split[3].split('"')[1]
        let wifi = split[4].split('"')[1]
        return { travel, traveler, name, date, wifi }
      })
      resolve(data)
    })
  })
}

function query0traveler () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query0-traveler.rq', (_, stdout) => {
      let lines = stdout.split('\n').slice(3, -2)
      let data = lines.map(line => {
        let split = line.split('|').slice(1, -1).map(x => x.trim())
        let traveler = split[0]
        let name = split[1].split('"')[1]
        let age = parseFloat(split[2].split('"')[1])
        return { traveler, name, age }
      })
      resolve(data)
    })
  })
}

async function rdf_query1 (commune) {
  let fontaines = await query1(commune)
  let rdf = header
  let geo_index = 0
  let fontaine_index = 0
  for (let fontaine of fontaines) {
    rdf += to_geopoint_rdf(geo_index, fontaine.latitude, fontaine.longitude)
    rdf += to_fontaine_rdf(fontaine_index, commune, fontaine.voie, fontaine.disponible, geo_index)
    geo_index += 1
    fontaine_index += 1
  }
  return rdf
}
function query1 (commune) {
  return new Promise((resolve) => {
    readFile('./queries/query1.rq', 'utf-8', (_, query) => {
      query = query.replace('#COMMUNE', commune)
      writeFile('./queries/tmp.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let fontaine = split[0]
            let voie = split[1]
            let disponible = split[2].split('"')[1]
            let latitude = parseFloat(split[3].split('"')[1])
            let longitude = parseFloat(split[4].split('"')[1])
            return { fontaine, voie, disponible, latitude, longitude }
          })
          resolve(data)
        })
      })
    })
  })
}
function query1wifi (commune) {
  return new Promise((resolve) => {
    readFile('./queries/query1-wifi.rq', 'utf-8', (_, query) => {
      query = query.replace('#COMMUNE', commune)
      writeFile('./queries/tmpwifi.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmpwifi.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let wifi = split[0]
            let latitude = parseFloat(split[1].split('"')[1])
            let longitude = parseFloat(split[2].split('"')[1])
            return { wifi, commune: commune, latitude, longitude }
          })
          resolve(data)
        })
      })
    })
  })
}
function query1traveler (name) {
  return new Promise((resolve) => {
    readFile('./queries/query1-traveler.rq', 'utf-8', (_, query) => {
      query = query.replace('#NAME', name)
      writeFile('./queries/tmptraveler.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmptraveler.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let traveler = split[0]
            let name = split[1]
            let age = parseFloat(split[2].split('"')[1])
            return { traveler, name, age }
          })
          resolve(data)
        })
      })
    })
  })
}
function query1travel (date) {
  return new Promise((resolve) => {
    readFile('./queries/query1-travel.rq', 'utf-8', (_, query) => {
      query = query.replace('#DATE', date)
      writeFile('./queries/tmptravel.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmptravel.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let travel = split[0]
            let date = split[1]
            let traveler = split[2]
            let name = split[3]
            let wifi = split[4]
            let fontaine = split[5]
            return { travel, date, traveler, name, wifi, fontaine }
          })
          resolve(data)
        })
      })
    })
  })
}

function query2 (dispo) {
  return new Promise((resolve) => {
    readFile('./queries/query2.rq', 'utf-8', (_, query) => {
      query = query.replace('#DISPO', dispo)
      writeFile('./queries/tmp.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let fontaine = split[0]
            let commune = split[1].split('"')[1]
            let voie = split[2].split('"')[1]
            let latitude = parseFloat(split[3].split('"')[1])
            let longitude = parseFloat(split[4].split('"')[1])
            return { fontaine, commune, voie, disponible: dispo, latitude, longitude }
          })
          resolve(data)
        })
      })
    })
  })
}

function query3 () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query3.rq', (_, stdout) => {
      resolve(stdout)
    })
  })
}

function query3wifi () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query3-wifi.rq', (_, stdout) => {
      resolve(stdout)
    })
  })
}

function query4 (commune) {
  return new Promise((resolve) => {
    readFile('./queries/query4.rq', 'utf-8', (_, query) => {
      query = query.replace('#COMMUNE', commune)
      writeFile('./queries/tmp.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {
          resolve(stdout)
        })
      })
    })
  })
}

function query4 (commune) {
  return new Promise((resolve) => {
    readFile('./queries/query4.rq', 'utf-8', (_, query) => {
      query = query.replace('#COMMUNE', commune)
      writeFile('./queries/tmp.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {  
          let lines = stdout.split('\n').slice(3, -2)
          
          resolve(lines)
        })
      })
    })
  })
}

function queryoptwifi () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/queryop-wifi.rq', (_, stdout) => { 
      let lines = stdout.split('\n').slice(3, -2)
      let data = lines.map(line => {
        let split = line.split('|').slice(1, -1).map(x => x.trim())
        let wifi = split[0]
        let commune = split[1].split('"')[1]
        let latitude = parseFloat(split[2].split('"')[1])
        let longitude = parseFloat(split[3].split('"')[1])
        return { wifi, commune, latitude, longitude }
      })
      resolve(data)
    })
  })
}

// WEBSITE CODE
let app = express()
let port = 8080

app.use(express.static('website'))

app.get('/api/query0/rdf.ttl', async (req, res) => {
  let fontaines = await rdf_query0()
  res.header('Content-Type', 'text/turtle')
  res.send(fontaines)
})
app.get('/api/query0', async (req, res) => {
  let fontaines = await query0()
  res.json(fontaines)
})
app.get('/api/query0wifi', async (req, res) => {
  let wifis = await query0wifi()
  res.json(wifis)
})
app.get('/api/query0travel', async (req, res) => {
  let travels = await query0travel()
  res.json(travels)
})
app.get('/api/query0traveler', async (req, res) => {
  let travelers = await query0traveler()
  res.json(travelers)
})

app.get('/api/query1/:arrondissement/rdf.ttl', async (req, res) => {
  let fontaines = await rdf_query1(decodeURI(req.params.arrondissement))
  res.header('Content-Type', 'text/turtle')
  res.send(fontaines)
})
app.get('/api/query1/:arrondissement', async (req, res) => {
  let fontaines = await query1(decodeURI(req.params.arrondissement))
  res.json(fontaines)
})
app.get('/api/query1wifi/:arrondissement', async (req, res) => {
  let wifis = await query1wifi(decodeURI(req.params.arrondissement))
  res.json(wifis)
})
app.get('/api/query1traveler/:name', async (req, res) => {
  let travelers = await query1traveler(decodeURI(req.params.name))
  res.json(travelers)
})
app.get('/api/query1travel/:date', async (req, res) => {
  let travels = await query1travel(decodeURI(req.params.date))
  res.json(travels)
})

app.get('/api/query2/:dispo', async (req, res) => {
  let fontaines = await query2(decodeURI(req.params.dispo))
  res.json(fontaines)
})

app.get('/api/query3/rdf.ttl', async (req, res) => {
  let fontaines = await query3()
  res.header('Content-Type', 'text/turtle')
  res.send(fontaines)
})
app.get('/api/query3wifi/rdf.ttl', async (req, res) => {
  let wifis = await query3wifi()
  res.header('Content-Type', 'text/turtle')
  res.send(wifis)
})

app.get('/api/query4/:arrondissement', async (req, res) => {
  let fontaines = await query4(decodeURI(req.params.arrondissement))
  res.send(fontaines)
})

app.get('/api/queryoptwifi', async (req, res) => {
  let wifis = await queryoptwifi()
  res.send(wifis)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
