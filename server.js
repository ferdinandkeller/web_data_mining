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
function query0 () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query0.rq', (_, stdout) => {  
      let lines = stdout.split('\n').slice(3, -2)
      let data = lines.map(line => {
        let split = line.split('|').slice(1, -1).map(x => x.trim())
        let fontaine = split[0]
        let commune = split[1].split('"')[1]
        let disponible = split[2].split('"')[1]
        let latitude = parseFloat(split[3].split('"')[1])
        let longitude = parseFloat(split[4].split('"')[1])
        return { fontaine, commune, disponible, latitude, longitude }
      })
      resolve(data)
    })
  })
}

function query0_wifi () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query0_wifi.rq', (_, stdout) => {  
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

function query1_wifi (commune) {
  return new Promise((resolve) => {
    readFile('./queries/query1 wifi.rq', 'utf-8', (_, query) => {
      query = query.replace('#COMMUNE', commune)
      writeFile('./queries/tmp.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let wifi = split[0]
            let commune = split[1]
            let latitude = parseFloat(split[2].split('"')[1])
            let longitude = parseFloat(split[3].split('"')[1])
            return { fontaine, commune, latitude, longitude }
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

function query3_wifi () {
  return new Promise((resolve) => {
    exec('sparql --data=datasets/ttl/data.ttl --query=queries/query3_wifi.rq', (_, stdout) => {
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

function query4_wifi (commune) {
  return new Promise((resolve) => {
    readFile('./queries/query4 wifi.rq', 'utf-8', (_, query) => {
      query = query.replace('#COMMUNE', commune)
      writeFile('./queries/tmp.rq', query, () => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {
          resolve(stdout)
        })
      })
    })
  })
}

function queryOp_wifi () {
  return new Promise((resolve) => {
        exec('sparql --data=datasets/ttl/data.ttl --query=queries/queryOp_wifi.rq', (_, stdout) => {
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let wifi = split[0]
            let commune = split[1]
            let geopoint = split[2]
            return { fontaine, commune, geopoint }
          })
          resolve(data)
        })
  })
}
  


// WEBSITE CODE
let app = express()
let port = 8080

app.use(express.static('website'))

app.get('/api/query0', async (req, res) => {
  let fontaines = await query0()
  res.json(fontaines)
})

app.get('/api/wifi0', async (req, res) => {
  let wifis = await query0_wifi()
  res.json(wifis)
})

app.get('/api/query1/:arrondissement', async (req, res) => {
  let fontaines = await query1('PARIS ' + req.params.arrondissement.toString() + (req.params.arrondissement==1?'ER':'EME') +  ' ARRONDISSEMENT')
  res.json(fontaines)
})

app.get('/api/wifi1/:arrondissement', async (req, res) => {
  let wifis = await query1_wifi('PARIS ' + req.params.arrondissement.toString() + (req.params.arrondissement==1?'ER':'EME') +  ' ARRONDISSEMENT')
  res.json(wifis)
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

app.get('/api/wifi3/rdf.ttl', async (req, res) => {
  let wifis = await query3_wifi()
  res.header('Content-Type', 'text/turtle')
  res.send(wifis)
})

app.get('/api/query4/:arrondissement', async (req, res) => {
  let fontaines = await query4(decodeURI(req.params.arrondissement))
  res.send(fontaines)
})

app.get('/api/wifi4/:arrondissement', async (req, res) => {
  let wifis = await query4_wifi(decodeURI(req.params.arrondissement))
  res.send(wifis)
})

app.get('/api/list-wifi', async (req, res) => {
  let wifis = await queryOp_wifi()
  res.json(wifis)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
