import {Request, Response} from "express"
import { prismaClient } from "../../infra/database/prismaClient"
import { Prisma } from "@prisma/client";
import axios from "axios";

interface IFriend {
  personalData: Prisma.JsonValue | undefined;
  image: string | null | undefined;
  friendId: number;
  nickname: string | null | undefined;
  email: string | undefined;
}

export class GetFriendsUseCase {
  async getFriends(biNumber: string, response: Response) {
    try {
      const friends: IFriend[] = [];
      const self = await prismaClient.client.findFirst({ where: { bi_number: biNumber }, select: { client_id: true } });

      if (!self) {
        return response.status(404).json({ success: false, message: "Client not found" });
      }

      const friendList = await prismaClient.friends.findMany({ where: { client_id: self.client_id }, select: { friend_id: true, id: true, nickname: true } });

      for (const friend of friendList) {
        const client = await prismaClient.client.findFirst({ where: { client_id: friend.friend_id || 0 }, select: { personal_data: true, bi_number: true } });
        const pictureProfile = await axios.get(`${process.env.BASE_URL}/getProfilePicture/${client?.bi_number}`)
        const image = pictureProfile.data.imageUrl
        const emaill = await prismaClient.client_email.findFirst({where: {client_id: friend.friend_id}, select: {email_address: true}})
        const newFriend: IFriend = { personalData: client?.personal_data, image: image, friendId: friend.id, nickname: friend.nickname, email: emaill?.email_address };
        friends.push(newFriend);
      }

      return response.status(200).json({ success: true, friends, message: "" });
    } catch (error) {
      console.error("Error fetching friends:", error);
      return response.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async execute(request: Request, response: Response) {
    const biNumber = request.params.biNumber;
    await this.getFriends(biNumber, response);
  }
}
