import { Request, Response, NextFunction } from 'express'
import * as roomRepo from '../repositories/room.repository'

export async function ctrlGetAllRooms(req: Request, res: Response, next: NextFunction){
    const allRooms = await roomRepo.repGetAllRooms()
    res.json(allRooms)
}

export async function ctrlGetRoomByName(req: Request, res: Response, next: NextFunction){
    const roomName = req.params.name
    const foundRoom = await roomRepo.repGetRoomByName(roomName)
    if (!foundRoom){
        res.sendStatus(404)
    }
    res.json(foundRoom)
}

export async function ctrlGetRoomById(req: Request, res: Response, next: NextFunction){
    const roomId = req.params.id
    const foundRoom = await roomRepo.repGetRoomByName(roomId)
    if (!foundRoom){
        res.sendStatus(404)
    }
    res.json(foundRoom)
}

export async function ctrlNewRoom(req: Request, res: Response, next: NextFunction){
    const {name, description} = req.body
    await roomRepo.repNewRoom({name, description})
    res.sendStatus(201)
}

export async function ctrlUpdateRoomInfo(req: Request, res: Response, next: NextFunction){
    const roomId = req.params.id
    const {name, description} = req.body
    await roomRepo.repUpdateRoomInfo(roomId, {name, description})
    res.sendStatus(201)
}

export async function ctrlDeleteRoom(req: Request, res: Response, next: NextFunction){
        const roomId = req.params.id
        await roomRepo.repDeleteRoom(roomId)
        res.sendStatus(204)
}