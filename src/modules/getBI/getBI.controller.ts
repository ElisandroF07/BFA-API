import { Request, Response } from "express";
import { GetBIUseCase } from "./getBI.usecase";

export class GetBICOntroller {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	handle(request: Request, response: Response, data: any) {
		const useCase = new GetBIUseCase();
		useCase.execute(request, response);
	}
}
