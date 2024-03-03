import { Request, Response } from "express";
import { SetAccessCodeUseCase } from "./setAccessCode.usecase";

export class SetAcessCodeController {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	handle(data: any, response: Response) {
		const useCase = new SetAccessCodeUseCase();
		useCase.execute(data, response);
	}
}
