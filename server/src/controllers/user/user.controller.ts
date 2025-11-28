import { Request, Response } from 'express';
import * as userRepo from '../../repositories/user.repository';
import  argon2  from 'argon2';


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
    delete updateData.password;
    delete updateData.createdAt;
    delete updateData.messages;
    delete updateData.createdRooms;
    delete updateData.joinedRooms;

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
    // Verifica se o usuário está autenticado (middleware autenticado)
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const userId = req.user.id;
    const { password } = req.body; // Pegamos a senha que o usuário passou no corpo da requisição

    if (!password) {
      return res.status(400).json({ message: "Senha é obrigatória para excluir a conta." });
    }

    // Busca o usuário no banco pelo ID
    const user = await userRepo.repGetUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Verifica se a senha atual é válida usando Argon2
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    // Se a senha estiver correta, apaga a conta do usuário
    await userRepo.repDeleteUser(userId);

    return res.status(200).json({ message: "Conta deletada com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao deletar usuário." });
  }
}

export async function ctrlUpdatePassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Preencha as duas senhas." });
    }

    const user = await userRepo.repGetUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // ✔ VERIFICAÇÃO COM ARGON2
    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) {
      return res.status(401).json({ message: "Senha atual incorreta." });
    }

    // ✔ HASH NOVO COM ARGON2
    const hashed = await argon2.hash(newPassword);

    await userRepo.repUpdateUser(userId, { password: hashed });

    return res.status(200).json({ message: "Senha atualizada com sucesso!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao atualizar senha." });
  }
}