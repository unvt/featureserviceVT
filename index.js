//modules
const fetch = require('node-fetch')
const config = require('config')
const fs = require('fs')

//parameters
const featureServer = config.get('url')
const layers = config.get('layers')
const layerId = config.get('layerId')
const layerRecord = config.get('layerRecord')
const outputText = config.get('outputText')
//var data = []
const stream = fs.createWriteStream(outputText)

//actual code
async function get_feature(url,layerName3){
    const res = await fetch(url)
    const esri = await res.json()
    let f = new Object()
    f.type = 'Feature'
    f.properties = {}
    f.geometry = {}
    f.geometry.coordinates = []
    f.tippecanoe = {}
    f.properties = esri.feature.attributes
    if(esri.feature.geometry.rings != undefined){
        if( esri.feature.geometry.rings.length != 1){
            f.geometry.type = 'MultiPolygon'
            for (let m in esri.feature.geometry.rings){
                f.geometry.coordinates[m] = []
                f.geometry.coordinates[m][0] = esri.feature.geometry.rings[m] //I am not quite sure
            }
        } else {
            f.geometry.type = 'Polygon'
            f.geometry.coordinates = esri.feature.geometry.rings
        }       
    } else if (esri.feature.geometry.paths != undefined) {
        if(esri.feature.geometry.paths.length != 1){
            f.geometry.type = 'MultiLineString'
            f.geometry.coordinates =esri.feature.geometry.paths
        } else {
            f.geometry.type = 'LineString'
            f.geometry.coordinates =esri.feature.geometry.paths[0]
        } 
    } else {
        if(esri.feature.geometry.points.length != 1) { //need to check this esry type name
            f.geometry.type = 'MultiPoint'
            f.geometry.coordinates = esri.feature.geometry.points
        } else {
            f.geometry.type = 'Point'
            f.geometry.coordinates = esri.feature.geometry.points[0]
        }
    }
    f.tippecanoe = {}
    f.tippecanoe.layer = layerName3 
    f.tippecanoe.maxzoom = 2
    f.tippecanoe.minzoom = 0
    delete f.properties.globalid  //delete unnnecesary attribution
    delete f.properties.globalid_1   //delete unnnecesary attribution
    delete f.properties.SHAPE__Length   //delete unnnecesary attribution
//    data.push(f)
    stream.write(JSON.stringify(f))
    stream.write(', \n')
}

async function get_feature_no_comma(url,layerName3){
    const res = await fetch(url)
    const esri = await res.json()
    let f = new Object()
    f.type = 'Feature'
    f.properties = {}
    f.geometry = {}
    f.geometry.coordinates = []
    f.tippecanoe = {}
    f.properties = esri.feature.attributes
    if(esri.feature.geometry.rings != undefined){
        if( esri.feature.geometry.rings.length != 1){
            f.geometry.type = 'MultiPolygon'
            for (let m in esri.feature.geometry.rings){
                f.geometry.coordinates[m] = []
                f.geometry.coordinates[m][0] = esri.feature.geometry.rings[m] //I am not quite sure
            }
        } else {
            f.geometry.type = 'Polygon'
            f.geometry.coordinates = esri.feature.geometry.rings
        }       
    } else if (esri.feature.geometry.paths != undefined) {
        if(esri.feature.geometry.paths.length != 1){
            f.geometry.type = 'MultiLineString'
            f.geometry.coordinates =esri.feature.geometry.paths
        } else {
            f.geometry.type = 'LineString'
            f.geometry.coordinates =esri.feature.geometry.paths[0]
        } 
    } else {
        if(esri.feature.geometry.points.length != 1) { //need to check this esry type name
            f.geometry.type = 'MultiPoint'
            f.geometry.coordinates = esri.feature.geometry.points
        } else {
            f.geometry.type = 'Point'
            f.geometry.coordinates = esri.feature.geometry.points[0]
        }
    }
    f.tippecanoe = {}
    f.tippecanoe.layer = layerName3 
    f.tippecanoe.maxzoom = 2
    f.tippecanoe.minzoom = 0
    delete f.properties.globalid  //delete unnnecesary attribution
    delete f.properties.globalid_1   //delete unnnecesary attribution
    delete f.properties.SHAPE__Length   //delete unnnecesary attribution
//    data.push(f)
    stream.write(JSON.stringify(f))
    stream.write('\n')
}

async function getlayer(layer,count,layerName2){
    for (var i = 1; i < count + 1; i ++){
        var featureUrl = featureServer + layer + '/' + i + '?f=pjson'
        await get_feature(featureUrl,layerName2)
    }
    console.log(`--- ${layerName2} finished on ${Date()}`)
}

async function getlayer_no_comma(layer,count,layerName2){
    for (var i = 1; i < count + 1; i ++){
        var featureUrl = featureServer + layer + '/' + i + '?f=pjson'
        if (i != count){
            await get_feature(featureUrl,layerName2)
        } else {
            await get_feature_no_comma(featureUrl,layerName2)
        }
    }
    console.log(`--- ${layerName2} finished on ${Date()}`)
}


async function main(){
    console.log('Starting the work!!!!!!')
    console.log(Date())
    console.log('----->')
    for ( var i in layers){
        if(i < layers.length - 1){
            await getlayer(layerId[layers[i]],layerRecord[layers[i]],layers[i])
        } else {
            await getlayer_no_comma(layerId[layers[i]],layerRecord[layers[i]],layers[i])
        }
    }
}

main().then(()=>{
    stream.end()
    console.log(`end!!! ${Date()}`)
    console.log('Good bye (^o^)/')
})

/*
async function main(){
    for (let layer in layers){
        let num = layerId[layers[layer]]
        let record = layerRecord[layers[layer]]
        let layerName1 = layers[layer]
        getlayer(num,10,layerName1).then(()=>{
 //       getlayer(num,record,layerName1).then(()=>{
        })
    }
}

main().then(()=>{
    stream.end()
    console.log('end!!! Bye-bye')
    console.log(Date())
})
*/

