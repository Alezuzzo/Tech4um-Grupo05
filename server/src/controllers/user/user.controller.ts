import { Request, Response } from 'express';
import * as userRepo from '../../repositories/user.repository';

export async function ctrlUpdateUserData(req: Request, res: Response) {
    try {
        //garante que req.user existe (middleware rodou)
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const userId = req.user.id;

        //não deixa alterar ID nem password por aqui
        const updateData = req.body;

        //limpar campos proibidos
        delete updateData.id;
        //impede alteração de senha por essa rota

        //atualiza usuário
        const updatedUser = await userRepo.repUpdateUser(userId, updateData);

        return res.status(200).json({
            message: "Dados atualizados com sucesso",
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro ao atualizar dados" });
    }
}


export async function ctrlDeleteUser(req: Request, res: Response) {
    try {
        //verifica login
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }

        //ID vem do token não da URL
        const userId = req.user.id;

        //apaga o usuário
        await userRepo.repDeleteUser(userId);

        return res.status(200).json({
            message: "Conta deletada com sucesso!"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro ao deletar usuário" });
    }
}
