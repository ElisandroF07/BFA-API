import { Request, Response } from "express";
import { VerifyResetUseCase } from "./verify-reset.usecase";

export class VerifyResetController {
	handle(request: Request, response: Response) {
		const useCase = new VerifyResetUseCase();
		useCase.execute(request, response);
	}
}
