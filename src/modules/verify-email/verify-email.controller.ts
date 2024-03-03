import { Request, Response } from "express";
import { VerifyEmailUseCase } from "./verify-email.usecase";

export class VerifyEmailController {
	handle(response: Response, request: Request) {
		const useCase = new VerifyEmailUseCase();
		useCase.execute(response, request);
	}
}
