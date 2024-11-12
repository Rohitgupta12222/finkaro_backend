
const express = require('express');
const Subscribe = require('../models/subscribeList.js');
const router = express.Router();

const sendsubscribemail = require('../mail/subscribeMail.js'); // Adjust path to your mailer file


router.post('/mail', async (req, res) => {
  console.log(req.body , '============ req.body 1');
  const { email, name ,subject ,contant} = req.body;
  
 
  try {

    const existingUser = await Subscribe.findOne({ email });
    if (existingUser) {
      console.log('exiestion user',existingUser);
      await sendsubscribemail(email, name,subject,contant);
      res.status(201).json({message:"Subscribe mail sended successfully"})
      console.log("Subscribe mail sended successfully")

    }else{
   data = req.body
   data.phoneNumber = contant
   console.log(data , 'request body ');

      const userData = new Subscribe(req.body)
     const response = await userData.save()
   
     await sendsubscribemail(email, name,subject,contant);
     res.status(201).json({message:"Subscribe mail sended successfully"})

      console.log("Subscribe mail sended successfully")

    }

  } catch (message) {

    console.log('message ', message);
    res.status(500).json({
      message: "internal Server message",
      message: message
    })
  }
}
)


module.exports = router;
