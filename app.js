const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'app'


async function save2mongo(dataArray){

    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('dynamics');
    const result = await collection.insertMany(dataArray);
    console.log(`${result.insertedCount} documents were inserted`);
    return 'done.';

}
function populate(req){
    if(req.hasmore != 1){
        return;
    }
    var offset = req.offset;
    var nextReq = {iter: req.iter};
    const axios = require('axios');
    axios.get('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history',{
        params:{
            host_uid:682181583,
            offset_dynamic_id:offset
        }
    })
    .then(res => 
        {   
            nextReq = {hasmore: res.data.data.has_more, offset : res.data.data.next_offset, iter: req.iter+1}
            //console.log(res.data.data.cards)
            var dataArray = res.data.data.cards;
            dataArray = parseCards(dataArray);
            save2mongo(dataArray)
            .then(console.log)
            .catch(console.error)
            .finally(() => client.close())})
    .catch(console.error)
    .finally(
        () => {
            console.log(offset);
            console.log(nextReq.iter);
            if(nextReq.offset == req.offset){
                return;
            }
            populate(nextReq);
        }
    );
    return;
}

function parseCards(dataArray){
    dataArray.forEach(record => {
        let parsed = JSON.parse(record.card);
        record.card = parsed;
    });
    return dataArray;
}

var req = {hasmore:1, offset:0, iter:0};
populate(req);

var last_dynamic_id;
var last_offset;

function update(lastId, lastOffset){
}

