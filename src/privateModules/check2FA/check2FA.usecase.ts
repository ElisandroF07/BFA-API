import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
const bcrypt = require("bcryptjs")

export class Check2FA{

  async check(biNumber: string, otp: string, response: Response) {
    const client = await prismaClient.client.findFirst({where: {bi_number: biNumber}, select: {authentication_otp: true}})
    if (await bcrypt.compare(otp, client?.authentication_otp)) {
      return response.status(201).json({valid: true})
    }
    return response.status(200).json({valid: false})
  }

  execute(request: Request, response: Response) {
    const otp = request.params.otp
    const biNumber = request.params.biNumber
    this.check(biNumber, otp, response)
  }
}