import { Request, Response } from "express";
import { ResetAccessCodeUseCase } from "./resetAccessCode.usecase";

export class SetAcessCodeController {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	handle(data: any, response: Response) {
		const useCase = new ResetAccessCodeUseCase();
		useCase.execute(data, response);
	}
}
