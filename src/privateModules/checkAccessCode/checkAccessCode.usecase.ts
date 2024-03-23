import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs")

interface IData {
  accessCode: string,
  biNumber: string
}

export class CheckAccessCode {
  async check(data: IData, response: Response) {
    const client = await prismaClient.client.findFirst({where: {bi_number: data.biNumber}, select: {access_code: true}})
    if (await bcrypt.compare(data.accessCode, client?.access_code)) {
      return response.status(201).json({valid: true})
    }
    return response.status(201).json({valid: false})
  }

  execute(request: Request, response: Response) {
    this.check(request.body, response)
  }
}