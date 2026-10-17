import jwt, { decode } from "jsonwebtoken";
import User  from '../models/user.model.js';

export const protectRoute = async(req, res, next) => {
try {
    const token = req.cookies.jwt
    if(!token){
        return res.status(401).json({message:  "Unauthoried - No Token Provider"});
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    // here token. change into , 

    if(!decoded) {
        return res.status(401).json({message:  "Unauthoried - Invalid Token"});
    }

    const user =  await User.findById(decoded.userId).select("-password");;   //here the user change into User 

    if(!user){
        return res.status(404).json({message: "User not found"});
    }

    req.user = user;
    next(); 



} catch (error) {
    console.log("Error in protectRoute Middleware:" , error.message);
    res.status(500).json({message: "Internal server error"})
    
}
}