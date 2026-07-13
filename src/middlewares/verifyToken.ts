import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/firebase.js";

const verifyToken = async (req:Request, res:Response, next:NextFunction)=>{
    try{
        const authHeader = req.headers.authorization;
        const idToken = authHeader?.split(' ')[1];
        if(!idToken){
            res.status(401).json({"message":"unauthorized"});
        }
        else{
            const decodedToken = await auth.verifyIdToken(idToken);
            req.uid = decodedToken.uid;
        }
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({'success':false,'error':'invalid or expired token!'});
    }
}

export default verifyToken;