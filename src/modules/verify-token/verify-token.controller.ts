import { Request, Response } from "express";
import { VerifyTokenUseCase } from "./verify-token.usecase";

export class VerifyTokenController {
	handle(response: Response, request: Request) {
		const useCase = new VerifyTokenUseCase();
		useCase.execute(response, request);
	}
}
