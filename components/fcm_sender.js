var admin = require("firebase-admin");

var serviceAccount = require("../shoppingmate-652c6-firebase-adminsdk-j0nr3-084eeadcd5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const sendPush = function (infos) {
    if(infos == null || infos == undefined) {
        console.log('infos is null. So FCM not working');
        return;
    }

    console.log(infos);
    admin.messaging().send(infos)
    .then( response => {
        console.log(response);
    })
    .catch( err => {
        console.log(err)
    })
}

const sendPushMulti = function (infos) {
    if(infos == null || infos == undefined) {
        console.log('infos is null. So FCM not working');
        return;
    }
    
    console.log(infos);
    admin.messaging().sendMulticast(infos)
    .then( response => {
        console.log(response);
    })
    .catch( err => {
        console.log(err)
    })
}


module.exports = {
    sendPush: sendPush,
    sendPushMulti: sendPushMulti
}
