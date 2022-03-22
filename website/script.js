// create the default map
let map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([2.3522219, 48.856614]),
    zoom: 13
  })
})

// define styles
let on_style = new ol.style.Style({
  image: new ol.style.Circle({
    fill: new ol.style.Fill({
      color: 'rgba(1, 180, 215, 0.7)',
    }),
    radius: 8,
  })
})
let off_style = new ol.style.Style({
  image: new ol.style.Circle({
    stroke: new ol.style.Stroke({
      color: 'rgb(1, 180, 215, 0.7)',
      width: 3
    }),
    radius: 8,
  })
})

// add function for clearing layers
let current_layers = []
function clear_previous_layers() {
  for (let layer of current_layers) {
    map.removeLayer(layer)
  }
}

// define requests
async function query_all() {
  clear_previous_layers()

  let resp = await fetch('api/query0')
  let fontaines = await resp.json()
  
  let features = []
  for (let fontaine of fontaines) {
    let f = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([fontaine.longitude, fontaine.latitude])),
    })
    f.setStyle(fontaine.disponible == 'OUI' ? on_style : off_style)
    features.push(f)
  }
  
  var layer = new ol.layer.Vector({
    source: new ol.source.Vector({ features }),
  })
  map.addLayer(layer)
  current_layers.push(layer)
}

async function query_arr(arr) {
  clear_previous_layers()

  let resp = await fetch(`api/query1/${arr}`)
  let fontaines = await resp.json()
  
  let features = []
  for (let fontaine of fontaines) {
    let f = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([fontaine.longitude, fontaine.latitude])),
    })
    f.setStyle(fontaine.disponible == 'OUI' ? on_style : off_style)
    features.push(f)
  }
  
  var layer = new ol.layer.Vector({
    source: new ol.source.Vector({ features }),
  })
  map.addLayer(layer)
  current_layers.push(layer)
}

// interactive UI
let arr_in = document.getElementById('arr_in')
let arr_btn = document.getElementById('arr_btn')
arr_btn.addEventListener('click', () => {
  let arr = parseInt(arr_in.value)
  if (isNaN(arr) || arr < 0 || arr > 20) {
    query_all()
  } else {
    query_arr(arr)
  }
})

// load everything by default
query_all()