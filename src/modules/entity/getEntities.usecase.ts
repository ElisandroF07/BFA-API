import { Request, Response } from "express";
import { prismaClient } from "../../infra/database/prismaClient";
import axios from "axios";

export class GetEntitiesUseCase {

    async getEntities(response: Response) {
        const entities = await prismaClient.entity.findMany()
        const token = await axios.get("http://localhost:5000/getAuthToken")
        const auth = `?Authorization=${token.data}`
        const entitiesWithAuthLogo = entities.map(entity => {
            return {
                ...entity,
                logo: `${entity.logo}${auth}`
            };
        });
        return response.status(200).json({success: true, entities: entitiesWithAuthLogo})
    }




    execute(request: Request, response: Response) {
        this.getEntities(response)
    }

}