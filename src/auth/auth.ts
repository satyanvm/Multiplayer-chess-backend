import { Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '../constants';
const router = Router() 

// we will for now only allow guest endpoint- will add oauth later
// this route is to be hit when the user wants to login as a guest
router.post('/guest', async (req: Request, res: Response) => {
  const bodyData = req.body;
  let guestUUID = 'guest-' + uuidv4();  

  const user = await db.users.create({
    data: {
      username: guestUUID,
      email: guestUUID + '@chess100x.com',
      name: bodyData.name || guestUUID
        },
  });   

  const token = jwt.sign( 
    { userId: user.id, name: user.name },
    JWT_SECRET,
  ); 
  const UserDetails: any = {
    id: user.id,
    name: user.name!,
    token: token
  };
  res.cookie('guest', token);
  res.json(UserDetails);
}); 

export default router;
