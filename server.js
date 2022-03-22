const { exec } = require('child_process')
const { readFile, writeFile, readFileSync } = require('fs')
const express = require('express')

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
            let disponible = split[1].split('"')[1]
            let latitude = parseFloat(split[2].split('"')[1])
            let longitude = parseFloat(split[3].split('"')[1])
            return { fontaine, disponible, latitude, longitude }
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
            let disponible = split[2].split('"')[2]
            let latitude = parseFloat(split[3].split('"')[1])
            let longitude = parseFloat(split[4].split('"')[1])
            return { fontaine, commune, voie, disponible, latitude, longitude }
          })
          resolve(data)
        })
      })
    })
  })
}

function query3 () {
  return new Promise((resolve) => {
    readFile('./queries/query3.rq', 'utf-8', (_, query) => {
      //query = query.replace('#COMMUNE', commune)
      //writeFile('./queries/tmp.rq', query, () => {
        //exec('sparql --data=datasets/ttl/data.ttl --query=queries/tmp.rq', (_, stdout) => {  
          let lines = stdout.split('\n').slice(3, -2)
          let data = lines.map(line => {
            let split = line.split('|').slice(1, -1).map(x => x.trim())
            let fontaine = split[0]
            let commune = split[1].split('"')[1]
            let voie = split[2].split('"')[2]
            let disponible = split[3].split('"')[3]
            let latitude = parseFloat(split[4].split('"')[1])
            let longitude = parseFloat(split[5].split('"')[1])
            return { fontaine, commune, voie, disponible, latitude, longitude }
          })
          resolve(data)
        //})
      //})
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

// WEBSITE CODE
let app = express()
let port = 8080

app.use(express.static('website'))

app.get('/api/query0', async (req, res) => {
  let fontaines = await query0()
  res.json(fontaines)
})

app.get('/api/query1/:arrondissement', async (req, res) => {
  let fontaines = await query1('PARIS ' + req.params.arrondissement.toString() + (req.params.arrondissement==1?'ER':'EME') +  ' ARRONDISSEMENT')
  res.json(fontaines)
})

app.get('/api/query2/:dispo', async (req, res) => {
  let fontaines = await query2(req.params.dispo == 0 ? 'NON' : 'OUI')
  res.json(fontaines)
})

app.get('/api/query4/:arrondissement', async (req, res) => {
  let fontaines = await query4(req.params.arrondissement.toString())
  //let fontaines = await query4('PARIS ' + req.params.arrondissement.toString() + (req.params.arrondissement==1?'ER':'EME') +  ' ARRONDISSEMENT')
  res.json(fontaines)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
