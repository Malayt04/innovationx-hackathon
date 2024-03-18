const Creator = require('../models/Creator');
const User=require('../models/User');


const dashboard = async (req, res) => {
    try {
        const sortedCreatorList = await Creator.find().sort({subscribers: -1}).limit(5);
        res.status(200).json(sortedCreatorList);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
}


const userDashboard = async(req,res)=>{
    const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (user) {
      const { userpassword, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
}

const buyStock = async(req,res)=>{
    const { id,creator } = req.params;
  

  try {
    const user = await User.findById(id);

    if (user) {
      user.myholdings.push(creator);
      await user.save();
  
      res.status(200).json(user);
     
    }
    else{
      return res.status(400).json({ error: 'Organisation not found' });
    }

  
  
  } catch (error) {
    res.status(400).json({error:error.message});
  }
}

module.exports ={userDashboard,buyStock,dashboard};