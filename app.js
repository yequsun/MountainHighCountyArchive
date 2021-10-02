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
function main(req){
    if(req.hasmore != 1){
        return;
    }
    var offset = req.offset;
    const axios = require('axios');
    axios.get('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history',{
        params:{
            host_uid:682181583,
            offset_dynamic_id:offset
        }
    })
    .then(res => 
        {
            //console.log(res.data.data.cards)
            var dataArray = res.data.data.cards;
            dataArray = parseCards(dataArray);
            save2mongo(dataArray)

            .then(console.log)
            .catch(console.error)
            .finally(() => client.close())        })
    .catch(console.error)
    .finally();
}

function parseCards(dataArray){
    dataArray.forEach(record => {
        let parsed = JSON.parse(record.card);
        record.card = parsed;
    });
    return dataArray;
}

main();