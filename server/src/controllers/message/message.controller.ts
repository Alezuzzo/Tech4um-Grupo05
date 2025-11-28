import { Request, Response, NextFunction } from 'express'
import * as messageRepo from '../../repositories/message.repository'
import * as checksRepo from 'src/repositories/checks.repository'

export async function ctrlSendMessage(req: Request, res: Response, next: NextFunction){
    try{
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;

        // mensagem sem corpo/sala não é aceita, assim como mensagem privada sem remetente
        if (!req.body.roomId || !req.body.content || (req.body.isPrivate && !req.body.receiverId)) {
            res.status(402).json({message: "Erro na requisição ao servidor."})
        }
        const messageBody = req.body

        //remover campos inacessiveis e adicionar o id do usuário
        delete messageBody.id
        delete messageBody.createdAt
        delete messageBody.edited
        delete messageBody.sender
        delete messageBody.room
        messageBody.senderId = userId

        const sentMessage = await messageRepo.repSendMessage(messageBody)
         res.status(200).json({
            message: "Mensagem enviada",
            content: sentMessage
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao enviar mensagem."})
    }
}
export async function ctrlEditMessage(req: Request, res: Response, next: NextFunction){
    try{
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;

        // mensagem sem corpo não é aceita
        if (!req.body.content) {
            res.status(402).json({message: "Erro na requisição ao servidor."})
        }
        const messageId = req.body.messageId

        // somente quem enviou a mensagem original ou admins podem editar mensagens
        if ((!(checksRepo.repIsSender(userId, messageId))) || !(checksRepo.repIsAdmin(userId))){
            return res.status(403).json({ message: "Ação não autorizada"})
        }

        const messageBody = req.body.content

        const editedMessage = await messageRepo.repEditMessage(messageId, messageBody)
        res.status(200).json({
            message: "Mensagem editada",
            content: editedMessage
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao editar mensagem."})
    }
}
export async function ctrlRemoveMessage(req: Request, res: Response, next: NextFunction){
    try{
         if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;
        const messageId = req.body.messageId
        // somente quem enviou a mensagem original ou admins podem apagar mensagens
        if ((!(checksRepo.repIsSender(userId, messageId))) || !(checksRepo.repIsAdmin(userId))){
            return res.status(403).json({ message: "Ação não autorizada"})
        }
        await messageRepo.repDeleteMessage(messageId)
        res.status(200).json({
            message: "Mensagem removida"
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({message: "Erro ao remover mensagem."})
    }
}
export async function ctrlGetAllMessagesFromRoom(req: Request, res: Response, next: NextFunction){
    try {
        const roomId = req.params.id

        // se o usuário está autenticado, permite a ele ver as mensagens privadas enviadas a ele
        var allMessages: any = null
        if (!req.user){
            allMessages = await messageRepo.repGetAllMessagesFromRoom(roomId)
        }
        else {
            const userId = req.user.id
            allMessages = await messageRepo.repGetAllMessagesFromRoom(roomId, userId)
        }
        return res.json(allMessages)
    } catch (err){
        console.error(err);
        return res.status(500).json({message: "Erro ao buscar salas."})
    }
}

export async function ctrlGetAllPrivateMessages(req: Request, res: Response, next: NextFunction){
        try {
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;
        const otherUserId = req.params.id;
        const allMessages = await messageRepo.repGetPrivateConversation(userId, otherUserId)
        return res.json(allMessages)
    } catch (err){
        console.error(err);
        return res.status(500).json({message: "Erro ao buscar salas."})
    }
}
