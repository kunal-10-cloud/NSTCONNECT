require('dotenv').config(); 
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

function generateToken(userId){
    return jwt.sign({ userId}, JWT_SECRET, { expiresIn: '1d'})
}


function authMiddleware(req,res,next){
    const auth = req.headers['authorization'];
    if(!auth){
        return res.status(401).json({ message: 'Authorization header missing'});
    }
    try{
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch(err){
        return res.status(401).json({ message: 'Invalid token'});
    }
}

app.post('/api/signup', async (req,res)=>{
    const {name, email, password, department} = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10); 
        const user = await prisma.user.create({
            data: {name,
                email,
                password:hashed,
                department}
        })
        res.json(user)
    } catch{
        res.status(400).json({ error: "Email already exists" });
    }

})

app.post('/api/login', async (req,res) =>{
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({where: { email }})
    const valid = await bcrypt.compare(password, user.password); 

    if (!user || !valid){
        return res.status(401).json({ message: 'Invalid Credentials'})
    }
    const token = generateToken(user.id)
    res.json({ token })
})

app.get('/api/profile', authMiddleware, async(req,res)=>{
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {id: true, name:true, email:true, department:true}
    })
    res.json(user)
})

app.post('/api/friends/request/:receiverId', authMiddleware, async(req,res) => {
    const { receiverId } = req.params; 
    if (parse(req.userId) === receiverId){
        return res.status(400).json({ err: 'Cannot send request to yourself'})
    }

    const existing = await prisma.friendRequest.findFirst({
        where:{
            senderId: req.userId, 
            receiverId: parseInt(receiverId),
            status: 'PENDING'
        }
    });

    if (existing){
        return res.status(400).json({ err: 'Request already sent'})
    }

    const request = await prisma.friendRequest.create({
        data:{
            senderId: req.userId,
            receiverId: parseInt(receiverId)
        },
    });
    res.send(request)
})



app.post('/api/friends/accept/:requestId', authMiddleware, async(req,res)=>{
    const { requestId } = req.params; 
    const request = await prisma.friendRequest.findUnique({
        where: { id: parseInt(requestId) }
    });
    if(!request || request.receiverId !== req.userId){
        return res.status(400).json({ err: 'Invalid request'})
    }
    if (request.status !== 'PENDING'){
        return res.status(400).json({ err: 'Request already processed'})
    }

    await prisma.friendRequest.update({
        where: {id: request.id },
        data: {status: 'ACCEPTED'}
    })

    await prisma.friend.createMany({
        data:[
            { userId: request.senderId, friendId: request.receiverId },
            { userId: request.receiverId, friendId: request.senderId }
        ],
    });
    res.json({ message: 'Friend request accepted'})
})


app.get('/api/friends', authMiddleware, async(req,res)=>{
    const friends = await prisma.friend.findMany({
        where: {userId: req.userId},
        include: {friend: true}
    });
    res.json(friends.map(f=> f.friend))
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
