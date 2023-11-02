const express = require('express')
const app = express();
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const bodyParser = require('body-parser')//INCM REQ JSON FILE (JSON STRING) FORMAT CONVERT TO THE JS OBJECT.ITS ALSO A MIDDLE WARE FOR PARSING DATA
const port = process.env.PORT || 3000;
app.use(bodyParser.json())//THIS MIDDLEWARE HANDLES ALL INCMING JSON REQ PARSE TO JS OBJECT
app.set('view engine', 'ejs'); //VIEW ENGINE SET


//SETTING INITIAL HOME PAGE
app.set('views', path.join(__dirname, 'views')); //set the view index directory


//NEED TO CREATE A ROUTE TO RENDER INDEX PAGE
app.get('/', (req, res) => {
    const data = {
        pageTitle: "Express CRUD App",
        user:null
       
    }
    res.render('index', data)
})
//INDEX PAGE END




//POST METHORD .1ST DATA RECIVING FROM USER
app.post('/submit', (req, res) => {
    const userData = req.body //N0W IT CONTAIN DATA SENT BY CLIENT TO SERVER IN JS FORMAT
    console.log(userData);

    fs.readFile('data.json', 'utf8', (err, data) => {//USUALLY NODE READ FILE RETURN FILE AS BUFFEER SO IF WE WANT TO READ MENTION UTF8 TO USE AS STRING(TEXT). // WITHOUT MENTION UTF8 DEFUALT THIS.BUT GOOD IS MENTIONING UTF8 
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in reading data json`)
        } else {
            try {
                const existingData = JSON.parse(data);//PARSING WILL RETURN AS ARRAY SO NO NEED TO EXPLIXITY ASSIGN ARRAY 
                userData.id = existingData.length + 1;   //ASIGN ID NUMB TO OBJECT//ID ASSIGNED
                existingData.push(userData);//NOW USERDATA HAS ALL SETUP AND NEED TO PUSH IN EXISTING ARRAY

                //NEED TO WRITE THE EXISTING DATA VARIABLE ARRAY OBJECTS TO OUR DATA BASE
                fs.writeFile('data.json', JSON.stringify(existingData, null, 2), (writeError) => {//EXISTING DATA CNVRT TO STRINGYFIY FORMAT ITS LIKWE COMPRESSING THE WHOLW DATA,GET IT LIKE A SINGLE LINE OBJECTS
                    if (writeError) {
                        console.error("error in writing data json");
                        res.status(500).send(`error in writing data json`)
                    } else {
                        console.log("data writed successfully");
                        res.status(200).send(`data recived and saved in data base`)
                    }
                });
            } catch (error) {
                console.error("an error occure", error);
                res.status(500).send(`an error occured : ${error}`)
            }
        }
    })
})
//POST METHORD END




//TABLE VIEW ROUTER SET
app.get('/tableView', (req, res) => {
    res.render('table')
})
//TABLE VIEW ROUTER END




//GET METHORD TO FILL THE DATA IN TABLE
app.get('/userData', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in rerading data json`)
        } else {
            try {
                const existingData = JSON.parse(data);
                res.status(200).json(existingData)
            }
            catch (error) {
                console.error("an error occure", error);
                res.status(500).send(`an error occured : ${error}`)
            }
        }
    })
})




