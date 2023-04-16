const { ObjectId } = require("mongodb")

async function signup(data, collection){
    const exist = await checkIfUserExistSignup(data, collection)

    if(exist === false){
        data['post'] = 'driver'
        data['workdays'] = []
        data['deliveries'] = []
        await collection.insertOne(data)
        return true
    }
    return false
}

async function checkIfUserExist(data, collection){
    const user = await collection.find({$or : [{username : data.username}, {email : data.username}]}).toArray()
    if(user.length > 0){
        return checkPassword(user, data)
    }
    return false;
}

async function checkIfUserExistSignup(data, collection){
    const user = await collection.find({$or : [{username : data.username}, {email : data.email}]}).toArray()
    if(user.length > 0){
        return true
    }
    return false;
}

function checkPassword(user, data){
    return user[0].password === data.password;
}

async function updateSignUpForm(data, collection){
    const user = await collection.find({'username' : data.name}).toArray()
    const updatedUser = {...user[0]}
    const newWorkday = []
    data.data.forEach(each =>  newWorkday.push(each))
    updatedUser.workdays = newWorkday
    await collection.updateOne({'username' : data.name}, {$set: updatedUser})
}

async function getWorkdays(name, collection){
    const user = await collection.find({'username':name}).toArray()
    if(user){
        return user[0]
    }else{
        return false
    }
}

async function updateDelivery(data, collection){
    const user = await collection.find({'username' : data.name}).toArray()
    const theData = await collection.find({$and: [{'deliveries.date' : data.data.date}, {'username' : data.name}]}).toArray()
    const updatedUser = {...user[0]}
    if (theData.length > 0){
        const theDeliveries = updatedUser.deliveries.find(each => each.date === data.data.date)
        theDeliveries.deliveries.push(data.data.deliveries[0])
        let newTotal = 0
        theDeliveries.deliveries.forEach(each => newTotal += each.total)
        theDeliveries.total = newTotal
        await collection.updateOne({'username' : data.name}, {$set:updatedUser})
    }else{
        data.data['total'] = 0
        updatedUser.deliveries.push(data.data)
        await collection.updateOne({'username' : data.name}, {$set:updatedUser})
    }
}

async function deleteDelivery(data, collection){
    const id = new ObjectId(data.id)
    const date = new Date
    const today = date.toISOString().slice(0, 10)
    await collection.updateOne({'_id':id, "deliveries":{$elemMatch:{'date':today}}}, {$pull : {'deliveries.$.deliveries':{'time':data.data.time}}})
    const user = await collection.find({'_id' : id}).toArray()
    const updatedUser = {...user[0]}
    const theDeliveries = updatedUser.deliveries.find(each => each.date === today)
    let newTotal = 0
    theDeliveries.deliveries.forEach(each => newTotal += each.total)
    theDeliveries.total = newTotal
    await collection.updateMany({'_id' : id}, {$set:updatedUser})
    return theDeliveries
    
}

async function checkUser(email, collection){
    const user = await collection.find({'email':email}).toArray()
    if(user.length < 1){
        return false
    }
    return true
}



module.exports = {
    signup,
    checkIfUserExist,
    checkIfUserExistSignup,
    updateSignUpForm,
    getWorkdays,
    updateDelivery,
    deleteDelivery,
    checkUser
}
