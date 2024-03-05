const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
const crypto = require('crypto');
function generateMD5Hash(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

// PUG 
app.set('view engine', 'pug'); // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Connect to MongoDB
mongoose.connect('mongodb://localhost/OCS_data', { useNewUrlParser: true, useUnifiedTopology: true });

// Define contact schema and model
const contactSchema = new mongoose.Schema({
    userid: String,
    password_hash: String,
});
const Contact = mongoose.model('Contact', contactSchema);

//END POINTS
app.post('/register', async (req, res) => {
    try {
        console.log("1");
        const { userid, password } = req.body;
        console.log(userid);
        const hashedPassword = generateMD5Hash(password);
        // Hash the password before saving it to databse
        const myData = new Contact({ userid, password_hash: hashedPassword });
        await myData.save();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/register', (req, res) => {
    const params = {};
    res.status(200).render('registeruser.pug', params);
});
// Login endpoint
app.get('/', async(req, res) => {
    const params = {};
    res.status(200).render('login.pug', params);
});

app.post('/', async (req, res) => {
    try {
        const { userid, password } = req.body;
        console.log(`Received request with id  : ${userid}`);
        // Find the user with the given phone number
        let user2 = await Contact.findOne({ userid : userid });
        
    if(!user2){
     user2 = await user.findOne({ userid : userid });
    }
   console.log('User found:', user2);
    if (user2) {
    console.log("User Exist");

    // Check if password matches 
    const checkPassword = generateMD5Hash(password);
    if (checkPassword == user2.password_hash) {
        console.log("Password is correct");
        // Authentication successful, redirect to success page
        if(user2.userid == "admin_test")
        {
            const users =  await Contact.find();
            return res.render('successadmin.pug', {users});
        }
        else
        return res.render('success.pug', {user2});
    } else {
        console.log("Password is incorrect");
        // Authentication failed, redirect to login page with error message
        return res.render('login.pug', { errorMessage: 'Invalid credentials' });
    }
} else {
    console.log("User does not exist");
    // User not found, redirect to login page with error message
    return res.render('login.pug', { errorMessage: 'Invalid credentials' });
}
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// START THE SERVER
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});