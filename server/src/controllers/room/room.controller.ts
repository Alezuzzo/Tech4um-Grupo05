import { Request, Response, NextFunction } from 'express'
import * as roomRepo from '../../repositories/room.repository'
import * as checksRepo from 'src/repositories/checks.repository'

export async function ctrlGetAllRooms(req: Request, res: Response, next: NextFunction){
    try {
        const allRooms = await roomRepo.repGetAllRooms()
        return res.json(allRooms)
    } catch (err){
        console.error(err);
        return res.status(500).json({message: "Erro ao buscar salas."})
    }
}

export async function ctrlGetRoomById(req: Request, res: Response, next: NextFunction){
    try {
        const roomId = req.params.id
        const foundRoom = await roomRepo.repGetRoomById(roomId)
        if (!foundRoom){
            res.status(404).json({message: "Sala não encontrada."})
        }
        return res.json(foundRoom)
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao buscar salas."})
    }
}

export async function ctrlNewRoom(req: Request, res: Response, next: NextFunction){
    try {    
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;

        const roomData = req.body;
        const newRoom = await roomRepo.repNewRoom({name: roomData.name, description: roomData.description, creatorId: userId})
        //adicionar criador à sala
        return res.status(201).json({
            message: "Sala criada",
            room: newRoom
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao criar sala."})
    }
}

export async function ctrlUpdateRoomInfo(req: Request, res: Response, next: NextFunction){
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;
        const roomId = req.params.id;

        // checa se o usuário é o criador da sala ou um admin
        if ((!(checksRepo.repIsRoomCreator(userId, roomId))) && (!(checksRepo.repIsAdmin(userId)))){
            return res.status(403).json({ message: "Ação não autorizada"})
        }
        const updatedData = req.body
        // remove campos proibidos
        delete updatedData.id
        delete updatedData.creatorId
        delete updatedData.createdAt
        delete updatedData.creator
        delete updatedData.messages
        delete updatedData.usersInRoom

        // atualiza a sala
        const updatedRoom = await roomRepo.repUpdateRoomInfo(roomId, updatedData)

        res.status(200).json({
            message: "Dados atualizados com sucesso.",
            room: updatedRoom
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao alterar sala."})
    }
}

export async function ctrlDeleteRoom(req: Request, res: Response, next: NextFunction){
    try{
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;
        const roomId = req.params.id;
        // checa se o usuário é o criador da sala ou um admin
        if ((!(checksRepo.repIsRoomCreator(userId, roomId))) && (!(checksRepo.repIsAdmin(userId)))){
            return res.status(403).json({ message: "Ação não autorizada"})
        }
        await roomRepo.repDeleteRoom(roomId)
        res.status(200).json({message: "Sala removida com sucesso"})
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao deletar sala."})
    }
}

export async function ctrlJoinRoom(req: Request, res: Response, next: NextFunction){
    try {
        if (!req.user){
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;
        const roomId = req.params.id;
        await roomRepo.repJoinRoom(userId, roomId)
        res.status(200).json({
            message: "Entrou na sala com sucesso."
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao entrar na sala."})
    }
}

export async function ctrlLeaveRoom(req: Request, res: Response, next: NextFunction){
        try {
        if (!req.user){
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;
        const roomId = req.params.id;
        await roomRepo.repLeaveRoom(userId, roomId)
        res.status(200).json({
            message: "Saiu da sala com sucesso."
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao sair da sala."})
    }
}