//DLETE METHORD
app.delete('/deleteUser/:id', (req, res) => {
    const userId = parseInt(req.params.id);//THIS WILL FILTER MY PASSED ID VALUE
    console.log("THE ID NUMBER TO DELETE", userId);
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in reading data json`)
        } else {
            try {
                let existingData = JSON.parse(data) //PASRSED THE JSON DATA

                //NOW GOING TO FIND THE INDEX OF THE OBJECT TO CORRESPONDING ID THAT RECIEVED
                const index = existingData.findIndex(user => user.id === userId)//NOW IT WILL RETURN THE INDEX OF THAT OBJECT //IF THE ID NOT EXIST IT RETURNS THE VALUE =-1
                if (index !== -1) {//WHICH MEANS IT RETURN THE INDEX  NOW ,INDEX CONTAIN THE INDEX NUMBER OF THAT OBJECT
                    existingData.splice(index, 1)//IT WILL DELETE THAT OBJECT
                   console.log("after delt BEFORE PUSH" , existingData);
                //    for(var i=0;i<existingData.length;i++){
                //     existingData[i].id=i+1
                //    }
                //    console.log(existingData);
                existingData=existingData.map((obj,index)=> {
                    obj.id= index +1
                    return obj
                })
                   

                    //NOW EXISTING DATA CONTAIN THE UPDATED DATA BASE,SO NEED TO WRITE INTO DATA BASE
                    fs.writeFile('data.json', JSON.stringify(existingData, null, 2), writeError => {
                        if (writeError) {
                            console.error("error in writing data json");
                            res.status(500).send(`error in writing data json`)
                        } else {
                            console.log("data writed successfully");
                            res.status(200).send(`data recived and saved in data base`)
                        }
                    })
                } else {//if index=-1 MEANS IT CANT FIND THAT ID IN OUR DATA BASE
                    console.log(`the given user id ${userId} not found`);
                    res.status(404).send(`user id ${userId} not found`)
                }
            } catch (error) {
                console.error("an error occured", error);
                res.status(500).send(`an error occured ${error}`)
            }
        }
    })
})
//DELETE METHORD END



//MODIFY FUNCTION RENDER TO INDEX PAGE WITH PREVIOS VALUES FILLED
app.get('/modifyUserPage/:id',(req,res) => {
    const userId = parseInt(req.params.id);

    // Read data from the data.json file
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error in reading data.json");
            res.status(500).send(`Error in reading data.json`);
        } else {
            try {
                const existingData = JSON.parse(data);
                const user = existingData.find((user) => user.id === userId);

                if (user) {
                    res.render('index', { user })
                //    console.log(user);
                } else {
                    console.log(`User with ID ${userId} not found`);
                    res.status(404).send(`User with ID ${userId} not found`);
                }
            } catch (error) {
                console.error("An error occurred", error);
                res.status(500).send(`An error occurred: ${error}`);
            }
        }
    });

})
//MODIFY PAGE END





// UPDATE/MODIFY METHORD BY RECIEVING UPDATED DATA
app.put(`/modifyUser/:id`, (req, res) => {
    const userId = parseInt(req.params.id);
    console.log("THE ID NUMBER TO MODIFY", userId);
    const recievedData = req.body//NOW WE  GOT THE DATA FROM REQUEST 
    console.log("RECIEVED DATA TO MODIFY" + recievedData);

    //FIND WHICH OBJECT TO BE REPLACED BY SEARCHING RECIEVED ID
    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error("error in reading data json");
            res.status(500).send(`error in reading data json`)
        } else {
            try {
                const existingData = JSON.parse(data);//PARSED THE 
                const index = existingData.findIndex((user) => user.id === userId)//IF IT WILL FIND RETURN INDEX IF ITS NOT RETURN -1 VALUE
                if (index !== -1) {
                    existingData[index] = recievedData;

                    //NOW EXISTING DATA MODIFIED,NEED TO WRITE THIS IN OUR DATA BASE
                    fs.writeFile('data.json', JSON.stringify(existingData), writeError => {
                        if (writeError) {
                            console.error("error in writing data json");
                            res.status(500).send(`error in writing data json`)
                        } else {
                            console.log("data modified to json data base and writed successfully");
                            res.status(200).send("data modified successfully")
                        }
                    })

                } else {
                    console.log("recievd id index cant find");
                    res.status(404).send(`cant find the intex of id ${userId}`)
                }

            } catch (error) {
                console.error("an error occured", error);
                res.status(500).send(`an error occured due to ${error}`)
            }

        }
    })
})
//MODIFY FUNCTION END




app.listen(port, () => {
    console.log(`server is running port ${port}`);
})


