import './LoadEnv'; // Must be the first import
import Server from '@server';
import logger from '@shared/Logger';
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'white';
const client = new MongoClient(url);
const port = Number(process.env.PORT || 3000);

client.connect(async (err) => {
    if (err) throw (err)

    logger.info('Connected successfully to Mongo server');

    const db = client.db(dbName);

    const app = await Server(db)

    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });
});


