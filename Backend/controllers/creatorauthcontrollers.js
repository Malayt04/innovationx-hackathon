const Creator = require('../models/Creator');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { creatoremail: '', creatorpassword: '' };

    if (err.message === 'Incorrect email') {
        errors.creatoremail = 'That email is incorrect';
    }

    if (err.message === 'Incorrect Password') {
        errors.creatorpassword = 'That password is incorrect';
    }

    if (err.code === 11000) {
        errors.creatoremail = 'That email is already registered';
        return errors;
    }

    if (err.message.includes('Creator validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'thala', {
        expiresIn: maxAge
    });
};

async function fetchChannelDataForLastNDays(channelId) {
  try {
    const today = new Date();

    const todayResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=AIzaSyCYP2If6bSVadtxtBVOYcS_X7R4-8Vfp5Y`);

    const todayViews = todayResponse.data.items[0].statistics.viewCount; 

    // Calculate yesterdayViews and dayBeforeYesterdayViews based on your logic (replace with your implementation)
    const yesterdayViews = 29256496000;
    const dayBeforeYesterdayViews = 29256494765;

    const c1 = yesterdayViews-dayBeforeYesterdayViews;
    const c2 = todayViews-yesterdayViews;

    const percentageChange=((c2-c1)/c1)* 100;
        console.log("todaya",todayViews);
        console.log("yesterday",yesterdayViews);

        return percentageChange;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed to fetch YouTube channel data');
  }
}

module.exports.creatorsignupget = (req, res) => {
    res.render('creatorsignup');
};

module.exports.creatorloginget = (req, res) => {
    res.render('creatorlogin');
};

const axios = require('axios');

module.exports.creatorsignuppost = async (req, res) => {
    const { creatorname, creatoremail, creatorchannelid, creatorchannelname, creatormetamaskid, creatorpassword } = req.body;
    console.log(creatorname, creatoremail, creatorchannelid, creatorchannelname, creatormetamaskid, creatorpassword)
    
    try {
        // Fetch views and subscribers count from the YouTube API
        const subscriberCount  = await fetchChannelData(creatorchannelid);
        const percentageChange = await fetchChannelDataForLastNDays(creatorchannelid);
        console.log("percentageChange:", percentageChange);

        

        const { tokens, pricepertoken } = calculateTokenAllocation(subscriberCount);
        
        
        let adjustedPricePerToken=pricepertoken;
        if (percentageChange > 0) {
            adjustedPricePerToken *= (1 + percentageChange / 100);
        } else if (percentageChange < 0) {
            adjustedPricePerToken *= (1 - Math.abs(percentageChange) / 100);
        }
        
        const percentagedeflection =(( adjustedPricePerToken - pricepertoken)/pricepertoken) * 100;
        console.log("percentagedeflection:", percentagedeflection)
        
        
        
        const creator = await Creator.create({ creatorname, creatoremail,creatorchannelid, creatorchannelname, creatormetamaskid, creatorpassword, tokens,adjustedPricePerToken,percentagedeflection, subscribers:subscriberCount });

        const newCreator = {
            creatorname: creator.creatorname,
            adjustedPricePerToken:creator.adjustedPricePerToken,
            tokens:creator.tokens,
            percentagedeflection:creator.percentagedeflection,
            createrchannelname:creator.creatorchannelname
        };
        
        
        res.status(201).render('creatordashboard', { creatorname: newCreator.creatorname, adjustedPricePerToken:newCreator.adjustedPricePerToken,  tokens:newCreator.tokens, percentagedeflection:newCreator.percentagedeflection, creatorchannelname:newCreator.creatorchannelname });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};





function calculateTokenAllocation(subscribers) {
    if (subscribers >= 5000 && subscribers < 10000) {
        return { tokens: 20, pricepertoken: 200 };
    } else if (subscribers >= 10000 && subscribers < 50000) {
        return { tokens: 80, pricepertoken: 400 };
    } else if (subscribers >= 50000 && subscribers < 100000) {
        return { tokens: 200, pricepertoken: 600 };
    } else if (subscribers >= 100000 && subscribers < 300000) {
        return { tokens: 1000, pricepertoken: 1000 };
    } else if (subscribers >= 300000 && subscribers < 500000) {
        return { tokens: 1000, pricepertoken: 1500 };
    } else if (subscribers >= 500000 && subscribers < 1000000) {
        return { tokens: 1500, pricepertoken: 2500 };
    } else if (subscribers >= 1000000 && subscribers < 5000000) {
        return { tokens: 2500, pricepertoken: 4000 };
    } else if (subscribers >= 5000000 && subscribers < 10000000) {
        return { tokens: 6000, pricepertoken: 6000 };
    } else if (subscribers >= 10000000) {
        return { tokens: 10000, pricepertoken: 10000 };
    } else {
        
        return { tokens: 0, pricepertoken: 1 };
    }
}

async function  fetchChannelData(channelId) {
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=AIzaSyCYP2If6bSVadtxtBVOYcS_X7R4-8Vfp5Y`);
        
        if (!response.data.items || !response.data.items.length) {
            throw new Error('Do not get response');
        }
        
        const subscriberCount = response.data.items[0].statistics.subscriberCount;
        
        return subscriberCount;
    } catch (err) {
        console.log(err)
        throw new Error('subscriber not found');
    }
}


module.exports.creatorloginpost = async (req, res) => {
    const { creatoremail, creatorpassword } = req.body;

    try {
        const creator = await Creator.creatorlogin(creatoremail, creatorpassword);
        if (!creator) {
            throw Error('Creator not found'); // Handle the case where creator is null
        }
        const token = createToken(creator._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ creator: creator._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.creatorlogoutget = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
};





module.exports.updateTokens = async (req, res) => {
    const { creatorchannelname } = req.params.creatorchannelname;
    const {quantity} = req.body;

    try {
        
        const creator = await Creator.findOne(creatorchannelname);

        if (!creator) {
            throw Error('Creator not found');
        }

        
        creator.tokens -= quantity;

       
        await creator.save();

        
        res.status(200).json(creator);
    } catch (err) {
        
        res.status(400).json({ error: err.message });
    }
};


//