import {Request, Response} from "express"

export class PayByReference {

  async pay(reference: string, accountNumber: string, response: Response) {
    const entity = 
  }

  execute(request: Request, response: Response) {
    const reference = request.body.reference 
    const accountNumber = request.body.accountNumber
    this.pay(reference, accountNumber, response)
  }

}