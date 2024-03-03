import { Request, Response } from "express";
import { GenerateCredentialsUseCase } from "./generateCredential.usecase";
export class GenerateCredentialsController {
	handle(request: Request, response: Response) {
		const useCase = new GenerateCredentialsUseCase();
		useCase.execute(request, response);
	}
}
