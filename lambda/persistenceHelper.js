const AWS = require('aws-sdk');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');

const PersistanceAdapter = new ddbAdapter.DynamoDbPersistenceAdapter({
  tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
  createTable: false,
  dynamoDBClient: new AWS.DynamoDB({
    apiVersion: 'latest',
    region: process.env.DYNAMODB_PERSISTENCE_REGION,
  }),
});

const getParty = async (handlerInput) => {
  const attributesManager = handlerInput.attributesManager;

  // Check session before ddb
  const sessionAttributes = attributesManager.getSessionAttributes() || {};
  if (sessionAttributes?.party) {
    return sessionAttributes.party;
  }

  // Check ddb
  const attributes = (await attributesManager.getPersistentAttributes()) || {};

  return attributes?.party;
};

const setParty = async (handlerInput, party) => {
  const attributesManager = handlerInput.attributesManager;

  attributesManager.setPersistentAttributes({ party });
  await attributesManager.savePersistentAttributes();

  attributesManager.setSessionAttributes({ party });
};

module.exports = { PersistanceAdapter, getParty, setParty };
