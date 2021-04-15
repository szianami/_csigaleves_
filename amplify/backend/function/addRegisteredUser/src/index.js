/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_USERPROFILE_ARN
	STORAGE_USERPROFILE_NAME
Amplify Params - DO NOT EDIT */

const aws = require('aws-sdk');

exports.handler = async (event) => {
    
    let dynamoClient = new aws.DynamoDB();
    let date = new Date();
    
    let params = {
        Item: {   // item, amit a dynamoban el szeretnék menten
          'username': {S: event.userName },
          'id': {S: event.request.userAttributes.sub},
          'email': { S: event.request.userAttributes.email },
          'createdAt': { S: date.toISOString() },
          'updatedAt': { S: date.toISOString() },
        },
        TableName: 'User-d5p6uqeierdf5jrymwu6c222aa-' + process.env.ENV
    };

    // Call DynamoDB
    try {
        await dynamoClient.putItem(params).promise();
        console.info('User Profile creation successful!');
    } catch (err) {
        console.error('Error during saving profile!', err);
    }
    
    return event;
 
};
