import { Request, Response } from "express";
import { Verify2FAUseCase } from "./verify-2fa.usecase";

export class Verify2FAController {
	handle(response: Response, request: Request) {
		const useCase = new Verify2FAUseCase();
		useCase.execute(response, request);
	}
}
